"use client";
import {
  ImageSlider,
  NotFound,
  SearchBar,
  FilterBar,
  Menubar,
  SortBar,
  FilterInstock,
  
} from "@/components/";
import { Cart, Footer, Loading, PageNotFound, NavBar } from "@/components/core";
import BackToTop from "@/components/BackToTop";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Provider } from "react-redux";
import store from "@/lib/store";
import { MenuType } from "@/types/model";
import { useParams, useRouter } from "next/navigation";
import { retry } from "@reduxjs/toolkit/query";

export default function Home() {
  const { projectName } = useParams();
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();
  const ref = useRef<(HTMLDivElement | null)[]>([]); // Ref to store section elements
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState<MenuType>([]); // State for fetched data
  const [filteredMenu, setFilteredMenu] = useState<MenuType>([]); // State for filtered menu items
  const isOrderPage = false; // Flag for order page
  const [images, setImages] = useState<any[]>([]);
  const [isNotFound, setNotFound] = useState(false);
  const [cur, setCur] = useState(null);
  const [openPanel, setOpenPanel] = useState<"filter" | "sort" | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{
    [category: string]: boolean;
  }>({});
  const [sortData, setSortData] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<number>();
  const [isInstockOnly, setIsInstockOnly] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const firstScrollDone = useRef(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [filters, setFilters] = useState<{
    price: string[];
    pieces: string[];
    age: string[];
  }>({
    price: [],
    pieces: [],
    age: [],
  });
  const [isShowAll, setIsShowAll] = useState(false);
  const [hasShownAllOnce, setHasShownAllOnce] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `https://${projectName}.tsdsolution.net/api/DriverController/setting`
        );
        const data = response.data;
        console.log("Data fetched successfully", response.data);
        const correctedSlideShow = data.slide_Show.replace(/,\s*]$/, "]");
        const slideShowArray = JSON.parse(correctedSlideShow);
        setImages(slideShowArray);
        setCur(data.symbol);
      } catch (err) {
        console.log("Error fetching data", err);
      }
    };

    fetchImages();

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://${projectName}.tsdsolution.net/api/driverController/getallproductsnew`
        );

        const dataJson: MenuType = response.data;
        console.log("hello", dataJson);
        setData(dataJson); // Set fetched data
        setFilteredMenu(dataJson); // Initialize filteredMenu with fetched data

        if (dataJson.length == 0) {
          setNotFound(true);
        }
        setLoading(false); // Data fetched, set loading to false
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotFound(true);
        setLoading(false); // Error occurred, set loading to false
      }
    };

    fetchData();
  }, [projectName]); // Dependency array ensures fetch occurs when projectName changes

  useEffect(() => {
    const filteredItems = data
      .map((category) => ({
        category: category.category,
        items: category.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);

    setFilteredMenu(filteredItems);
  }, [searchQuery, data]);

  const handleSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSearchQuery(query);
    },
    []
  );

  const handleFilterChange = async (newFilters: {
    price: string[];
    pieces: string[];
    age: string[];
  }) => {
    setFilterLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setFilters(newFilters);
    setTimeout(() => setFilterLoading(false), 300);
  };

  const handleSortChange = async (newSortData: string | null) => {
    setFilterLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setSortData(newSortData);
    setTimeout(() => setFilterLoading(false), 300);
  };

 const handleInstockToggle = async () => {
  setFilterLoading(true);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  setIsInstockOnly((prev) => {
    const newValue = !prev;
    
    setFilters({
      price: [],
      pieces: [],
      age: [],
    });
    setSortData(null);
    setOpenPanel(null);
    
    setResetTrigger(prev => prev + 1);
    
    return newValue;
  });
  
  setTimeout(() => setFilterLoading(false), 300);
};

  const applyFiltersAndSorting = useCallback(() => {
    const filterAndSortItems = (items: (typeof data)[0]["items"]) => {
      return items
        .filter((item) => {
          const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code
              .toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          const matchesStock = isInstockOnly
            ? !isNaN(parseFloat(item.quantity)) && parseFloat(item.quantity) > 0
            : true;

          let matchesPrice = true;
          let matchesPieces = true;
          let matchesAge = true;

          const price = item.price;
          const pieces = item.pieces;
          const age = parseInt(item.age, 10);

          if (filters.price.length > 0) {
            matchesPrice = filters.price.some(priceRange => {
              switch (priceRange) {
                case "$0 - $49.99":
                  return price >= 0 && price <= 49.99;
                case "$50 - $99.99":
                  return price >= 50 && price <= 99.99;
                case "$100+":
                  return price >= 100;
                default:
                  return false;
              }
            });
          }

          // Handle multiple pieces filters
          if (filters.pieces.length > 0) {
            matchesPieces = filters.pieces.some(pieceRange => {
              switch (pieceRange) {
                case "0 - 99":
                  return pieces >= 0 && pieces <= 99;
                case "100 - 499":
                  return pieces >= 100 && pieces <= 499;
                case "500 - 999":
                  return pieces >= 500 && pieces <= 999;
                case "1000+":
                  return pieces >= 1000;
                default:
                  return false;
              }
            });
          }

          // Handle multiple age filters
          if (filters.age.length > 0) {
            matchesAge = filters.age.some(ageRange => {
              switch (ageRange) {
                case "0 - 5":
                  return age >= 0 && age <= 5;
                case "6 - 9":
                  return age >= 6 && age <= 9;
                case "10 - 17":
                  return age >= 10 && age <= 17;
                case "18+":
                  return age >= 18;
                default:
                  return false;
              }
            });
          }

          return (
            matchesSearch &&
            matchesStock &&
            matchesPrice &&
            matchesPieces &&
            matchesAge
          );
        })
        .sort((a, b) => {
          const priceA = a.price;
          const priceB = b.price;
          const piecesA = a.pieces;
          const piecesB = b.pieces;
          const dateA = a.created_at;
          const dateB = b.created_at;

          switch (sortData) {
            case "Price: Low to High":
              return priceA - priceB;
            case "Price: High to Low":
              return priceB - priceA;
            case "Piece count: Low to High":
              return piecesA - piecesB;
            case "Piece count: High to Low":
              return piecesB - piecesA;
            case "Newest":
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            default:
              return 0;
          }
        });
    };

    if (isInstockOnly) {
      // When showing in-stock only, flatten all products from all categories
      const allItems = data.flatMap(category => category.items);
      const filteredAndSorted = filterAndSortItems(allItems);
      
      // Remove duplicates based on item.id
      const uniqueItems = filteredAndSorted.filter((item, index, self) => 
        self.findIndex(i => i.id === item.id) === index
      );
      
      // Create a single "All In Stock" category
      setFilteredMenu([{
        category: "All In Stock",
        items: uniqueItems
      }]);
    } else {
      // Normal category-based filtering
      const grouped = data
        .map((category) => ({
          category: category.category,
          items: filterAndSortItems(category.items),
        }))
        .filter((cat) => cat.items.length > 0);

      setFilteredMenu(grouped);
    }
  }, [data, searchQuery, sortData, isInstockOnly, filters]);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [applyFiltersAndSorting]);

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    if (isShowAll && !hasShownAllOnce) {
      setHasShownAllOnce(true);
    }
  }, [isShowAll, hasShownAllOnce]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const offsets = ref.current.map((el) =>
        el ? el.getBoundingClientRect().top : Infinity
      );
      const current = offsets.findIndex((top) => top > 100);
      setActiveSection(
        current === -1 ? data.length - 1 : Math.max(0, current - 1)
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data]);

  useEffect(() => {
    if (!isInstockOnly) {
      setActiveSection(undefined);
    }
  }, [isInstockOnly]);

  const handleShowFilters = () => {
    setShowFilters(true); // Show the filter/sort section
  };

  const handleBackClick = () => {
    setIsInstockOnly((prev) => !prev);
  };

  const STATIC_CATEGORIES = [
    "Best Selling",
    "New Arrivals",
    "Coming Soon",
    "Under $25",
    "For Adults",
    // "For Boys",
    // "For Girls",
    "Age under 10",
  ];

  if (isNotFound) {
    return (
      <>
        <PageNotFound error="404 Page Not Found" />
      </>
    );
  }

  // Render loading indicator while fetching data
  if (loading) {
    return (
      <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center left-0" />
    );
  }

  return (
    <Provider store={store}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet"/>
      <div
        className="max-w-[575px] mx-auto overflow-auto h-screen"
        id="scroll-container"
      >
        <div className="sticky top-0 z-[1000] max-w-[575px] mx-auto border-b-2">
          <NavBar title="" icons="" />
        </div>
        {!isInstockOnly && (
          <Menubar
            data={data}
            onToggleShowAll={setIsShowAll}
            onShowFilters={handleShowFilters}
          />
        )}
        <div className="flex px-3 border-b-2 mb-2">
          {isInstockOnly && (
            <button
              onClick={handleBackClick}
              className="text-[#343433] font-dmsans text-[12px] me-2 flex items-center justify-center rounded-full cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-10 h-10"
              >
                <path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM116.7 244.7l112-112c4.6-4.6 11.5-5.9 17.4-3.5s9.9 8.3 9.9 14.8l0 64 96 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32l-96 0 0 64c0 6.5-3.9 12.3-9.9 14.8s-12.9 1.1-17.4-3.5l-112-112c-6.2-6.2-6.2-16.4 0-22.6z" />
              </svg>
            </button>
          )}
          <SearchBar query={searchQuery} />
        </div>

        <main className="top-3 h-full w-full max-w-[575px]">
          <section className="px-3">
            <div>
              <div className="flex">
                <div className="flex">
                  <FilterBar
                    isOpen={openPanel === "filter"}
                    onToggle={() =>
                      setOpenPanel(openPanel === "filter" ? null : "filter")
                    }
                    onFilterChange={handleFilterChange}
                    resetTrigger={resetTrigger}
                  />
                  <SortBar
                    isOpen={openPanel === "sort"}
                    onToggle={() =>
                      setOpenPanel(openPanel === "sort" ? null : "sort")
                    }
                    sortData={sortData}
                    onSortChange={handleSortChange}
                    resetTrigger={resetTrigger}
                  />
                </div>
                <FilterInstock
                  isInstockOnly={isInstockOnly}
                  onToggleInstock={handleInstockToggle}
                />
              </div>
              {/* Show loading overlay when filtering */}
              {filterLoading && (
                <Loading className="h-screen fixed w-full z-[1001] bg-white top-0 flex justify-center items-center left-0" />
              )}

              {/* Render categories with items only */}
              {isInstockOnly ? (
                <div className="flex flex-wrap flex-row gap-y-6 justify-between mt-6">
                  {filteredMenu
                    .flatMap((category) => category.items)
                    .filter((item, index, self) => 
                      self.findIndex(i => i.id === item.id) === index
                    )
                    .map((item) => (
                      <Cart
                        key={item.id}
                        cartItem={item}
                        isOrderPage={isOrderPage}
                        cur={cur}
                      />
                    ))}
                </div>
              ) : (
                // Sort categories: static categories first, then alphabetical
                [...filteredMenu]
                  .sort((a, b) => {
                    const aIsStatic = STATIC_CATEGORIES.includes(a.category);
                    const bIsStatic = STATIC_CATEGORIES.includes(b.category);
                    
                    // If both are static categories, sort by their order in STATIC_CATEGORIES
                    if (aIsStatic && bIsStatic) {
                      return STATIC_CATEGORIES.indexOf(a.category) - STATIC_CATEGORIES.indexOf(b.category);
                    }
                    
                    // If only 'a' is static, it comes first
                    if (aIsStatic && !bIsStatic) {
                      return -1;
                    }
                    
                    // If only 'b' is static, it comes first
                    if (!aIsStatic && bIsStatic) {
                      return 1;
                    }
                    
                    // If neither is static, sort alphabetically
                    return a.category.localeCompare(b.category);
                  })
                  .map((filteredCategory, categoryIndex) => {
                    const categoryItems = filteredCategory.items;

                    return (
                      <div
                        key={categoryIndex}
                        ref={(el) => {
                          ref.current[categoryIndex] = el;
                        }}
                      >
                        <div className="flex gap-3 justify-center items-center mb-5 mt-5">
                          <div className="w-full h-[2px] rounded-full bg-gray-300"></div>
                          <h1
                            id={`${filteredCategory.category}`}
                            className="font-bold font-dmsans text-[18px] text-nowrap max-[400px]:text-lg"
                          >
                            {filteredCategory.category}
                          </h1>
                          <div className="w-full h-[2px] rounded-full bg-gray-300"></div>
                        </div>

                        <div className="flex flex-wrap flex-row gap-y-6 justify-between mt-6">
                          {(expandedCategories[filteredCategory.category]
                            ? categoryItems
                            : categoryItems.slice(0, 4)
                          ).map((item, itemIndex) => (
                            <Cart
                              key={`${filteredCategory.category}-${item.id}-${itemIndex}`}
                              cartItem={item}
                              isOrderPage={isOrderPage}
                              cur={cur}
                            />
                          ))}
                        </div>

                        {categoryItems.length > 4 && (
                          <div className="w-full flex justify-center mt-4">
                            <button
                              onClick={() =>
                                toggleCategoryExpansion(
                                  filteredCategory.category
                                )
                              }
                              className="font-dmsans text-sm px-4 text-[13px] py-1 border border-yellow-400 bg-[#fec10b] rounded-full"
                            >
                              {expandedCategories[filteredCategory.category]
                                ? "See Less"
                                : "See All..."}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </section>
          <footer className="mt-16">
            {!isInstockOnly &&
              data.every((category) => {
                const filteredCategory = filteredMenu.find(
                  (cat) => cat.category === category.category
                );
                return filteredCategory
                  ? filteredCategory.items.length === 0
                  : true;
              }) && !filterLoading && <NotFound />}
            <Footer />
          </footer>
        </main>
      </div>

      <BackToTop />
    </Provider>
  );
}