import React from 'react'
import Image from 'next/image'

type PropsType = {
  image: string
  className?: any
}

export default function Logo({ image, className }: PropsType) {
  return (
 
      <div className={` h-12 w-12 rounded-full ${className}`}>
        {/* <div className="rounded-full  w-[57.77px] h-[57.77px] "> */}
          <img alt='' className='w-full h-full object-contain' src={image} width={100} height={100}  />
        {/* </div> */}
      </div>
  )
}
