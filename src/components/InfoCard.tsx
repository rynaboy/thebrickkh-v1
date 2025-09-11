import Image from "next/image";
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useParams } from "next/navigation";



type propTypes = {
  children: ReactNode;
  title: string 
  logo: string
};
export default function InforCard({ children, title, logo }: propTypes) {
  const [info, setInfo] = useState<any>()
  const [icons, setIcons] = useState<any>()
  const {projectName} = useParams()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://${projectName}.tsdsolution.net/api/DriverController/e_orderConfig`);
        const data = response.data;
        setInfo(data);
        console.log("fetch icons",data);
        setIcons(data.icon);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      {children}
      <dialog id="my_modal_2" className="modal backdrop-blur-[2px]">
        <div className="modal-box p-0">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn text-white btn-sm btn-circle btn-ghost absolute right-2 top-2 text-xl  z-10">
              ✕
            </button>
          </form>
          <div className="flex flex-col  items-center ">
              <div className="h-[200px] w-full bg-red-400 mb-20 relative">
                <img src={`https://${projectName}.tsdsolution.net/assets/uploads/logos/${info?.hero}`}  className="object-cover w-full h-full " width={10000} height={10000} alt="" />
                <div className={"w-28 h-28 rounded-full flex justify-center items-center absolute  bottom-[-60px]  bg-white left-1/2 transform -translate-x-1/2"}>
                <img className="object-cover " src={`https://${projectName}.tsdsolution.net/assets/uploads/logos/${logo}`}  alt="" width={1000} height={1000} />
                  </div>                
              </div>
              <p className="font-akbalthom-moul-4 text-center text-2xl ">{title}</p>
              <p className="px-5 font-battambong font-light mt-5 text-sm text-center"> ទំនាក់ទំនងយើងខ្ញុំតាមរយៈបណ្តាញសង្គម <br />
              Contact us through our official social media channels</p>
              <div className="flex flex-row space-x-3 mt-5">
                {
                    icons?.map((social: any) => (
                         <Link key={social.logo} href={social.url}>
                         <img  className="w-10" src={social.logo == "Instagram.svg" ? 'https://img.icons8.com/fluency/48/instagram-new.png':`/icons/${social.logo}`} alt="" width={100} height={100}  />
                         </Link>
                    ))
                }
              </div>

              <div className="flex font-battambong space-x-2 mt-5  p-4 w-full justify-center bg-orange-100">
                <img className="w-5" src={"/icons/call.svg"} alt="" width={100} height={100} />
                <h1 className="text-orange-500">លេខទំនាក់ទំនង / Hotline: <Link href={`tel:+855${info?.phone_num}`}>{info?.phone_num}</Link> </h1>
              </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
