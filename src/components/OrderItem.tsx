  import React, { useEffect, useState} from "react";
  import { useSelector, useDispatch } from "react-redux";
  import { RootState } from "@/lib/store";
  import Item from "./Item";
  import { Footer } from "./core";
  import { clearCart } from "@/lib/cart/cartSlice";
  import HistoryOrder from "./HistoryOrder";
  import numeral from "numeral";
  import { useParams } from "next/navigation";
  import axios from "axios";
  import { orderHistoryType } from "@/types/model";
  import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { useLanguage } from '@/components/context/LanguageContext'
  
  interface PropType {
    cur: any; 
  }
  
  
  export default function OrderItem({cur}:PropType) {
    const { t } = useLanguage();
    
    const [historyOrder, setHistoryOrder] = useState<orderHistoryType | null>(null)
    const {projectName, tableNumber}= useParams()
    const [isLoading, setIsLoading] = useState(false);

    const [isClickOrder, setClickOrder] = useState(false)
    const cart = useSelector((state: RootState)=> state.cart)
    const endPoint = `https://${projectName}.tsdsolution.net/api/DriverController/suspends`
    // Fetch history order details on component mount
  useEffect(() => {
    console.log(projectName)
    const fetchHistoryOrder = async () => {
        try {
            const formData = new FormData();
            formData.append("table_num", `${tableNumber}`)
            const endPoint = `https://${projectName}.tsdsolution.net/api/DriverController/suspends`
            const response = await axios.post(endPoint, formData);
            const data = response.data;
            setHistoryOrder(data)
            console.log("Fetched data:", data);
        } catch (error) {
            console.error("Error fetching history order:", error);
        }
    };

    fetchHistoryOrder();
}, [projectName, tableNumber, isClickOrder]);


    const dispatch = useDispatch()
    

    const handleOrder = async () => {
      setIsLoading(true);
      const loading = toast.info(t.orderUnderway,{
        autoClose: 2000,
        position: "top-center",
        className: "font-battambong"

      });
      
      const product = basket.map(({ id, quantity, comment }) => ({
        id: id,
        quantity: quantity,
        comment: comment || null,
      }));

  
      try {
        
        const data = {
          data: {
            id: historyOrder ? historyOrder?.data.id : null ,
            suspend_note: historyOrder ? historyOrder?.data.suspend_note : null,
            table_id: tableNumber,
          },
          items: product,
        };
        const jsonData = JSON.stringify(data)
        let response;
          response = await axios.post(
            `https://${projectName}.tsdsolution.net/api/DriverController/suspend`,
            jsonData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        
        toast.dismiss(loading)
        toast.success(t.orderSuccessfully,{
          autoClose: 2000,
          position: "top-center",
          className: "font-battambong"

        });

        dispatch(clearCart());
        setClickOrder(!isClickOrder);

      } catch (error) {
        console.error('Error sending order:', error);
        toast.dismiss(loading)
        toast.error(t.orderFailed,{
          autoClose: 2000,
          position: "top-center",
          className: "font-battambong"
        });
      } finally {
        setIsLoading(false);
      }
    };


    const { items: basket, totalItems, totalPrice } = useSelector((state: RootState) => state.cart);
    return (
      <>
        {/* You can open the modal using document.getElementById('ID').showModal() method */}
    
        <dialog id={"my_modal_3"} className={`modal    backdrop-blur-[2px]`}>
          <div className="modal-box p-0">
          <ToastContainer/>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn  btn-sm btn-circle btn-ghost absolute right-2 top-2 text-xl  z-10">
                ✕
              </button>
            </form>
            <div className="flex flex-col h-[100vh]  items-center relative ">
            <div>
            <h1 className="text-center font-dangrek p-2 text-xl"><br />
            <span className="text-orange-400">{tableNumber}</span> {t.orderSummary}</h1>
            </div>
            <div className="w-full bg-transparent border-[1px] border-dashed border-[#343433]"></div>
            <div className="w-full px-4">

            {/* new order  */}
          {basket.length == 0 ?  (<></>) :<h1 className="text-center font-dangrek p-2 mb-5">{t.newOrder}</h1>}
            {/* item cart  */}
              {
                basket.map((item, index) => (
                  <>
                   <Item key={index} cartItem={item} cur={cur}/>
                  
                  </>
                ))
              }
            </div>
            {  basket.length == 0 ? (<></>):(<button onClick={handleOrder} className="bg-orange font-dangrek p-2 px-5 rounded-full text-white mt-2">{t.placeOrder}</button>)}
            
              {/* history order section  */}
            { 
              <div className="w-full px-3 ">
                <h1 className="font-dangrek text-center mt-5">{t.completedOrder}</h1>
                <div className="flex flex-col w-full space-y-3">
                  {
                    historyOrder?.items?.map((item: any, index: any) => (
                      <>
                        <HistoryOrder key={index} cartItem={item} cur={cur}/>
                      </>
                    ))
                  }
                </div>
              </div>
  }
              {/* summary section  */}
              <div className="w-full flex flex-col space-y-2 p-3">
              <p className="text-lg flex flex-row justify-between">
                <span className="font-dangrek  " >{t.totalItems}:</span>
              <span className="font-bold">{historyOrder ? parseInt(historyOrder.data.totalItems) + totalItems: totalItems}</span>
              </p>
              <p className="text-xl flex flex-row text-orange-500  justify-between">
              <span className="font-dangrek  " >{t.totalAmount}:</span>
                  <span className="font-bold">{cur}{historyOrder ? (parseFloat(historyOrder.data.total_price) + totalPrice).toFixed(2): numeral(totalPrice).format('0.00')}</span>
              </p>
              </div>
            <div className="mt-5">
            <Footer></Footer>
            </div>
            </div>
          
          </div>
        </dialog>
      </>
    );
  }


