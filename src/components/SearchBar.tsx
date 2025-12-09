import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/components/context/LanguageContext";
import axios from "axios";
import Image from "next/image";

// Product interface based on your data structure
interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  quantity: string;
  pieces: number;
  age: string;
  image: string;
  category_id: string;
  created_at: string;
  categoryName?: string;
  [key: string]: any;
}

interface Category {
  category: string;
  items: Product[];
}

type PropTypes = {
  query?: string;
  placeholder?: string;
};

export default function SearchBar({
  query = "",
  placeholder = "Search Here...",
}: PropTypes) {
  const { t } = useLanguage();
  const { projectName } = useParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Internal search state
  const [searchQuery, setSearchQuery] = useState(query);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchCacheRef = useRef<Map<string, Product[]>>(new Map());

  const imgUrl = `https://${projectName}.tsdsolution.net/assets/uploads/`;

  // Pre-process products for faster searching (create searchable strings)
  const processedProducts = useMemo(() => {
    return allProducts.map((product) => ({
      ...product,
      searchableName: product.name.toLowerCase(),
      searchableCode: product.code.toString().toLowerCase(),
      searchableCategory: (product.categoryName || "").toLowerCase(),
    })) as (Product & {
      searchableName: string;
      searchableCode: string;
      searchableCategory: string;
    })[];
  }, [allProducts]);
  // Fetch all products for global search on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      if (hasLoadedProducts) return; // Prevent multiple API calls

      try {
        setIsLoading(true);

        // Fetch from multiple endpoints to get all products
        const endpoints = [
          `https://${projectName}.tsdsolution.net/api/driverController/getallproductsnew`,
           `https://${projectName}.tsdsolution.net/api/DriverController/GetAllProductWithCat`,
        ];

        let allProductsData: Product[] = [];

        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(endpoint);
            const data = response.data;

            let products: Product[] = [];

            // If API returns category structured
            if (Array.isArray(data) && data[0]?.items) {
              products = (data as Category[]).flatMap((cat) =>
                cat.items.map((item) => ({
                  ...item,
                  categoryName: cat.category,
                }))
              );
            } else if (Array.isArray(data)) {
              // Fallback if API returns flat product array
              products = data.map((item: Product) => ({
                ...item,
                categoryName: "",
              }));
            }

            allProductsData = [...allProductsData, ...products];
          } catch (error) {
            console.warn(`Failed to fetch from ${endpoint}:`, error);
          }
        }

        // Remove duplicates based on product ID
        const uniqueProducts = allProductsData.filter(
          (product, index, self) =>
            index === self.findIndex((p) => p.id === product.id)
        );

        setAllProducts(uniqueProducts);
        setHasLoadedProducts(true);
        console.log("Global products loaded:", uniqueProducts.length);
      } catch (error) {
        console.error("Error fetching all products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectName) {
      fetchAllProducts();
    }

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [projectName, hasLoadedProducts]);

  // Optimized global search function with caching
  const performGlobalSearch = useCallback((searchQuery: string) => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    
    if (!trimmedQuery) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Check cache first
    if (searchCacheRef.current.has(trimmedQuery)) {
      const cachedResults = searchCacheRef.current.get(trimmedQuery)!;
      setSearchResults(cachedResults);
      setShowDropdown(true);
      return;
    }

    // Fast search using pre-processed data
    const searchTerms = trimmedQuery.split(" ").filter((term) => term.length > 0);
    const queryLower = trimmedQuery;

    // Use for loop for better performance than filter
    const results: Product[] = [];
    for (let i = 0; i < processedProducts.length && results.length < 20; i++) {
      const product = processedProducts[i];
      let matches = false;

      // Fast string matching
      if (product.searchableName.includes(queryLower) || 
          product.searchableCode.includes(queryLower)) {
        matches = true;
      } else if (searchTerms.length > 0) {
        // Multi-word search
        matches = searchTerms.every(
          (term) =>
            product.searchableName.includes(term) ||
            product.searchableCode.includes(term) ||
            product.searchableCategory.includes(term)
        );
      }

      if (matches) {
        results.push(product);
      }
    }

    // Sort by relevance (name matches first, then code matches)
    results.sort((a, b) => {
      const aNameStarts = a.searchableName.startsWith(queryLower);
      const bNameStarts = b.searchableName.startsWith(queryLower);
      const aNameContains = a.searchableName.includes(queryLower);
      const bNameContains = b.searchableName.includes(queryLower);
      const aCodeMatch = a.searchableCode.includes(queryLower);
      const bCodeMatch = b.searchableCode.includes(queryLower);

      // Priority: name starts > name contains > code match
      if (aNameStarts && !bNameStarts) return -1;
      if (!aNameStarts && bNameStarts) return 1;
      if (aNameContains && !bNameContains) return -1;
      if (!aNameContains && bNameContains) return 1;
      if (aCodeMatch && !bCodeMatch) return -1;
      if (!aCodeMatch && bCodeMatch) return 1;

      return a.name.localeCompare(b.name);
    });

    const finalResults = results.slice(0, 8);
    
    // Cache results (limit cache size to prevent memory issues)
    if (searchCacheRef.current.size > 50) {
      const firstKey = searchCacheRef.current.keys().next().value;
      searchCacheRef.current.delete(firstKey);
    }
    searchCacheRef.current.set(trimmedQuery, finalResults);

    setSearchResults(finalResults);
    setShowDropdown(true);
  }, [processedProducts]);

  // Auto-search when products finish loading if user was searching
  useEffect(() => {
    if (hasLoadedProducts && searchQuery.trim() && searchResults.length === 0) {
      // Products just loaded and user has a search query, perform search
      performGlobalSearch(searchQuery);
    }
  }, [hasLoadedProducts, searchQuery, performGlobalSearch, searchResults.length]);

  // Debounced search function - works even while products are loading
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Search will work once products are loaded, or queue the search
      if (hasLoadedProducts) {
        performGlobalSearch(query);
      } else {
        // If products not loaded yet, search will happen automatically once loaded
        // Just show a message or wait
        if (query.trim()) {
          setSearchResults([]);
          setShowDropdown(true);
        }
      }
    }, 150); // 150ms debounce for faster feel
  }, [hasLoadedProducts, performGlobalSearch]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    // Immediate UI update for empty query
    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      return;
    }

    debouncedSearch(value);
  }, [debouncedSearch]);

  // Handle product selection
  const handleProductSelect = useCallback((product: Product) => {
    setShowDropdown(false);
    router.push(`/${projectName}/product/${product.id}`);
  }, [projectName, router]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleProductSelect(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  }, [showDropdown, searchResults, selectedIndex, handleProductSelect]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    searchInputRef.current?.focus();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Optimized highlight matching text with memoization
  const highlightText = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Fast path: no match
    if (!textLower.includes(searchLower)) return text;
    
    // Escape special regex characters
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchLower ? (
        <mark key={index} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  return (
    <div className="relative w-full">
      <label className="input border-gray-300 h-[40px] mt-2 rounded-full flex items-center gap-1 w-full mb-3 relative bg-white shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-blue-300">
        <input
          ref={searchInputRef}
          type="text"
          className="grow font-dmsans text-base sm:text-[13px] bg-transparent outline-none px-3"
          style={{ fontSize: '16px' }} // Force 16px on all devices to prevent zoom
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            searchQuery && searchResults.length > 0 && setShowDropdown(true)
          }
          autoComplete="off"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-50 hover:opacity-70"
            >
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        )}

        {/* Search Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-6 w-6 opacity-30 mr-2"
        >
          <path
            fillRule="evenodd"
            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
            clipRule="evenodd"
          />
        </svg>
      </label>

      {/* Global Search Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-[1100] max-h-96 overflow-hidden"
        >
          {!hasLoadedProducts && searchQuery.trim() ? (
            <div className="p-4 text-center">
              <div className="text-gray-400 text-sm">
                Loading products...
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {/* Search Results Header */}
              <div className="px-4 py-2 bg-gray-50 border-b">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  All Products ({searchResults.length} found)
                </p>
              </div>

              {/* Products List */}
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((product, index) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedIndex === index
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                  >
                    {/* Product Image */}

                  {/* Product Image - FIXED VERSION */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <Image
                      src={`${imgUrl}${product.imagePath}`}
                      alt={product.name}
                      width={48}  // Add this - matches w-12 (48px)
                      height={48} // Add this - matches h-12 (48px)
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Optional: Handle broken images gracefully
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {highlightText(product.name, searchQuery)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery.trim() ? (
            <div className="p-4 text-center">
              <div className="text-gray-400 text-2xl mb-2">🔍</div>
              <p className="text-sm text-gray-600 mb-2">
                {`No products found for "${searchQuery}"`}
              </p>

              <p className="text-xs text-gray-500">
                Try different keywords or check spelling
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}