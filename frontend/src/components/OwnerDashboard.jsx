import React from "react";
import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner);

  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      {/* Displays only when NO SHOP DATA  */}
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg roundd-2xl p-6 border border-gray-300 hover:shaodw-xl transition-shadow duration-300 rounded-xl">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-orange-600 w-16 h-16 sm:w-20 sm:h-20 mb-4 " />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our Food Delivery platform to reach thousands of customers
                everyday.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-semibold shadow-md hover:bg-orange-600 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  SHOW SHOP NAME  */}
      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center font-semibold">
            {" "}
            <FaUtensils className="text-[#ff4d2d] w-14 h-14" />
            Welcome to {myShopData.name}
          </h1>
          {/* SHOP IMAGE CARD DIV  */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            {/* EDIT SHOP ICON */}
            <div
              className="absolute bottom-20 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPenToSquare size={20} />
            </div>

            {/* Shop Image  */}
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48 sm:h-64 object-contain mt-5"
            />

            {/* Address  */}
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h1>
              <p className="text-gray-500 mb-2">
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-500 mb-2">{myShopData.address}</p>
            </div>
          </div>

          {/* ADD FOOD ITEMS  */}
          {myShopData.items.length == 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-white shadow-lg roundd-2xl p-6 border border-gray-300 hover:shaodw-xl transition-shadow duration-300 rounded-xl">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4 " />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Add Your Food Items
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Share your delicious food items by adding them to the menu.
                  </p>
                  <button
                    className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-semibold shadow-md hover:bg-orange-600 transition-colors duration-200 cursor-pointer"
                    onClick={() => navigate("/add-item")}
                  >
                    Add Items
                  </button>
                </div>
              </div>
            </div>
          )}

          {myShopData.items.length > 0 && (
            <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
              {myShopData.items.map((item, index) => (
                <OwnerItemCard data={item} key={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
