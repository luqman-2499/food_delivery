import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

function UserOrderCard({ data }) {
  // FOR RATING
  const [selectedRating, setSelectedRating] = useState({});

  // RATING
  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true },
      );

      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  // TO SHOW DATE ORDER CREATED
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* ORDER INFO DIV  */}
      <div className="flex justify-between border-b pb-2">
        {/* LEFT CONTENT  */}
        <div>
          <p className="font-semibold">Order #{data._id.slice(-6)}</p>
          <p className="text-sm text-gray-600">
            date: {formatDate(data.createdAt)}
          </p>
        </div>
        {/* RIGHT CONTENT  */}
        <div className="text-right">
          {/* since paymentMethod comes from direct order object so we do data.paymentMethod */}{" "}
          {data.paymentMethod == "cod" ? (
            <p className="text-sm text-gray-600 font-semibold">
              {data.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className="text-sm text-gray-600 font-semibold">
              {" "}
              Payment:
              {data.payment ? "true" : "false"}
            </p>
          )}
          <p className="font-medium text-red-600">
            {/* From the order’s shopOrders array, take first shop order and show its status. */}
            {data.shopOrders?.[0].status}
          </p>
        </div>
      </div>

      {/* ITEM INFO DIV; MAP SHOP Names */}
      {data.shopOrders.map((shopOrder, index) => (
        <div
          className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
          key={index}
        >
          <p className="font-semibold">{shopOrder.shop.name}</p>
          {/* MAP ITEM: NAMES,IMAGES, PRICE, QTY  */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder.shopOrderItems.map((item, index) => (
              <div
                className="shrink-0 w-40 border rounded-xl p-2 bg-white"
                key={index}
              >
                <img
                  className="rounded-lg w-full h-24 object-cover"
                  src={item.item.image}
                  alt="Item Images"
                />
                <p className="font-semibold mt-2 mb-2 text-sm">{item.name}</p>
                <p className="font-semibold text-gray-600 text-sm">
                  Qty: {item.quantity}*{item.price}
                </p>

                {shopOrder.status == "delivered" && (
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        className={` text-lg ${selectedRating[item.item._id] >= star ? "text-yellow-500" : "text-gray-500"}`}
                        onClick={() => handleRating(item.item._id, star)}
                      >
                        ☆
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* SUB TOTAL AND STATUS */}
          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-semibold">Sub Total: {shopOrder.subtotal}</p>
            <span className="text-sm font-medium text-red-600">
              Order Status: {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      {/* GRAND TOTAL OF ITEMS  */}
      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Grand Total: {data.totalAmount}</p>
        <button
          className="bg-[#ff4d2d] text-white px-4 py-2 rounded-lg text-medium font-semibold cursor-pointer"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>
      </div>
    </div>
  );
}

export default UserOrderCard;
