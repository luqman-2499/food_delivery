import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

function CreateEditShop() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user,
  );
  const dispatch = useDispatch();

  // STATES FOR FORM DATA
  const [name, setName] = useState(myShopData?.name || "");

  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [state, setState] = useState(myShopData?.state || currentState || "");
  const [address, setAddress] = useState(
    myShopData?.address || currentAddress || "",
  );

  // TO STORE IMAGE IN BACKEND AND DISPLAY IN FRONTEND
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);

  const [backendImage, setBackendImage] = useState(null);

  const [loading, setLoading] = useState(false);

  // HANDLE SHOP IMAGE
  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // SAVE SHOP DATA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true },
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/"); // DATA STORED OR UPDATED NAVIGATE BACK TO HOME
    } catch (error) {
      console.log(error.response?.data || error.message);
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center flex-col items-center p-6 bg-linear-to-r from-orange-50 relative to-white min-h-screen">
      {/* Back Button  */}
      <div
        className="absolute top-5 left-5 z-10 mb-2.5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoArrowBack size={35} className="text-orange-600" />
      </div>

      {/* SHOP CREATION MAIN FORM  */}
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        {/* DiV: ICON AND TITLE  */}
        <div className="flex flex-col items-center mb-6">
          {/* ICON INSIDE FORM  */}
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          {/* TITLE : CREATE OR ADD SHOP */}
          <div className="text-3xl font-bold text-gray-900">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </div>
        </div>

        {/* MAIN SHOP ADDING FORM  */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className=" block text-sm font-medium text-gray700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Your Shop Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div>
            <label className=" block text-sm font-medium text-gray-700 mb-1">
              Upload Shop Image
            </label>
            <input
              type="file"
              accept="image/*"
              placeholder="Enter Your Shop Image"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={handleImage}
            />
            {/* DISPLAY IMAGE OF SHOP  */}
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt="Shop Image"
                  className="w-full object-contain rounded-lg border"
                />
              </div>
            )}
          </div>
          {/* WRAPPING CITY STATE IN ONE DIV  */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className=" block text-sm font-medium text-gray700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="City"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setCity(e.target.value)}
                value={city}
              />
            </div>
            <div>
              <label className=" block text-sm font-medium text-gray700 mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="State"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setState(e.target.value)}
                value={state}
              />
            </div>
          </div>

          <div>
            <label className=" block text-sm font-medium text-gray700 mb-1">
              Shop address
            </label>
            <input
              type="text"
              placeholder="Enter your Shop Address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
