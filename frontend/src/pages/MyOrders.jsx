import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { useEffect } from "react";
import { setMyOrders, updateRealtimeOrderStatus } from "../redux/userSlice";

function MyOrders() {
  const { userData, myOrders, socket } = useSelector((state) => state.user); // FULL ORDER DATA IS STORED IN REDUX userSlice.js => MyOrders

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // New Order Update to Onwer in Realtime Socket; No Refresh
  useEffect(() => {
    socket?.on("newOrder", (data) => {
      if (data.shopOrders?.owner?._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]));
      }
    });

    // Real Time Status Updates Socket;
    socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }));
      }
    });

    // TURN OFF SOCKET EVENT
    return () => {
      socket?.off("newOrder");
      socket?.off("update-status");
    };
  }, [socket, userData?._id]);
  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      {/* for big and small devices div */}
      <div className="w-full max-w-200 p-4">
        {/* MAIN HEADING OF PAGE  */}
        <div className="flex items-center gap-5 mb-6">
          <div className="z-10" onClick={() => navigate("/")}>
            <IoArrowBack size={35} className="text-[#ff4f2d] cursor-pointer" />
          </div>
          <h1 className="text-2xl font-bold text-start">my orders</h1>
        </div>

        {/* MAPPING ALL ORDERS  */}
        <div className="space-y-6">
          {myOrders?.map((order, index) =>
            userData.role === "user" ? (
              <UserOrderCard data={order} key={index} /> // Send WHOLE ORDERS OBJECT TO USER CARD IF ROLE IS USER
            ) : userData.role === "owner" ? (
              <OwnerOrderCard data={order} key={index} />
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
