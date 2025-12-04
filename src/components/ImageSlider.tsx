// components/ImageSlider.tsx
"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Menu } from "@/types/model";

type PropsType = {
  images: string[]; 
  fallbackImagePath?: string; 
  cartItem: Menu;
};

const ImageSlider = ({ images, fallbackImagePath,cartItem }: PropsType) => {
  const { projectName } = useParams();
  const imgUrl = projectName ? `https://${projectName}.tsdsolution.net/assets/uploads/` : '';

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef<any>(null);

  // 🔁 Filter + Sort product images like "XXXX-1.webp", "XXXX_2.webp", "XXXX-3.webp"...
  const getSortedProductImages = (images: string[]) => {
    if (!images || images.length === 0) return [];

    // Filter out empty values and non-string values
    const validImages = images.filter((img) => typeof img === "string" && img.trim() !== "" && !Array.isArray(img));
    if (validImages.length === 0) return [];

    // Patterns
    const mainPattern = /[-_]main\.(webp|png|jpg|jpeg)$/i;
    const underscorePattern = /_\d+\.(webp|png|jpg|jpeg)$/i;
    const dashNumberPattern = /-\d+\.(webp|png|jpg|jpeg)$/i;

    // Separate images by pattern type
    const underscoreImages: string[] = [];
    const dashNumberImages: string[] = [];
    const mainImages: string[] = [];
    const otherImages: string[] = [];

    validImages.forEach((img) => {
      if (mainPattern.test(img)) {
        mainImages.push(img);
      } else if (underscorePattern.test(img)) {
        underscoreImages.push(img);
      } else if (dashNumberPattern.test(img)) {
        dashNumberImages.push(img);
      } else {
        otherImages.push(img);
      }
    });

    // Pattern 1: Images with underscore (e.g., "7567-1_1.webp", "7567-1_2.webp", "10313-1_9.webp")
    if (underscoreImages.length > 0) {
      // Group by prefix (everything before the underscore and number)
      const prefixGroups: { [key: string]: string[] } = {};
      
      underscoreImages.forEach((img) => {
        const match = img.match(/^(.+?)_\d+\.(webp|png|jpg|jpeg)$/i);
        if (match) {
          const prefix = match[1];
          if (!prefixGroups[prefix]) {
            prefixGroups[prefix] = [];
          }
          prefixGroups[prefix].push(img);
        }
      });

      // Find the largest group (most images with same prefix) - this handles the main product group
      let largestGroup: string[] = [];
      Object.keys(prefixGroups).forEach((prefix) => {
        if (prefixGroups[prefix].length > largestGroup.length) {
          largestGroup = prefixGroups[prefix];
        }
      });

      // Sort by number after underscore (numeric sort: 0, 1, 2, 3, ..., 9, 10, 11, 12, etc.)
      largestGroup.sort((a, b) => {
        const matchA = a.match(/_(\d+)\.(webp|png|jpg|jpeg)$/i);
        const matchB = b.match(/_(\d+)\.(webp|png|jpg|jpeg)$/i);
        const numA = matchA ? parseInt(matchA[1], 10) : 999999; // Put invalid matches at end
        const numB = matchB ? parseInt(matchB[1], 10) : 999999; // Put invalid matches at end
        return numA - numB;
      });

      const result = Array.from(new Set(largestGroup));
      // Include other images that don't match patterns
      const finalResult = otherImages.length > 0 ? [...result, ...otherImages] : result;
      console.log("=== Pattern 1 (underscore) Sorting ===");
      console.log("Original underscore images:", underscoreImages);
      console.log("Sorted pattern images:", result);
      console.log("Other images:", otherImages);
      console.log("Final result order:");
      finalResult.forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img}`);
      });
      return finalResult;
    }

    // Pattern 2: Images with dash-number pattern, possibly with main variant
    if (dashNumberImages.length > 0 || mainImages.length > 0) {
      // Group by prefix (everything before the dash and number/main)
      const prefixGroups: { [key: string]: string[] } = {};
      
      [...mainImages, ...dashNumberImages].forEach((img) => {
        const match = img.match(/^(.+?)[-_](main|\d+)\.(webp|png|jpg|jpeg)$/i);
        if (match) {
          const prefix = match[1];
          if (!prefixGroups[prefix]) {
            prefixGroups[prefix] = [];
          }
          prefixGroups[prefix].push(img);
        }
      });

      // Find the largest group (most images with same prefix) - this handles the main product group
      let largestGroup: string[] = [];
      Object.keys(prefixGroups).forEach((prefix) => {
        if (prefixGroups[prefix].length > largestGroup.length) {
          largestGroup = prefixGroups[prefix];
        }
      });

      // Sort: main first (if exists), then by number after dash (numeric sort: 0, 1, 2, 3, ..., 9, 10, 11, 12, etc.)
      largestGroup.sort((a, b) => {
        const isMainA = mainPattern.test(a);
        const isMainB = mainPattern.test(b);
        
        // Main images come first (if main exists)
        if (isMainA && !isMainB) return -1;
        if (!isMainA && isMainB) return 1;
        
        // Both are main or both are not main - sort by number
        const matchA = a.match(/-(\d+)\.(webp|png|jpg|jpeg)$/i);
        const matchB = b.match(/-(\d+)\.(webp|png|jpg|jpeg)$/i);
        const numA = matchA ? parseInt(matchA[1], 10) : 999999; // Put invalid matches at end
        const numB = matchB ? parseInt(matchB[1], 10) : 999999; // Put invalid matches at end
        return numA - numB;
      });

      const result = Array.from(new Set(largestGroup));
      // Include other images that don't match patterns
      const finalResult = otherImages.length > 0 ? [...result, ...otherImages] : result;
      console.log("=== Pattern 2 (dash-number) Sorting ===");
      console.log("Main images:", mainImages);
      console.log("Dash-number images:", dashNumberImages);
      console.log("Sorted pattern images:", result);
      console.log("Other images:", otherImages);
      console.log("Final result order:");
      finalResult.forEach((img, idx) => {
        console.log(`  ${idx + 1}. ${img}`);
      });
      return finalResult;
    }

    // If no sequential images, return all valid images
    return Array.from(new Set(validImages));
  };

  // Memoize the sorted images to ensure stable ordering
  const imagesToDisplay = useMemo(() => {
    console.log("=== Starting Image Sort ===");
    console.log("Input images array:", images);
    const orderedImages = getSortedProductImages(images);
    const result = orderedImages.length > 0 ? orderedImages : (cartItem?.imagePath ? [cartItem.imagePath] : []);
    console.log("=== Final imagesToDisplay ===");
    console.log("Total images:", result.length);
    console.log("Images in display order:");
    result.forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img}`);
    });
    return result;
  }, [images, cartItem?.imagePath]);

  // Effect to verify and update Swiper when images change
  // MUST be called before any early returns (Rules of Hooks)
  useEffect(() => {
    if (swiperRef.current && imagesToDisplay.length > 0) {
      console.log("=== useEffect: Updating Swiper ===");
      console.log("Current active index:", swiperRef.current.activeIndex);
      console.log("Images to display:", imagesToDisplay);
      // Force Swiper to update and rebuild slides in correct order
      swiperRef.current.update();
      swiperRef.current.updateSlides();
      swiperRef.current.slideTo(0, 0); // Go to first slide immediately
      console.log("Swiper updated and moved to slide 0");
    }
  }, [imagesToDisplay]);

  // If no images at all, still show the fallback image if available
  if (imagesToDisplay.length === 0 && cartItem?.imagePath) {
    return (
      <div className="relative w-full">
        <div className="w-full rounded-xl overflow-hidden bg-white h-[350px]">
          <Image
            className="w-full h-full object-contain"
            src={cartItem?.imagePath ? `${imgUrl}${cartItem.imagePath}` : '/images/placeholder.png'}
            alt=""
            width={450}
            height={350}
          />
        </div>
      </div>
    );
  }

  // If no images at all, don't render anything
  if (imagesToDisplay.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {/* Custom Prev Button - Only show if more than 1 image */}
      {imagesToDisplay.length > 1 && (
        <div
          ref={prevRef}
          className="absolute z-10 top-1/2 left-2 transform -translate-y-1/2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-7 h-7 fill-current text-gray-600 hover:text-black"
          >
            <path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273c-9.4-9.4-9.4-24.6 0-33.9L271 135z" />
          </svg>
        </div>
      )}

      {/* Custom Next Button - Only show if more than 1 image */}
      {imagesToDisplay.length > 1 && (
        <div
          ref={nextRef}
          className="absolute z-10 top-1/2 right-2 transform -translate-y-1/2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w-7 h-7 fill-current text-gray-600 hover:text-black"
          >
            <path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM241 377c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l87-87-87-87c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L345 239c9.4 9.4 9.4 24.6 0 33.9L241 377z" />
          </svg>
        </div>
      )}

      {/* Swiper Carousel */}
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          console.log("=== Swiper Initialized ===");
          console.log("Total slides:", swiper.slides.length);
          console.log("Active slide index:", swiper.activeIndex);
          console.log("Slide order check:");
          swiper.slides.forEach((slide: any, idx: number) => {
            const imgSrc = slide.querySelector('img')?.src || 'no image';
            console.log(`  Slide ${idx}: ${imgSrc}`);
          });
          // Ensure Swiper starts at the first slide
          setTimeout(() => {
            swiper.slideTo(0, 0);
            console.log("Swiper forced to slide 0");
          }, 100);
        }}
        spaceBetween={30}
        centeredSlides={false}
        initialSlide={0}
        loop={false}
        allowSlidePrev={imagesToDisplay.length > 1}
        allowSlideNext={imagesToDisplay.length > 1}
        key={`swiper-${imagesToDisplay.length}-${imagesToDisplay[0] || 'empty'}`}
        autoplay={
          imagesToDisplay.length > 1
            ? {
                delay: 7000,
                disableOnInteraction: false,
              }
            : false // Disable autoplay if only one image
        }
        pagination={
          imagesToDisplay.length > 1
            ? {
                clickable: true,
                renderBullet: (index, className) =>
                  `<span class="${className} bg-orange-500"></span>`,
              }
            : false // Disable pagination if only one image
        }
        navigation={
          imagesToDisplay.length > 1
            ? {
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }
            : false // Disable navigation if only one image
        }
        onBeforeInit={(swiper) => {
          if (
            imagesToDisplay.length > 1 &&
            swiper.params.navigation &&
            typeof swiper.params.navigation !== "boolean"
          ) {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        onInit={(swiper) => {
          // Ensure slides are in correct order after initialization
          console.log("=== Swiper onInit ===");
          console.log("Active index:", swiper.activeIndex);
          swiper.update();
          swiper.slideTo(0, 0);
          console.log("Swiper updated and moved to slide 0");
        }}
        onUpdate={(swiper) => {
          // Ensure we're on the first slide after update
          console.log("=== Swiper onUpdate ===");
          console.log("Active index:", swiper.activeIndex);
          if (swiper.activeIndex !== 0) {
            console.log("Active index is not 0, forcing to slide 0");
            swiper.slideTo(0, 0);
          }
        }}
        onSlideChange={(swiper) => {
          console.log("=== Swiper Slide Changed ===");
          console.log("Active index:", swiper.activeIndex);
          console.log("Previous index:", swiper.previousIndex);
          const currentSlide = swiper.slides[swiper.activeIndex];
          const imgSrc = currentSlide?.querySelector('img')?.src || 'no image';
          console.log("Current slide image:", imgSrc);
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper w-full rounded-xl overflow-hidden"
      >
        {imagesToDisplay.map((image, index) => {
          // Use index in key to ensure proper order, but make it unique
          console.log(`Rendering slide ${index + 1}/${imagesToDisplay.length}: ${image}`);
          return (
            <SwiperSlide key={`${image}-${index}`} className="w-full bg-white h-[350px]" data-swiper-slide-index={index}>
              <Image
                className="w-full h-full object-contain"
                src={`${imgUrl}${image}`}
                alt={`Image ${index + 1}: ${image}`}
                width={450}
                height={350}
                priority={index === 0}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ImageSlider;