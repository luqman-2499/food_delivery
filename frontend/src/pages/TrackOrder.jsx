import axios from "axios";
import React, { useEffect, useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

// USER ORDERS TRACKING PAGE AFTER MY ORDERS 'TRACK ORDER'
function TrackOrder() {
  const [currentOrder, setCurrentOrder] = useState(null);
  const navigate = useNavigate();
  const { socket } = useSelector((state) => state.user);
  const [liveLocations, setLiveLocations] = useState({});
  const { orderId } = useParams();
  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true },
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Socket
  useEffect(() => {
    socket?.on(
      "updateDeliveryLocation",
      ({ deliveryBoyId, latitude, longitude }) => {
        setLiveLocations((prev) => ({
          ...prev,
          [deliveryBoyId]: { lat: latitude, long: longitude },
        }));
      },
    );
    return () => {
      socket?.off("updateDeliveryLocation");
    };
  }, [socket]);

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div
        className="relative top-8 left-8 z-10 mb-2.5 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoArrowBack size={35} className="text-orange-600" />
        <h1 className="text-3xl font-bold md:text-center mb-4">Track Order</h1>
      </div>
      {/* User may order from different shops so map all  */}
      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div
          className="bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4"
          key={index}
        >
          {/* ORDER DETAILS  */}
          <div>
            <p className="text-xl font-bold mb-4 text-[#ff4d2d]">
              {shopOrder.shop.name}
            </p>
            <p className="font-semibold">
              <span className="font-medium text-gray-700">Items: </span>
              {shopOrder.shopOrderItems?.map((i) => i.name).join(",")}
            </p>
            <p className="font-semibold">
              <span className="font-medium text-gray-700">Sub Total: </span>
              {shopOrder.subtotal}
            </p>
            <p className="font-semibold">
              <span className="font-semibold mb-2 text-gray-700">
                Delivery Address:{" "}
              </span>
              {currentOrder.deliveryAddress?.text}
            </p>
          </div>

          {/* DELIVERY BOY DETAILS  */}
          {shopOrder.status != "delivered" ? (
            <>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="text-sm">
                  <p className="font-semibold mb-2">
                    <span className="text-gray-700">Delivery Boy Name: </span>
                    {shopOrder.assignedDeliveryBoy.fullName}
                  </p>
                  <p className="font-semibold">
                    <span className="text-gray-700">
                      Delivery Boy Contact No:{" "}
                    </span>
                    {shopOrder.assignedDeliveryBoy.mobile}
                  </p>
                </div>
              ) : (
                <p className="font-bold text-blue-600">
                  {" "}
                  Delivery Boy Not Assigned Yet
                </p>
              )}
            </>
          ) : (
            <p className="text-green-600 font-semibold text-xl">
              Order Delivered...
            </p>
          )}

          {/* SHOW MAP  */}
          {shopOrder.assignedDeliveryBoy &&
            shopOrder.status !== "delivered" && (
              <div className="h-64 w-full rounded-2xl overflow-hidden shadow-md">
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: liveLocations[
                      shopOrder.assignedDeliveryBoy._id
                    ] || {
                      lat: shopOrder.assignedDeliveryBoy.location
                        .coordinates[1],
                      long: shopOrder.assignedDeliveryBoy.location
                        .coordinates[0],
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      long: currentOrder.deliveryAddress.longitude,
                    },
                  }}
                />
              </div>
            )}
        </div>
      ))}
    </div>
  );
}

export default TrackOrder;
