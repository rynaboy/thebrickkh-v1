import React from 'react';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '@/lib/cart/cartSlice'; // Adjust the path as per your project structure
import { CartItem } from '@/types/model'; // Adjust the path as per your project structure
import Image from 'next/image';
import { useParams } from 'next/navigation';
import numeral from 'numeral';
type PropsType = {
    cartItem: CartItem;
    cur?:any
};

export default function Item({ cartItem, cur }: PropsType) {
    console.log(cur);
    
    
    const {projectName} = useParams()
    const {name, price, promo_price,id, imagePath, quantity}= cartItem
    const real_price = numeral(promo_price).format('0.00')
    const actual_price = numeral(price).format('0.00')
  const imgUrl = `https://${projectName}.tsdsolution.net/assets/uploads/`
    const dispatch = useDispatch();
    const handleQuantityChange = (newQuantity: number) => {
        if(newQuantity > 0){
        dispatch(updateCartItem({ itemId: cartItem.id, quantity: newQuantity }));
        }
    };

    const handleRemove = (id: string)=>{
        console.log(id)
        dispatch(removeFromCart({itemId: id}))
    }

    return (
        <>
            <div className="flex flex-row justify-between w-full  py-1 mt-1">
                {/* item info (image, name, price, promo_price) */}
                <div className='flex flex-row items-center space-x-4 '>
                    {/* img box  */}
                    <div className='h-[62px] w-[62px] rounded-lg overflow-hidden '>
                        <img src={`${imgUrl}/${imagePath}`} alt="" width={250} height={250} className="object-cover w-full h-full" />
                    </div>
                    {/* item info (name, price, promo_price)  */}
                    <div>
                        <p className='font-battambong text-sm'>{name}</p>
                        <div className="space-x-3 ">
                            <span className='text-orange-600 font-bold'>{cur}{ promo_price ? real_price: actual_price}</span>
                           {
                            promo_price ? 
                            (<span className="line-through">{cur}{real_price}</span>) : ""

                           }
                        </div>
                    </div>
                </div>
                {/* customize item  */}
                <div className='flex flex-row items-center space-x-2'>
                    {/* delete button  */}
                    <button onClick={()=> handleRemove(cartItem.id)} className='bg-orange-100 h-[22px] text-orange-400 flex flex-row space-x-1 px-4 justify-center  rounded-full items-center'>
                        <img width={250} height={250} src={"/icons/delete.svg"} alt='' className='h-3 w-3' />
                        <p className='text-[8px] '>បោះបង់</p>
                    </button>

                    <button className='bg-gray-200  rounded-full w-[10px] h-[10px] p-4 flex justify-center items-center' onClick={() => handleQuantityChange(cartItem.quantity - 1)}>-</button>
                    <p>{quantity}</p>
                    <button className=' text-white bg-orange rounded-full w-[10px] h-[10px] p-4 flex justify-center items-center' onClick={() => handleQuantityChange(cartItem.quantity + 1)}>+</button>

                </div>
            </div>
            <div className='h-[1px] w-full mt-1 bg-gray-200'></div>
        </>
    );
}