"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Logo } from '@/components';
import InforCard from '../InfoCard';
import axios from 'axios';
import { useParams } from 'next/navigation';

interface PropType {
  title: string;
  icons: string;
}

export default function NavBar() {
  const [metadata, setMetadata] = useState<PropType | undefined>();
  const {projectName} = useParams()
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`https://${projectName}.tsdsolution.net/api/DriverController/setting`);
        const data = response.data;
        // Set metadata state with fetched data
        setMetadata({ title: data.site_name, icons: data.logo });
      } catch (error) {
        console.error('Error fetching metadata:', error);
        // Handle error fetching metadata
        setMetadata({ title: 'Default Title', icons: '/default-logo.png' });
      }
    };

    fetchMetadata();
  }, [projectName]);

  return (
    <nav className='bg-white p-1 px-3 flex flex-row justify-between items-center pb-0 z-10 max-w-[575px] w-full '>
      {/* Logo and Title Section */}
      <div className='flex flex-row items-center space-x-2'>
        <Logo className={"max-[600px]:h-6 h-10"} image={`https://${projectName}.tsdsolution.net/assets/uploads/logos/${metadata?.icons}`} />
        <div>
          <p className='font-extrabold w-30 font-akbalthom-moul-4 text-xl max-[600px]:text-sm max-[450px]:text-[14px]'>{metadata?.title}</p>
        </div>
      </div>

      {/* Information Card Section */}
      <InforCard title={metadata?.title || ''}  logo={metadata?.icons || ''}>
        <div className='flex justify-center items-center bg-safety-orange h-[22px] rounded-md py-4 px-2'>
          <img className='w-[18px] h-[18px] mt-[7px]' src='/icons/info.svg' alt='' width={100} height={100} />
          <button onClick={() => (document.getElementById('my_modal_2') as HTMLDialogElement).showModal()} className='text-sm/[9px] font-battambong text-nowrap text-orange-500 max-[500px]:text-[12px]'>
            ព័ត៌មានហាង
          </button>
        </div>
      </InforCard>
    </nav>
  );
}