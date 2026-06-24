import React from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";
import { useState } from "react";
import { MdCall, MdMail } from "react-icons/md";
import { MdAddIcCall } from "react-icons/md";
import { ImLocation2 } from "react-icons/im";
import { IoIosCard } from "react-icons/io";

function OwnerOrderCard({ data }) {
  const dispatch = useDispatch();
  const [availableBoys, setAvailableBoys] = useState([]);
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true },
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result.data.availableBoys);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Name Email Mobile  */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {data.user.fullName}
        </h2>
        <p className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
          {" "}
          <MdMail size={22} className="mt-1 text-blue-700" />
          <span>{data.user.email}</span>
        </p>
        <p className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
          <MdCall size={24} className="text-green-600" />
          <span>{data.user.mobile}</span>
        </p>
        {data.paymentMethod == "online" ? (
          <p className="flex items-center gap-2 text-gray-700 font-semibold">
            {" "}
            <IoIosCard size={24} className="text-purple-700" />{" "}
            <span>Payment:{data.payment ? "true" : "false"}</span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-gray-700 font-semibold">
            {" "}
            <IoIosCard size={24} className="text-purple-700" />{" "}
            <span>Payment Method: {data.paymentMethod}</span>
          </p>
        )}
      </div>

      {/* Address with Lat Long  */}
      <div className="flex items-start flex-col gap-2 text-gray-800 font-semibold">
        <p className="flex items-center gap-2">
          <ImLocation2 size={24} className="text-red-600 relative top-1" />
          <span>{data?.deliveryAddress?.text}</span>
        </p>

        <p className="text-gray-600 text-sm pl-9">
          Lat: {data?.deliveryAddress?.latitude}, Long:
          {data?.deliveryAddress?.longitude}
        </p>
      </div>
      {/* MAP ITEMS USER ORDERED  */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {data.shopOrders.shopOrderItems.map((item, index) => (
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
          </div>
        ))}
      </div>

      {/* STATUS OF ORDERS */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-400">
        <span className="text-sm text-gray-600 font-medium">
          Status:
          <span className="text-red-500 font-semibold text-capitalize">
            {" "}
            {data.shopOrders.status}
          </span>
        </span>

        <select
          className="rounded-md border px-2 py-2 text-medium focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d] font-semibold cursor-pointer"
          onChange={(e) =>
            handleUpdateStatus(
              data._id,
              data.shopOrders.shop._id,
              e.target.value,
            )
          }
        >
          <option value="">Update</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out for delivery">Out for Delivery</option>
        </select>
      </div>

      {/* AVAILABLE DELIVERY BOYS  */}
      {data.shopOrders.status === "out for delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-100">
          {data.shopOrders.assignedDeliveryBoy ? (
            <p>Assigned Delivery Boy:</p>
          ) : (
            <p>Available Delivery Boys: </p>
          )}
          {availableBoys.length > 0 ? (
            availableBoys.map((b, index) => (
              <div className="text-[#ff4d2d] font-semibold mt-2 text-medium">
                {b.fullName} - {b.mobile}
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? (
            <div>
              {data.shopOrders.assignedDeliveryBoy.fullName} -{" "}
              {data.shopOrders.assignedDeliveryBoy.mobile}{" "}
            </div>
          ) : (
            <div> Waiting for Delivery Boy</div>
          )}
        </div>
      )}

      {/* TOTAL AMOUNT  */}
      <div className="text-right font-bold text-gray-800 text-medium">
        Total: {data.shopOrders.subtotal}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
