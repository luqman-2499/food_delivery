import React from "react";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { removeCartItem, updateQuantity } from "../redux/userSlice";

function CartItemCard({ data }) {
  // ONLY CART ITEMS COMPONENET

  const dispatch = useDispatch();

  const handleIncrease = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }));
  };

  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }));
    }
  };

  return (
    // CART ITEMS CARD COMPONENT
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shaodw border">
      {/* LEFT CONTENT */}
      <div className="flex items-center gap-4">
        <img
          src={data.image}
          alt=""
          className="object-cover rounded-lg w-20 h-20 border"
        />
        <div>
          <h1 className="text-xl font-medium text-gray-900 ">{data.name}</h1>
          <p className="text-medium text-gray-600">
            {data.price}x{data.quantity}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {data.price * data.quantity}
          </p>
        </div>
      </div>

      {/* RIGHT CONTENT  */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
          onClick={() => handleDecrease(data.id, data.quantity)}
        >
          <FaMinus size={14} />
        </button>
        <span>{data.quantity}</span>
        <button
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
          onClick={() => handleIncrease(data.id, data.quantity)}
        >
          <FaPlus size={15} />
        </button>
        <button
          className="p-2 bg-red-300 rounded-full hover:bg-red-500 cursor-pointer"
          onClick={() => dispatch(removeCartItem(data.id))}
        >
          <FaRegTrashCan size={18} />
        </button>
      </div>
    </div>
  );
}

export default CartItemCard;
