"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export default function BasketBar({cur}: any) {
  const { totalItems, totalPrice} = useSelector((state: RootState) => state.cart);
  return (
    <>
      <div className="flex space-x-1 rounded-full p-3 bg-orange text-xl max-[450px]:text-[18px] max-[415px]:text-[15px] text-white w-10/12 flex-row justify-between items-center">
        <div
          className="flex flex-row justify-between items-center w-full"
          onClick={() => {
            // Show modal only if there are items in the basket
          
              (document.getElementById("my_modal_3") as HTMLDialogElement).showModal();
            }
          }
        >
          <h1 className="text-nowrap font-dangrek ">មើលម៉ឺនុយដែលអ្នកបានកម្ម៉ង់</h1>
          <div className="max-[450px]:text-[18px] max-[415px]:text-[15px] flex items-center gap-x-3 text-xl">
            <span>{totalItems !== 0 ? `${totalPrice.toFixed(2)}${cur}` : `0.00 ${cur}`}</span>
            <p className="w-8 h-8 flex justify-center items-center bg-white text-orange rounded-full">
              {totalItems !== 0 ? totalItems : "0"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}