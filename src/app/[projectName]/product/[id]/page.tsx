'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Menu } from '@/types/model';
import ProductPage from '@/components/ProductPage';
import Loading from '@/components/core/loading';

type PageProps = {
  params: {
    id: string;
    projectName: string;
  };
};

export default function ProductDetail({ params }: PageProps) {
  const { id, projectName } = params;
  const [cartItem, setCartItem] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  
  useEffect(() => {
  const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `https://${projectName}.tsdsolution.net/api/DriverController/GetAllProductWithCat`
          // `https://${projectName}.tsdsolution.net/api/DriverController/getproductsdetails?id=` + id
      );
    // API may return an object or an array. Normalize to array of categories.
    const data = response?.data;
    const categories = Array.isArray(data) ? data : data && typeof data === 'object' && data.categories ? data.categories : [];
    const allItems: Menu[] = categories.flatMap((cat: any) => cat.items || []);
    const found = allItems.find((item) => item.id.toString() === id);
        console.log(data);
        if (!found) {
          setError("Product not found");
        } else {
          setCartItem(found);
        }
      } catch (err) {
        setError("Failed to load product data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, projectName]);

  if (loading) {
    return <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center left-0" />;
  }

  if (error || !cartItem) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return <ProductPage cartItem={cartItem} cur="$" />;
}
