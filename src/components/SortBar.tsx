import React,{useEffect, useState} from 'react';
import { useLanguage } from '@/components/context/LanguageContext';

type SortBarProps = {
  isOpen: boolean;
  onToggle: () => void;
  sortData: string | null;
  onSortChange: (sortOption: string | null) => void;
  resetTrigger?: number; // Add this line
};

const sortOptions = [
  "Piece count: Low to High",
  "Piece count: High to Low",
  "Newest",
  // "Price: Low to High",
  // "Price: High to Low"
];

export default function SortBar({
  isOpen,
  onToggle,
  sortData,
  onSortChange,
  resetTrigger
}: SortBarProps) {
  const { t } = useLanguage();

  const handleSortSelect = (label: string) => {
    const newValue = sortData === label ? null : label;
    onSortChange(newValue);
  };

  // Add this state after your existing declarations
const [localSortData, setLocalSortData] = useState<string | null>(null);

// Add this useEffect
useEffect(() => {
  if (resetTrigger !== undefined) {
    setLocalSortData(null);
  }
}, [resetTrigger]);


  return (
    <div className="mt-4 me-2 w-[70px]">
      {/* Toggle Button */}
      <div className="relative">
        <button
          onClick={onToggle}
          className={`w-full px-4 py-1 max-[370px]:text-[13px] max-[320px]:text-[10px] text-[13px] font-dmsans rounded-full border-2 focus:outline-none border-amber-500 ${
            isOpen ? 'text-white bg-[#343433]' : 'text-[#343433]'
          }`}
        >
          Sort
        </button>
      </div>

      {/* Dropdown Panel */}
      <div className="relative ms-[-89px] w-[360px] sm:w-[400px] md:w-[530px] lg:w-[527px]"
      style={{
      width: window.innerWidth <= 320 ? '290px' : window.innerWidth <= 360 ? '330px'  : undefined,}}>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white border rounded-lg p-4 mt-2 shadow">
            {/* Close Button */}
             <span onClick={onToggle} className="absolute bottom-[-15px] right-[50%] translate-x-[50%] bg-[#343433] font-dmsans text-[12px] p-2 rounded-full shadow-sm z-10 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 512 512"  className="h-4 w-4" style={{ fill: '#FFFFFF' }}>
                <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/></svg>
          </span>

            {/* Sort Options */}
            <div className="mb-4">
              {sortOptions.map((label, index) => (
                <div className="form-check flex items-center" key={index}>
                  <input
                    className="form-check-input w-[15px] h-[15px] mt-1"
                    type="checkbox"
                    checked={sortData === label}
                    onChange={() => handleSortSelect(label)}
                    id={`sort-${index}`}
                  />
                  <label
                    className="form-check-label ms-2 mt-2 font-dmsans text-[14px]"
                    htmlFor={`sort-${index}`}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
