import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

function EditItem() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);

  // GET ITEM DETAILS WHEN EDITING

  const { itemId } = useParams();
  const [currentItem, setCurrentItem] = useState(null);

  const dispatch = useDispatch();

  // STATES FOR FORM DATA
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [foodType, setFoodType] = useState("");
  const [category, setCategory] = useState("");

  // TO STORE IMAGE IN BACKEND AND DISPLAY IN FRONTEND

  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);

  // LOADING STATE
  const [loading, setLoading] = useState(false);

  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Drinks",
    "All",
  ];

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
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true },
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGetItemById = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          { withCredentials: true },
        );
        setCurrentItem(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    handleGetItemById();
  }, [EditItem]);

  useEffect(() => {
    setName(currentItem?.name || "");
    setPrice(currentItem?.price || 0);
    setFoodType(currentItem?.foodType || "");
    setCategory(currentItem?.category || "");
    setFrontendImage(currentItem?.image || "");
  }, [currentItem]);
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
            <FaUtensils className="text-orange-600 w-16 h-16" />
          </div>
          {/* TITLE : CREATE OR ADD SHOP */}
          <div className="text-3xl font-bold text-gray-900">Edit Item</div>
        </div>

        {/* MAIN SHOP ADDING FORM  */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Item Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Food Image
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

          <div>
            <label className=" block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>

          <div>
            <label className=" block text-sm font-medium text-gray-700 mb-1">
              Select Category
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">Select category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className=" block text-sm font-medium text-gray-700 mb-1">
              Select food Type
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              onChange={(e) => setFoodType(e.target.value)}
              value={foodType}
            >
              <option value="veg">veg</option>
              <option value="non-veg">non-veg</option>
            </select>
          </div>

          <button
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

export default EditItem;
