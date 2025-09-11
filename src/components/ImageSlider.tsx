// components/ImageSlider.tsx
"use client";

import React, { useRef } from "react";
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
  const imgUrl = `https://${projectName}.tsdsolution.net/assets/uploads/`;

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // 🔁 Filter + Sort product images like "XXXX_1.webp", "XXXX_2.webp"...
  const getSortedProductImages = (images: string[]) => {
    if (!images || images.length === 0) return [];

    // Filter out empty arrays and non-string values
    const validImages = images.filter((img) => 
      typeof img === 'string' && 
      img.trim() !== '' && 
      !Array.isArray(img)
    );

    if (validImages.length === 0) return [];

    // Check if images follow the pattern "XXXX_1.webp", "XXXX_2.webp"
    const sequentialImages = validImages.filter((img) => /_\d+\.(webp|png|jpg|jpeg)$/i.test(img));
    
    if (sequentialImages.length > 0) {
      // Dynamically extract the prefix from the first matching sequential image
      const prefixMatch = sequentialImages[0].match(/^(.+?)_\d+\.(webp|png|jpg|jpeg)$/i);
      const prefix = prefixMatch ? prefixMatch[1] : "";

      return sequentialImages
        .filter((img) => img.startsWith(prefix + "_"))
        .sort((a, b) => {
          const numA = parseInt(a.match(/_(\d+)\.(webp|png|jpg|jpeg)$/i)?.[1] || "0", 10);
          const numB = parseInt(b.match(/_(\d+)\.(webp|png|jpg|jpeg)$/i)?.[1] || "0", 10);
          return numA - numB;
        });
    }

    // If no sequential images, return all valid images (like "88888.png")
    return validImages;
  };

  const orderedImages = getSortedProductImages(images);
  
  // Use fallback image from cartItem.imagePath if no ordered images are available
  const imagesToDisplay = orderedImages.length > 0 ? orderedImages : (cartItem?.imagePath ? [cartItem.imagePath] : []);

  // If no images at all, still show the fallback image if available
  if (imagesToDisplay.length === 0 && cartItem?.imagePath) {
    // Render single fallback image without slider functionality
    return (
      <div className="relative w-full">
        <div className="w-full rounded-xl overflow-hidden bg-white h-[350px]">
          <Image
            className="w-full h-full object-contain"
            src={`${imgUrl}${cartItem.imagePath}`}
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
        spaceBetween={30}
        centeredSlides={true}
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
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper w-full rounded-xl overflow-hidden"
      >
        {imagesToDisplay.slice(0, 15).map((image, index) => {
          console.log("Image URL:", `${imgUrl}${image}`);
          return (
            <SwiperSlide key={index} className="w-full bg-white h-[350px]">
              <Image
                className="w-full h-full object-contain"
                src={`${imgUrl}${image}`}
                alt=""
                width={450}
                height={350}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ImageSlider;