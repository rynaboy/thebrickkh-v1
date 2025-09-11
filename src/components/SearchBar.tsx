import React from 'react'

type propTypes = {
  query: string
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
}
export default function SearchBar({ onSearch, query }: propTypes) {
  return (
    <label className="input border-gray-300 h-[40px] mt-2 rounded-full flex items-center gap-1 w-full">
      <input type="text" className="grow font-dangrek max-[500px]:text-[12px]" placeholder="ស្វែងរកមុខម្ហូបនិងភេសជ្ជ:" value={query} onChange={onSearch} />
      <svg

        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"

        className="h-6 w-6 opacity-70 text-orange-500">
        <path
          fillRule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd" />
      </svg>
    </label>
  )
}
