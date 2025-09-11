"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import "@/app/globals.css";
import { Menu } from "@/types/model";
import { addToCart } from "@/lib/cart/cartSlice";
import { RootState } from "@/lib/store";
import { useParams } from "next/navigation";
import numeral from "numeral";

type PropType = {
  cartItem: Menu;
  isOrderPage?: boolean;
  cur?:any
};


export default function Cart({ cartItem, isOrderPage , cur }: PropType) {
  const { id, name, imagePath, price, promo_price, code, type } = cartItem;
  const real_price = numeral(promo_price).format("0.00");
  const actual_price = numeral(price).format("0.00");

  const { projectName } = useParams();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  // Find existing item in cart to get its quantity
  const existingCartItem = cart.items.find((item) => item.id === id);
  const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;
  const [eachItemOrderNumber, setOrderItem] = useState(currentQuantity);
  // Base URL for image
  const imgUrl = `https://${projectName}.tsdsolution.net/assets/uploads/`;

  // Handle adding item to cart
  const handleOrder = () => {
    setOrderItem((prev) => prev + 1); // Increment local quantity state
    const cartData = {
      id,
      name,
      imagePath,
      price,
      quantity: eachItemOrderNumber + 1,
      promo_price,
      code,
      type,
      
    };

    dispatch(addToCart(cartData)); // Dispatch action to add item to Redux store
  };

  // Reset local quantity state when currentQuantity changes
  useEffect(() => {
    setOrderItem(currentQuantity);
  }, [currentQuantity]);

  return (
    <div className="card w-[49%]">
      <div className="w-full rounded-xl overflow-hidden  relative">
       <button onClick={handleOrder} className="w-full h-full ">
        <img
          className="object-cover w-full h-[200px]"
          src={`${imgUrl}${cartItem.imagePath}`}
          alt={cartItem.name}
          width={250}
          height={250}
        />
        </button>
        {/* Button to add item to basket (visible only if isOrderPage is true) */}
        {isOrderPage && (
          <button
            className={`absolute bottom-2 right-2 flex justify-center items-center w-[30px] h-[30px] rounded-full ${
              eachItemOrderNumber > 0 ? "bg-orange text-white" : "bg-white text-orange"
            }`}
            onClick={handleOrder}
          >
            {eachItemOrderNumber > 0 ? eachItemOrderNumber : "+"}
          </button>
        )}
      </div>
      <div className="card-body px-1 py-1">
        <h2 className="card-title text-[14px] font-battambong font-extralight">
          {name}
        </h2>
        <span className="flex flex-row mt-[-10px] gap-3">
          <span className="text-[13px] text-orange-600 font-bold">
            {cur}{promo_price ? real_price : actual_price}
          </span>
          {promo_price && (
            <span className="text-[13px] text-gray-500 line-through">
              {cur}{actual_price}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}