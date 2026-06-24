import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useParams } from "react-router-dom";
import { FaStore } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import FoodCard from "../components/FoodCard";
import { FaUtensils } from "react-icons/fa";

function Shop() {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState([]);
  const handleShop = async (shopId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/get-item-by-shop/${shopId}`,
        { withCredentials: true },
      );
      setShop(result.data.shop);
      setItems(result.data.items);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  useEffect(() => {
    handleShop(shopId);
  }, [shopId]);

  return (
    <div className="min-h-screen bg-orange-50">
      {/* {shop && (
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <img src={shop.image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-black/30 flex flex-col jsutify-center items-center px-4">
            <FaStore className="text-white text-4xl mb-3 drop-shadow-md mt-10" />
            <h1 className="text-3xl font-extrabold md:text-5xl text-white drop-shadow-lg">
              {shop.name}
            </h1>
            <div className="flex items-center gap-3">
              <FaLocationDot size={24} color="red" />
              <p className="text-lg font-medium text-gray-200 mt-5">
                {shop.address}
              </p>
            </div>
          </div>
        </div>
      )} */}

      {shop && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-orange-100 rounded-3xl shadow-lg overflow-hidden grid md:grid-cols-2 items-center">
            {/* LEFT SIDE INFO */}
            <div className="p-6 md:p-8 min-h-72 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <FaStore className="text-orange-600 text-2xl" />
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800">
                  {shop.name}
                </h1>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <FaLocationDot className="text-red-500 mt-1 text-xl" />
                <p className="text-gray-600 text-lg">{shop.address}</p>
              </div>

              <div className="flex gap-3 mt-6 flex-wrap">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-lg font-semibold">
                  Fresh Food
                </span>
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-lg font-semibold">
                  Fast Delivery
                </span>
              </div>
            </div>

            {/* RIGHT SIDE IMAGE */}

            <div className="flex justify-center items-center h-full pr-3 md:pr-4">
              <img
                src={shop.image}
                alt=""
                className="w-[64%] h-64 object-cover rounded-4xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* DISPLAY MENU ITEMS  */}
      <div className="max-w-8xl mx-auto px-6 py-10">
        <h2 className="flex items-center justify-center gap-3 text-4xl font-bold mb-10 text-gray-800">
          <FaUtensils size={40} color="red" />
          Our Menu
        </h2>

        {items.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {items.map((item) => (
              <FoodCard data={item} />
            ))}
          </div>
        ) : (
          <p className="text-red-600 font-semibold text-center">
            No Items Available
          </p>
        )}
      </div>
    </div>
  );
}

export default Shop;
