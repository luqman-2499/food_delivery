import React, { useEffect, useState } from "react";
import { FaLeaf } from "react-icons/fa";
import { GiChickenOven } from "react-icons/gi";
import { FaRegStar } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { FaCartArrowDown } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQuantity, removeCartItem } from "../redux/userSlice";
import { toast } from "react-toastify";

// USER DASHBAORD SUGGESTED ITEMS CARD COMPONENT
function FoodCard({ data }) {
  // STATE FOR QUANTITY
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.user);

  // UPDATE ITEMS ON UI
  useEffect(() => {
    const item = cartItems.find((i) => i.id === data._id);

    if (item) {
      setQuantity(item.quantity);
    } else {
      setQuantity(0);
    }
  }, [cartItems, data._id]);

  // RATING STARS
  const ratingStars = (rating) => {
    // r = 3
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-lg" />
        ),
      );
    }
    return stars;
  };

  // HANLDE QTY INCREASE
  // const handleIncrease = () => {
  //   const newQty = quantity + 1;
  //   setQuantity(newQty);
  // };
  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);

    dispatch(updateQuantity({ id: data._id, quantity: newQty }));
  };

  // HANDLE QTY DECREASE
  // const handleDecrease = () => {
  //   if (quantity > 0) {
  //     const newQty = quantity - 1;
  //     setQuantity(newQty);
  //   }
  // };
  const handleDecrease = () => {
    if (quantity > 0) {
      const newQty = quantity - 1;
      setQuantity(newQty);

      if (newQty === 0) {
        dispatch(removeCartItem(data._id));
      } else {
        dispatch(updateQuantity({ id: data._id, quantity: newQty }));
      }
    }
  };

  return (
    // CARD DESIGN DIV
    <div className="w-62 rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duraation-300 flex flex-col">
      {/* Image Inside Card  */}
      <div className="relative w-full h-35 flex justify-center items-center bg-white">
        {/* VEG AND NON VEG ICONS  */}
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md">
          {data.foodType == "veg" ? (
            <FaLeaf className="text-green-600 text-xl" />
          ) : (
            <GiChickenOven className="text-red-600 text-xl" />
          )}
        </div>
        <img
          src={data.image}
          alt=""
          className=" w-full h-full object-cover transition-transform duration-300 hover:scale-105 "
        />
      </div>

      {/* FOOD INFO  */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-bold text-black text-lg truncate">{data.name}</h1>

        {/* RATING*/}
        <div className="flex items-center gap-1 mt-1 shadow-sm">
          {ratingStars(data.rating?.average || 0)}
          <span className="text-sm text-gray-600 mt-1">
            {data.rating?.count || 0}
          </span>
        </div>

        {/* PRICE  */}
        <div className="flex items-center justify-between pt-3 mt-auto">
          <span className="font-bold text-gray-900 text-lg">{data.price}</span>
        </div>

        {/* QUNATITY BUTTON  */}
        <div className="w-fit ml-auto flex items-center border rounded-full overflow-hidden shadow-sm">
          <button
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleDecrease}
          >
            <FaMinus size={14} />
          </button>
          <span>{quantity}</span>
          <button
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleIncrease}
          >
            <FaPlus size={14} />
          </button>

          {/* CART BUTTON  */}
          <button
            className={`${cartItems.some((i) => i.id == data._id) ? "bg-green-700" : "bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors cursor-pointer`}
            onClick={() => {
              if (quantity === 0) return;

              dispatch(
                addToCart({
                  id: data._id,
                  name: data.name,
                  price: data.price,
                  image: data.image,
                  shop: data.shop,
                  quantity: quantity,
                  foodType: data.foodType,
                }),
              );
            }}
          >
            <FaCartArrowDown size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
