"use client";
import { useEffect, useRef, useState } from "react";
import { MenuType } from "@/types/model";
import { useParams, useRouter } from "next/navigation";

interface MenubarProps {
  data: MenuType;
  activeCategoryId?: string;
  onToggleShowAll?: (value: boolean) => void;
  onShowFilters?: () => void;
  isLoading?: boolean;
}

// Define static categories configuration
const STATIC_CATEGORIES = [
  { label: "Best Selling", tag: "Best Selling" },
  { label: "New Arrivals", tag: "New Arrivals" },
  { label: "Coming Soon", tag: "Coming Soon" },
  { label: "Under $25", tag: "Under $25" },
  { label: "For Adults", tag: "For Adults" },
  { label: "For Boys", tag: "For Boys" },
  { label: "For Girls", tag: "For Girls" },
  { label: "Age under 10", tag: "Age under 10" },
] as const;

export default function Menubar({
  data,
  activeCategoryId,
  onToggleShowAll,
  onShowFilters,
  isLoading = false,
}: MenubarProps) {
  const [showAll, setShowAll] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [scrolled, setScrolled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const justClickedSeeAll = useRef(false);
  const { projectName, category } = useParams();
  const router = useRouter();

  // Decode the category parameter to handle spaces and special characters
  const decodedCategory = category ? decodeURIComponent(category as string) : '';

  // Wait for both static categories and dynamic data to be ready
  useEffect(() => {
    const waitForCategories = async () => {
      try {
        // Wait for dynamic data to be available and have items
        if (!data || data.length === 0 || isLoading) {
          setIsReady(false);
          return;
        }

        // Ensure all dynamic categories have valid items
        const validDynamicData = data.filter(item => 
          item.items && item.items.length > 0
        );

        // Static categories are always ready (they're hardcoded)
        const staticCategoriesReady = STATIC_CATEGORIES.length > 0;

        // Both static and dynamic data are ready
        if (staticCategoriesReady && validDynamicData.length > 0) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error preparing categories:', error);
        setIsReady(false);
      }
    };

    waitForCategories();
  }, [data, isLoading]);

  const toggleShowAll = () => {
    if (!isReady) return;
    
    const next = !showAll;
    setShowAll(next);
    onToggleShowAll?.(next);
    justClickedSeeAll.current = true;
    setTimeout(() => {
      justClickedSeeAll.current = false;
    }, 500);
  };

  useEffect(() => {
    onToggleShowAll?.(showAll);
  }, [onToggleShowAll, showAll]);

  useEffect(() => {
    const scrollContainer = document.getElementById("scroll-container");

    const handleResize = () => {
      const width = scrollContainer?.clientWidth || window.innerWidth;
      setWindowWidth(width);
    };

    const handleScroll = () => {
      const scrollTop = scrollContainer?.scrollTop || window.scrollY;
      setScrolled(scrollTop > 0);
    };

    handleResize();
    handleScroll();

    scrollContainer?.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    if (!scrollContainer) window.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (!scrollContainer) window.removeEventListener("scroll", handleScroll);
    };
  }, [showAll]);

  const getItemsPerThreeRows = () => {
    if (scrolled) {
      if (windowWidth <= 320) return 1;
      if (windowWidth <= 360) return 2;
      if (windowWidth <= 390) return 2;
      if (windowWidth <= 420) return 3;
      if (windowWidth <= 480) return 3;
      if (windowWidth <= 575) return 4;
      return 7;
    } else {
      if (windowWidth <= 320) return 7;
      if (windowWidth <= 360) return 8;
      if (windowWidth <= 375) return 9;
      if (windowWidth <= 390) return 9;
      if (windowWidth <= 420) return 10;
      if (windowWidth <= 480) return 11;
      if (windowWidth <= 575) return 14;
      return 18;
    }
  };

  // Create static items
  const staticItems = STATIC_CATEGORIES.map((item) => ({
    type: "static" as const,
    label: item.label,
    tag: item.tag,
    path: `/staticcategory/${item.tag}`,
  }));

  // Create dynamic items (only if ready)
  const staticCategoryNames = new Set(STATIC_CATEGORIES.map(c => c.label.toLowerCase()));
  const dynamicItems = isReady
  ? Array.from(
      new Map(
        data
          .filter((item) => item.items.length > 0)
          // filter out any dynamic category that matches static label
          .filter((item) => !staticCategoryNames.has(item.category.toLowerCase()))
          .map((item) => [item.category, item]) // Map auto-deduplicates
      ).values()
    )
      .sort((a, b) => a.category.localeCompare(b.category))
      .map((item) => ({
        type: "dynamic" as const,
        data: item,
      }))
  : [];

  const allItems = [...staticItems, ...dynamicItems];
  const itemsPerThreeRows = getItemsPerThreeRows();
  
  const displayedItems = showAll
    ? allItems
    : allItems.slice(0, itemsPerThreeRows);

  const handleGetCategoryId = async (categoryId: string) => {
    if (!isReady) return;
    
    try {
      router.push(`/${projectName}/category/${encodeURIComponent(categoryId)}`);
      localStorage.setItem("setCategory", encodeURIComponent(categoryId));
    } catch (error) {
      console.error('Error navigating to category:', error);
    }
  };

  const handleStaticItemClick = async (tag: string) => {
    try {
      router.push(`/${projectName}/staticcategory/${encodeURIComponent(tag)}`);
      localStorage.setItem("setCategory", encodeURIComponent(tag));
      onShowFilters?.();
      if (showAll) {
        setShowAll(false);
        onToggleShowAll?.(false);
      }
    } catch (error) {
      console.error('Error navigating to static category:', error);
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="h-8 bg-gray-200 rounded-full animate-pulse"
          style={{ width: `${Math.random() * 60 + 80}px` }}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-[575px] sticky top-12 pt-1 z-50 bg-white">
      <div
        className={`px-2 py-2 transition-all duration-300 ${
          showAll ? "flex-wrap max-h-[60vh] overflow-y-auto" : ""
        }`}
      >
        {!isReady || isLoading ? (
          <LoadingSkeleton />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {displayedItems.map((item, index) => {
              if (item.type === "static") {
                // Compare the decoded category with the static item tag
                const isStaticActive = decodedCategory === item.tag;

                return (
                  <li
                    key={`static-${item.label}`}
                    onClick={() => handleStaticItemClick(item.tag)}
                    className={`font-dmsans cursor-pointer text-nowrap max-[500px]:text-[12px] text-[13px] py-[5px] px-3 w-fit rounded-full border-yellow-400 border-2 transition-colors duration-200 ${
                      isStaticActive
                        ? "text-[#343433] bg-[#fec10b]"
                        : "text-[#343433]"
                    }`}
                  >
                    {item.label}
                  </li>
                );
              } else {
                const menuItem = item.data;
                const itemCategoryId = menuItem.items[0]?.category_id;
                const isActive = activeCategoryId === itemCategoryId;

                return (
                  <li
                    key={menuItem.category}
                    onClick={() => {
                      if (itemCategoryId) {
                        handleGetCategoryId(itemCategoryId);
                        onShowFilters?.();
                        if (showAll) {
                          setShowAll(false);
                          onToggleShowAll?.(false);
                        }
                      }
                    }}
                    className={`font-dmsans cursor-pointer text-nowrap max-[500px]:text-[12px] text-[13px] py-[5px] px-3 w-fit rounded-full border-yellow-400 border-2 transition-colors duration-200 ${
                      isActive ? "text-[#343433] bg-[#fec10b]" : "text-[#343433]"
                    }`}
                  >
                    {menuItem.category}
                  </li>
                );
              }
            })}

            {allItems.length > itemsPerThreeRows && (
              <button
                onClick={toggleShowAll}
                disabled={!isReady}
                className={`font-dmsans cursor-pointer bg-[#fec10b] max-[500px]:text-[12px] text-[#343433] text-[13px] py-[5px] px-3 w-fit rounded-full border-yellow-400 border-2 transition-all duration-200 ${
                  !isReady ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {showAll ? "See Less" : "See All..."}
              </button>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}