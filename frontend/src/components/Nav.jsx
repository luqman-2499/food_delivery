import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearch, IoClose } from "react-icons/io5";
import { FaCartPlus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function Nav() {
  const navigate = useNavigate();
  // STATE TO GET USER DATA FROM REDUX TO DISPLAY ON PROFILE CIRCLE ICON
  const { userData, currentCity, cartItems } = useSelector(
    (state) => state.user,
  );

  const { myShopData } = useSelector((state) => state.owner);

  // STATE TO SHOW USER FULL NAME AND HANDLE LOG IN-OUT
  const [showInfo, setShowInfo] = useState(false);

  // STATE TO SHOW LOC AND SEARCH BAR IN MOBILE VERSION
  const [showSearch, setShowSearch] = useState(false);

  // STATE FOR SEARCH ITEMS
  const [query, setQuery] = useState("");

  const dispatch = useDispatch();

  // FUNCTION FOR LOGOUT
  const handleLogOut = async () => {
    try {
      const result = await axios.delete(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  // SEARCH ITEMS
  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
        { withCredentials: true },
      );
      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      // Preventing API Call when Search is Empty
      handleSearchItems();
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query]);

  return (
    <div className="w-full h-20 flex items-center justify-between md:justify-center gap-8 px-5 fixed top-0 z-9999 bg-[#fff9f6] overflow-visible">
      {/* MOBILE FULL SEARCH BAR BOX */}

      {showSearch && userData?.role === "user" && (
        <div className="w-[90%] h-20 bg-white shadow-xl rounded-lg items-center gap-5 flex fixed top-20 left-[5%] md:hidden">
          {/* MOBILE LOCATION ICON AND CITY TEXT */}

          <div className="flex items-center w-[30%] overflow-hidden gap-3 px-3 border-r-2 border-gray-400">
            <FaLocationDot size={24} className="text-[#ff4d2d]" />
            <div className="w-[80%] text-gray-600">
              {currentCity ? currentCity : "searching"}
            </div>
          </div>

          {/* SEARCH BAR TEXT PART */}

          <div className="w-[70%] flex items-center gap-3">
            <input
              type="text"
              placeholder="Search for delicious food..."
              className="px-3 text-gray-700 outline-0 w-full"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      {/* LOGO */}

      <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">Snap Delivery</h1>

      {/* DESKTOP SEARCHBAR  */}
      {userData?.role === "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-18 bg-white shadow-xl rounded-lg items-center gap-5 hidden md:flex">
          <div className="flex items-center w-[30%] overflow-hidden gap-3 px-3 border-r-2 border-gray-400">
            <FaLocationDot size={24} className="text-[#ff4d2d]" />
            <div className="w-[80%] text-gray-600">
              {currentCity ? currentCity : "searching"}
            </div>
          </div>

          <div className="w-[70%] flex items-center gap-4">
            <IoSearch size={24} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search for delicious food..."
              className="px-3 text-gray-700 outline-0 w-full"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      {/* RIGHT SECTION */}

      <div className="flex items-center gap-5">
        {/* MOBILE SEARCH ICON TOGGLE */}

        {userData?.role === "user" &&
          (showSearch ? (
            <IoClose
              size={28}
              className="text-orange-600 md:hidden cursor-pointer"
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <IoSearch
              size={28}
              className="text-orange-600 md:hidden cursor-pointer"
              onClick={() => setShowSearch(true)}
            />
          ))}

        {/* OWNER DASHBAORD ADD FOOD ITEMS BUTTON DESKTOP */}
        {userData?.role === "owner" ? (
          <>
            {myShopData && (
              <>
                <button
                  className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-orange-600/10 text-orange-600"
                  onClick={() => navigate("/add-item")}
                >
                  <span>Add Food Items </span>
                  <FaPlus size={18} />
                </button>

                {/* OWNER DASHBAORD ADD + BUTTON ON SMALL DEVICES */}
                <button
                  className="md:hidden flex items-center p-2 cursor-pointer rounded-full bg-orange-600/10 text-orange-600"
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={18} />
                </button>
              </>
            )}

            {/* MY ORDERS OWNER  */}

            <div
              className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-orange-600/10 text-orange-600 font-medium"
              onClick={() => navigate("/my-orders")}
            >
              <MdRestaurantMenu
                size={20}
                onClick={() => navigate("/my-orders")}
              />
              <span>My Orders</span>
            </div>

            {/* MY ORDERS ONLY ICON DISPLAY ON MOBILE  */}

            <div
              className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-orange-600/10 text-orange-600 font-medium"
              onClick={() => navigate("/my-orders")}
            >
              <MdRestaurantMenu size={20} />
            </div>
          </>
        ) : (
          <>
            {/* CART */}
            {(!userData || userData?.role === "user") && (
              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/cart")}
              >
                <FaCartPlus size={25} className="text-[#ff4d2d]" />
                <span className="absolute -right-3 -top-3 text-orange-600">
                  {cartItems.length}
                </span>
              </div>
            )}

            {/* DESKTOP ORDERS */}

            <button
              className="hidden md:block px-3 py-1 rounded-lg bg-orange-600/10 text-orange-600 text-sm font-medium cursor-pointer"
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </button>
          </>
        )}

        {/* PROFILE ICON */}

        {userData ? (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-600 text-white text-lg shadow-lg font-semibold cursor-pointer shrink-0"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            {userData.fullName?.slice(0, 1)}
          </div>
        ) : (
          <button
            className="text-orange-600 font-semibold cursor-pointer whitespace-nowrap"
            onClick={() => navigate("/signin")}
          >
            Login
          </button>
        )}

        {/* PROFILE DROPDOWN */}

        {userData && showInfo && (
          <div className="fixed top-20 right-3 md:right-[10%] lg:right-[25%] w-50 bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-3 z-9999">
            <div className="text-[17px] font-semibold text-black">
              {userData?.fullName}
            </div>

            {userData?.role === "user" && (
              <div
                className="text-orange-600 cursor-pointer font-semibold"
                onClick={() => navigate("/my-orders")}
              >
                My Orders
              </div>
            )}

            <div
              className="text-orange-600 font-semibold cursor-pointer"
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
