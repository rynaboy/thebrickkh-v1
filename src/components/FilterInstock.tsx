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
       className={`inline-flex font-bold justify-center items-center w-full px-4 border-2 max-[370px]:text-[13px] text-[16px] max-[320px]:text-[10px] border-yellow-400 py-1 rounded-full focus:outline-none font-niradei ${
          isInstockOnly ? 'bg-[#fec10b]' : 'bg-[#fec10b]'
        }`}
        >
            {isInstockOnly? 'Show All Products' : 'Show In Stock Only'}
      </button>
    </div>
  )
}

export default FilterInstock