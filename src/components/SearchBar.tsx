import React, { useState, useEffect, useRef } from "react";
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

  const imgUrl = `https://${projectName}.tsdsolution.net/assets/uploads/`;
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
  }, [projectName, hasLoadedProducts]);

  // Global search function
  const performGlobalSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const searchTerms = searchQuery
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);

    const filteredProducts = allProducts.filter((product) =>
      searchTerms.some(
        (term) =>
          product.name.toLowerCase().includes(term) ||
          product.code.toString().toLowerCase().includes(term) ||
          (product.categoryName &&
            product.categoryName.toLowerCase().includes(term))
      )
    );

    // Sort by relevance
    const sortedResults = filteredProducts.sort((a, b) => {
      const aNameMatch = a.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const bNameMatch = b.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      return a.name.localeCompare(b.name);
    });

    setSearchResults(sortedResults.slice(0, 8)); // Limit to 8
    setShowDropdown(true);
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    if (hasLoadedProducts) {
      performGlobalSearch(value);
    }
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setShowDropdown(false);
    router.push(`/${projectName}/product/${product.id}`);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  // Handle clear search
  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    searchInputRef.current?.focus();
  };

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

  // Highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full">
      <label className="input border-gray-300 h-[40px] mt-2 rounded-full flex items-center gap-1 w-full mb-3 relative bg-white shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-blue-300">
        <input
          ref={searchInputRef}
          type="text"
          className={`grow font-dmsans text-base sm:text-[13px] bg-transparent outline-none px-3 ${
            isLoading && !hasLoadedProducts
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
          style={{ fontSize: '16px' }} // Force 16px on all devices to prevent zoom
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() =>
            searchQuery && searchResults.length > 0 && setShowDropdown(true)
          }
          autoComplete="off"
          disabled={isLoading && !hasLoadedProducts}
        />

        {/* Loading Spinner */}
        {isLoading && !hasLoadedProducts && (
          <div className="mr-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

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
      {showDropdown && hasLoadedProducts && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-[1100] max-h-96 overflow-hidden"
        >
          {searchResults.length > 0 ? (
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
                    <div className="text-sm font-bold text-gray-90">
                      ${Number(product.price).toFixed(2)}
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