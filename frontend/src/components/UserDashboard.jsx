import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronCircleLeft } from "react-icons/fa";
import { FaChevronCircleRight } from "react-icons/fa";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import axios from "axios";
import { serverUrl } from "../App";

function UserDashboard() {
  const { currentCity, shopsInMyCity, itemsInMyCity, searchItems } =
    useSelector((state) => state.user);
  const navigate = useNavigate();
  const cateScrollRef = useRef();
  const ShopScrollRef = useRef();
  // FOR CATEGORIES BUTTON
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);

  // FOR SHOP BUTTON
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);

  // DISPLAY ITEMS BASED ON CATEGORIES
  const [updatedItemsList, setUpdatedItemsList] = useState([]);

  // FILTER SUGGESTED ITEMS BASED ON MAIN CATEGORY
  const handleFilterByCategory = (category) => {
    if (category == "All") {
      setUpdatedItemsList(itemsInMyCity);
    } else {
      const filteredList = itemsInMyCity.filter((i) => i.category == category);
      setUpdatedItemsList(filteredList);
    }
  };

  // Use Effect for DISPLAY ITEMS IN SUGGESTED ITEMS PART
  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      // ClientWidth: The width which visible
      // ScrollWidth: The total width of scroll all items
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth - 5,
      );
    }
  };

  // SCROLL HANDLER
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  // USE EFFECT FOR MAIN CATEGORIES

  useEffect(() => {
    const el = cateScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // USE EFFECT FOR SHOPS IN CURRENT CITY
  useEffect(() => {
    const el = ShopScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      updateButton(
        ShopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
    };

    handleScroll();
    el.addEventListener("scroll", handleScroll);

    return () => el.removeEventListener("scroll", handleScroll);
  }, [shopsInMyCity]);

  return (
    <div className="w-full min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      {/* SEARCH ITEMS RESULT */}
      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-3xl mt-3">
          <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-300 pb-2">
            Search Results
          </h1>
          <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
            {searchItems.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      {/* FOOD CATEGORIES  */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Insipration for your first order
        </h1>
        {/* SCROLL BUTTONS DIV   */}
        <div className="w-full relative">
          {/* MOVE ITEMS TO LEFT  */}
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-orange-600 z-10 cursor-pointer"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaChevronCircleLeft size={24} />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={cateScrollRef}
          >
            {/* ALL CATEGORIES  */}

            {/* we have categories file we import that and map each category and image and store in name, image variables. index is start from 0th category. eg: take burger and its image from categories file and store in name, image and then send as props to component */}
            {categories.map((cate, index) => (
              <CategoryCard
                name={cate.category}
                image={cate.image}
                key={index}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>
          {/* MOVE ITEMS TO RIGHT  */}
          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-orange-600 z-10 cursor-pointer"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaChevronCircleRight size={24} />
            </button>
          )}
        </div>
      </div>

      {/* SHOPS IN CITY  */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best Shops in {currentCity ? currentCity : "Searching"}
        </h1>
        <div className="w-full relative">
          {/* MOVE ITEMS TO LEFT BUTTON */}
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-orange-600 z-10 cursor-pointer"
              onClick={() => scrollHandler(ShopScrollRef, "left")}
            >
              <FaChevronCircleLeft size={24} />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={ShopScrollRef}
          >
            {/* From redux import shopsInMyCity which holds shop data like name, city, state, etc so map only shop name and image */}
            {shopsInMyCity?.map((shop, index) => (
              <CategoryCard
                name={shop.name}
                image={shop.image}
                key={index}
                onClick={() => navigate(`/shop/${shop._id}`)}
              />
            ))}
          </div>
          {/* MOVE ITEMS TO RIGHT BUTTON  */}
          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-orange-600 z-10 cursor-pointer"
              onClick={() => scrollHandler(ShopScrollRef, "right")}
            >
              <FaChevronCircleRight size={24} />
            </button>
          )}
        </div>
      </div>

      {/* SUGGESTED TEMS AVAILABLE  */}

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Suggested Food Items
        </h1>
        {/* MAPPING EACH ITEM DISPLAYING ITEMS ONE BY ONE */}
        <div className="w-full h-auto flex flex-wrap gap-5 justify-center">
          {updatedItemsList?.map(
            // Initial items null but since useEffect defined itemsinmycity it shows all items
            (
              item,
              index, // in redux go to itemsinmycity object and from there get whole data; fields + values and store in items and send one by one to Foodcard as prop : data to hold them
            ) => (
              <FoodCard key={index} data={item} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
