"use client";
import { ImageSlider, Model, NotFound, SearchBar } from "@/components/";
import { Cart, BasketBar, Footer, Loading, PageNotFound, NavBar } from "@/components/core";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import OrderItem from "@/components/OrderItem";
import { Provider } from "react-redux";
import store from "@/lib/store";
import { MenuType } from "@/types/model";
import { useParams } from "next/navigation";

export default function Home( ) {
  
  const { projectName } = useParams();
  const project = Array.isArray(projectName) ? projectName[0] : projectName;
  const [loading, setLoading] = useState(true); // Loading state
  const [activeSection, setActiveSection] = useState<number>(); // State to track active section
  const ref = useRef<(HTMLDivElement | null)[]>([]); // Ref to store section elements
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState<MenuType>([]); // State for fetched data
  const [filteredMenu, setFilteredMenu] = useState<MenuType>([]); // State for filtered menu items
  const isOrderPage = true; // Flag for order page
  const [images, setImages] = useState<any[]>([])
  const [isNotFound, setNotFound] = useState(false);
  const [cur, setCur] = useState(null);


  const imgUrl = `https://${projectName}.tsdsolution.net/assets/uploads/`;
 
  // Fetch data on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`https://${projectName}.tsdsolution.net/api/DriverController/setting`);
        const data = response.data
        console.log("Data fetched successfully", response.data);
        const correctedSlideShow = data.slide_Show.replace(/,\s*]$/, ']');
        const slideShowArray = JSON.parse(correctedSlideShow);
        setImages(slideShowArray);
        setCur(data.symbol);
        // Handle the fetched data here
      } catch (err) {
        console.log("Error fetching data", err);
      }
    };

    fetchImages();
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://${projectName}.tsdsolution.net/api/DriverController/GetAllProductWithCat`
        );
        
        const dataJson: MenuType = response.data;
        console.log(dataJson)
        setData(dataJson); // Set fetched data
        setFilteredMenu(dataJson); // Initialize filteredMenu with fetched data

        if(dataJson.length == 0){
          setNotFound(true)
        }
        setLoading(false); // Data fetched, set loading to false
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotFound(true)
        setLoading(false); // Error occurred, set loading to false
      }
    };

    fetchData();
  }, [projectName]); // Dependency array ensures fetch occurs when projectName changes

  // Filter items based on search query and update filteredMenu
  useEffect(() => {
    const filteredItems = data
      .map((category) => ({
        category: category.category,
        items: category.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);

    setFilteredMenu(filteredItems);
  }, [searchQuery, data]); // Update filteredMenu when searchQuery or data changes

  // Memoized handler for search input change
  const handleSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      setSearchQuery(query);
    },
    []
  );

  // Scroll to a section based on index
  const handleScroll = (index: number) => {
    ref.current[index]?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(index);
  };


  if(isNotFound){
    return <>
    <PageNotFound error="404 Page Not Found"/>
    </>
  }


 
  // Render loading indicator while fetching data
  if (loading) {
    return <Loading className="h-screen fixed w-full z-100 bg-white top-0 flex justify-center items-center  left-0" />;
  }

  // Render the main content once data is loaded
  return (
    <Provider store={store}>

        <div className="w-full  px-3 py-1 fixed flex flex-col gap-2 max-w-[575px] bg-white z-10">
        <NavBar />
          <ul className="no-scrollbar flex flex-nowrap gap-2 overflow-x-scroll">
            {data.map((item, index) => (
              <li
                key={item.category}
                onClick={() => handleScroll(index)}
                className={`font-dangrek cursor-pointer text-nowrap max-[500px]:text-[12px] text-[15px] py-[5px] px-3 w-fit rounded-full border-orange-600 border-2 ${
                  activeSection === index ? "text-orange-600" : "text-black"
                }`}
              >
                {item.category}
              </li>
            ))}
          </ul>
          {/* Search bar component */}
          <SearchBar query={searchQuery} onSearch={handleSearchInput} />
        </div>

      <main className=" pb-[200px] fixed top-3 h-full w-full mt-40 max-[600px]:mt-36  max-w-[575px] overflow-scroll">
        {/* Navigation and search bar */}
       

        {/* Main content section */}
        <section className="px-3 mt-5   ">
          {/* Display image slider when no search query */}
          {searchQuery.trim().length <= 0 && <ImageSlider images={images} />}

          <div className="mt-2">
            {/* Render filtered menu items */}
            {filteredMenu.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                ref={(el) => {
                  ref.current[categoryIndex] = el;
                }}
              >
                {/* Display category header if items exist */}
                {category.items.length > 0 && (
                  <div className="flex gap-3 justify-center  items-center mb-5  mt-5">
                    <div className="w-20 h-[2px] rounded-full bg-gray-300"></div>
                    <h1
                      id={`${category.category}`}
                      className={`font-bold font-dangrek text-xl  text-nowrap  max-[400px]:text-lg`}
                    >
                      {category.category}
                    </h1>
                    <div className="w-20 h-[2px] rounded-full bg-gray-300"></div>
                  </div>
                )}
                {/* Display items in a category */}
                <div className="flex flex-wrap flex-row  justify-between">
                  {category.items.map((item) => (
                    <Cart
                      key={item.id}
                      cartItem={item}
                      isOrderPage={isOrderPage}
                      cur={cur}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom action bar */}
        <div className="fixed bottom-0 p-3 max-w-[575px] items-center w-full cursor-pointer rounded-t-xl bg-white flex justify-between">
          {/* Display order item component */}
          <OrderItem cur={cur} />
          {/* Basket bar component */}
          <BasketBar cur={cur} />

          {/* Button to trigger modal */}
          <button
            onClick={async () => {
              try {
                (document.getElementById(
                  "my_modal_10"
                ) as HTMLDialogElement).showModal();
                // await axios.post(""); // Placeholder post request
              } catch (error) {
                console.error("Error posting data:", error);
              }
            }}
            className="bg-gray-200 w-14 h-14 flex justify-center items-center rounded-full border-orange-600 border-2"
          >
            {/* Image icon */}
            <img
              className="w-10 h-10 max-[450px]:w-8"
              src={"/icons/service-bell.svg"}
              alt=""
              width={100}
              height={100}
            />
          </button>
          {/* Model component */}
          <Model />
        </div>

        {/* Footer section */}
        <footer className="mt-16 pb-[140px]">
          {/* Display not found message when no items */}
          {filteredMenu.length <= 0 && <NotFound />}
          <Footer />
        </footer>
      </main>
    </Provider>
  );
}