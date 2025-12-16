import React from 'react'

interface FilterInstockProps{
  onToggleInstock: () => void;
  isInstockOnly: boolean;
}

function FilterInstock({onToggleInstock, isInstockOnly}: FilterInstockProps) {
  return (
    <div className="inline-block text-left mt-4 me-2 w-full"> 
      <button
      onClick={onToggleInstock}
       className={`inline-flex font-bold justify-center items-center w-full px-4 border-2 max-[370px]:text-[13px] text-[16px] max-[320px]:text-[10px] border-amber-500 py-1 rounded-full focus:outline-none font-dmsans ${
          isInstockOnly ? 'bg-[#f9a41a]' : 'bg-[#f9a41a]'
        }`}
        >
            {isInstockOnly? 'Show All Products' : 'Show In Stock Only'}
      </button>
    </div>
  )
}

export default FilterInstock