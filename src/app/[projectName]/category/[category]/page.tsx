'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ImageSlider,
  NotFound,
  SearchBar,
  FilterBar,
  Menubar,
  SortBar,
  FilterInstock,
} from '@/components/';
import { Cart, Footer, Loading, PageNotFound, NavBar } from '@/components/core';
import axios from 'axios';
import { MenuType } from '@/types/model';
import { Provider } from 'react-redux';
import store from '@/lib/store';
import { useParams } from 'next/navigation';

function CategoryShow() {
  const { projectName, category } = useParams();
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false); // New loading state for filtering
  const ref = useRef<(HTMLDivElement | null)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<MenuType>([]);
  const [filteredMenu, setFilteredMenu] = useState<MenuType>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isNotFound, setNotFound] = useState(false);
  const [cur, setCur] = useState(null);
  const [openPanel, setOpenPanel] = useState<'filter' | 'sort' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{ [category: string]: boolean }>({});
  const [sortData, setSortData] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<number | undefined>(undefined);
  const [isInstockOnly, setIsInstockOnly] = useState(false);
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

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `https://${projectName}.tsdsolution.net/api/DriverController/setting`
        );
        const data = response.data;
        const correctedSlideShow = data.slide_Show.replace(/,\s*]$/, ']');
        const slideShowArray = JSON.parse(correctedSlideShow);
        setImages(slideShowArray);
        setCur(data.symbol);
      } catch (err) {
        console.log('Error fetching data', err);
      }
    };

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://${projectName}.tsdsolution.net/api/DriverController/GetAllProductWithCat`
        );

        const dataJson: MenuType = response.data;
        setData(dataJson);

        if (category) {
          const decodedCategoryId = decodeURIComponent(category as string);
          const exists = dataJson.some((cat) =>
            cat.items.some((item) => item.category_id === decodedCategoryId)
          );
          if (!exists) {
            setNotFound(true);
          } else {
            const index = dataJson.findIndex((cat) =>
              cat.items.some((item) => item.category_id === decodedCategoryId)
            );
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchImages();
    fetchData();
  }, [projectName, category]);

  // Enhanced filter handler with loading state
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

  useEffect(() => {
    const processFiltering = async () => {
      if (data.length > 0) {
        setFilterLoading(true);
      }

      let filteredItems = [...data];

      if (category) {
        const decodedCategoryId = decodeURIComponent(category as string);
        filteredItems = filteredItems.filter((cat) =>
          cat.items.some((item) => item.category_id === decodedCategoryId)
        );
      }

      filteredItems = filteredItems.map((cat) => ({
        category: cat.category,
        items: cat.items
          .filter((item) => {
            const matchesCategory =
              !category || item.category_id === decodeURIComponent(category as string);

            const matchesSearch =
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.code.toString().toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStock = isInstockOnly
              ? !isNaN(parseFloat(item.quantity)) && parseFloat(item.quantity) > 0
              : true;

            let matchesPrice = true,
              matchesPieces = true,
              matchesAge = true;

            if (filters.price && filters.price.length > 0) {
              const price = item.price;
              matchesPrice = filters.price.some((priceFilter) => {
                switch (priceFilter) {
                  case '$0 - $49.99':
                    return price >= 0 && price <= 49.99;
                  case '$50 - $99.99':
                    return price >= 50 && price <= 99.99;
                  case '$100+':
                    return price >= 100;
                  default:
                    return true;
                }
              });
            }

            if (filters.pieces && filters.pieces.length > 0) {
              const pieces = item.pieces;
              matchesPieces = filters.pieces.some((pieceFilter) => {
                switch (pieceFilter) {
                  case '0 - 99':
                    return pieces >= 0 && pieces <= 99;
                  case '100 - 499':
                    return pieces >= 100 && pieces <= 499;
                  case '500 - 999':
                    return pieces >= 500 && pieces <= 999;
                  case '1000+':
                    return pieces >= 1000;
                  default:
                    return true;
                }
              });
            }

            if (filters.age && filters.age.length > 0) {
              const age = parseInt(item.age.split('-')[0], 10);
              matchesAge = filters.age.some((ageFilter) => {
                switch (ageFilter) {
                  case '0 - 6':
                    return age >= 0 && age <= 6;
                  case '6 - 9':
                    return age >= 6 && age <= 9;
                  case '10 - 17':
                    return age >= 10 && age <= 17;
                  case '18+':
                    return age >= 18;
                  default:
                    return true;
                }
              });
            }

            return matchesCategory && matchesSearch && matchesStock && matchesPrice && matchesPieces && matchesAge;
          })
          .sort((a, b) => {
            const priceA = a.price,
              priceB = b.price,
              piecesA = a.pieces,
              piecesB = b.pieces,
              dateA = a.created_at,
              dateB = b.created_at;

            switch (sortData) {
              case 'Price: Low to High':
                return priceA - priceB;
              case 'Price: High to Low':
                return priceB - priceA;
              case 'Piece count: Low to High':
                return piecesA - piecesB;
              case 'Piece count: High to Low':
                return piecesB - piecesA;
              case 'Newest':
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              default:
                return 0;
            }
          }),
      }))
      .filter((cat) => cat.items.length > 0);

      setFilteredMenu(filteredItems);
      
      // Turn off loading after processing is complete
      setFilterLoading(false);
    };

    processFiltering();
  }, [data, searchQuery, sortData, isInstockOnly, filters, category]);

  useEffect(() => {
    if (category && !isInstockOnly) {
      setShowFilters(true); 
    }
  }, [category, isInstockOnly]);

  useEffect(() => {
    if (isShowAll && !hasShownAllOnce) {
      setHasShownAllOnce(true);
    }
  }, [isShowAll, hasShownAllOnce]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current || firstScrollDone.current) return;
      const offsets = ref.current.map((el) =>
        el ? el.getBoundingClientRect().top : Infinity
      );
      const current = offsets.findIndex((top) => top > 100);
      setActiveSection(current === -1 ? filteredMenu.length - 1 : Math.max(0, current - 1));
    };

    const scrollContainer = document.getElementById('scroll-container');
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [filteredMenu]);

  useEffect(() => {
    if (!isInstockOnly) {
      if (!category) {
        setActiveSection(undefined);
      }
    }
  }, [isInstockOnly, category]);

   const handleBackClick = () => {
    setIsInstockOnly((prev) => !prev);
  };


  if (isNotFound) {
    return <PageNotFound error="404 Page Not Found" />;
  }

  if (loading) {
    return (
      <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center left-0" />
    );
  }

  return (
    <Provider store={store}>
      <div className="max-w-[575px] mx-auto overflow-auto h-screen" id="scroll-container">
        <div className="sticky top-0 z-[1000] max-w-[575px] mx-auto border-b-2">
          <NavBar title="" icons="" />
        </div>

        {!isInstockOnly && (
          <Menubar
            data={data}
            activeCategoryId={category as string}
            onToggleShowAll={setIsShowAll}
            onShowFilters={() => setShowFilters(true)}
          />
        )}

        <div className="flex px-3 border-b-2 mb-2">
          {isInstockOnly && (
           <button onClick={handleBackClick}
              className="text-[#343433] font-niradei text-[12px] me-2 flex items-center justify-center rounded-full cursor-pointer"
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
                    />
                    <SortBar
                      isOpen={openPanel === "sort"}
                      onToggle={() =>
                        setOpenPanel(openPanel === "sort" ? null : "sort")
                      }
                      sortData={sortData}
                      onSortChange={handleSortChange}
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

              <div>
                {isInstockOnly ? (
                  <div className="flex flex-wrap flex-row gap-y-6 justify-between mt-6">
                    {filteredMenu
                      .flatMap((category) =>
                        category.items.filter(
                          (item) =>
                            !isNaN(parseFloat(item.quantity)) && parseFloat(item.quantity) > 0
                        )
                      )
                      .map((item) => (
                        <Cart key={item.id} cartItem={item} isOrderPage={false} cur={cur} />
                      ))}
                  </div>
                ) : (
                  filteredMenu.map((filteredCategory, categoryIndex) => (
                    <div
                      key={categoryIndex}
                      ref={(el) => {
                        ref.current[categoryIndex] = el;
                      }}
                    >
                      <div className="flex gap-3 justify-center items-center mb-5 mt-5">
                        <div className="w-full h-[2px] rounded-full bg-gray-300"></div>
                        <h1 className="font-bold font-niradei text-[18px] text-nowrap max-[400px]:text-lg">
                          {filteredCategory.category}
                        </h1>
                        <div className="w-full h-[2px] rounded-full bg-gray-300"></div>
                      </div>

                      <div className="flex flex-wrap flex-row gap-y-6 justify-between mt-6">
                        {(expandedCategories[filteredCategory.category]
                          ? filteredCategory.items
                          : filteredCategory.items.slice()
                        ).map((item) => (
                          <Cart
                            key={item.id}
                            cartItem={item}
                            isOrderPage={false}
                            cur={cur}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <footer className="mt-16 pb-[30px]">
            {!isInstockOnly && filteredMenu.length === 0 && !filterLoading && <NotFound />}
            <Footer />
          </footer>
        </main>
      </div>
    </Provider>
  );
}

export default CategoryShow;        