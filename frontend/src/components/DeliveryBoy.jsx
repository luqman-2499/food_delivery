import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClipLoader } from "react-spinners";

// DELIVERY BOY DASHBOARD
// ORDERS DSIPLAY, ACCEPT ORDERS, DELIVER THE CURRENT ORDER
function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);
  // State to show assignments on page
  const [availableAssignments, setAvailableAssignments] = useState(null);

  // State for delivery Stats
  const [todayDeliveries, setTodayDeliveries] = useState([]);

  const [currentOrder, setCurrentOrder] = useState();

  const [showOtpBox, setShowOtpBox] = useState(false);

  const [otp, setOtp] = useState("");
  const [loading, setLooading] = useState(false);
  const [message, setMessage] = useState("");

  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);

  // Socket Sending Delivery Boy Location to User 'Track Orders' Page
  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return;

    let watchId;
    if (navigator.geolocation) {
      ((watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setDeliveryBoyLocation({ lat: latitude, long: longitude });
        socket.emit("updateLocation", {
          latitude,
          longitude,
          userId: userData._id,
        });
      })),
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
        });
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, userData]);

  // GET AVAILABLE ASSIGNMENTS
  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignments(result.data.formatted);
    } catch (error) {
      console.log(error);
    }
  };

  // ACCEPT ORDER FUCNTION
  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        {
          withCredentials: true,
        },
      );
      await getCurrentOrder();
    } catch (error) {
      console.log(error);
    }
  };

  // GET CURRENT ORDER
  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order/`,
        {
          withCredentials: true,
        },
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  // SEND OTP TO USER

  const sendOtp = async () => {
    setLooading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp/`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
        {
          withCredentials: true,
        },
      );
      setLooading(false);
      setShowOtpBox(true);
      console.log(result.data);
    } catch (error) {
      console.log(error.response.data);
      setLooading(false);
    }
  };

  // OTP VERIFICATION

  const verifyOtp = async () => {
    setMessage("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp/`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        {
          withCredentials: true,
        },
      );
      setMessage(result.data.message);
      location.reload();
      setShowOtpBox(false);
      setOtp("");
      setCurrentOrder(null);
      console.log(result.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // DAILY DELIVERIES DATA
  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true },
      );
      console.log(result.data);
      setTodayDeliveries(result.data);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  // Create Real Time Socket for Status Updates
  useEffect(() => {
    socket?.on("newAssignment", (data) => {
      if (data.sentTo == userData._id) {
        setAvailableAssignments((prev) => [...prev, data]);
      }
    });

    return () => {
      socket?.off("newAssignment");
    };
  }, [socket]);

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
    handleTodayDeliveries();
  }, [userData]);

  // DELIVERY EARNNGS
  const ratePerDelivery = 40;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0,
  );

  return (
    <div className="w-full min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      {/* FOR BIG AND MEDIUM SCREENS  */}
      <div className="w-full max-w-200 flex flex-col gap-5 items-center">
        {/* welcome DIV */}
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 font-bold">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData.fullName}
          </h1>
          <p className="text-gray-600 font-semibold mt-2">
            Latitude: {deliveryBoyLocation?.lat}, Longitude:
            {deliveryBoyLocation?.long}
          </p>
        </div>

        {/* DELIVERY EARNINGS STATS AND CHART  */}
        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">
            Today's Earning Stats
          </h1>
          {/* box for graph  */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}: 00`} />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, "orders"]}
                labelFormatter={(label) => `${label}:00`}
              />
              <Bar dataKey="count" fill="#ff4d2d" />
            </BarChart>
          </ResponsiveContainer>

          {/* Amount Received for Each Delivery  */}
          <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center border border-orange-100">
            <h1 className="text-xl font-bold mb-2 text-gray-800">
              Today's Earning
            </h1>
            <span className="text-3xl font-bold text-green-600">
              {totalEarning}
            </span>
          </div>
        </div>

        {/* IF NO CURRENT ORDERS SHOW THIS DIV  */}

        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
              Available Orders
            </h1>
            {/* Maping All Orders  */}
            <div className="space-y-4">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  // Rounded Box Div
                  <div
                    className="border rounded-lg p-4 flex justify-between items-center"
                    key={index}
                  >
                    {/* Main Map  */}
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        {a?.shopName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {a?.deliveryAddress.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.items.length} Items : {a.subtotal}
                      </p>
                    </div>
                    <button
                      className="bg-[#ff4d2d] text-white px-2 py-1 rounded-lg text-sm hover:bg-orange-600 cursor-pointer"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept Order
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No Available Orders</p>
              )}
            </div>
          </div>
        )}

        {/* CURRENT ORDERS AVAILABEL THEN SHOW  */}

        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-200">
            <h2 className="text-lg font-bold mb-3"> 📦 Current Order</h2>
            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold text-sm">
                {currentOrder?.shopOrder.shop.name}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrder?.deliveryAddress.text}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrder?.shopOrder.shopOrderItems.length} Items |{" "}
                {currentOrder.shopOrder.subtotal}
              </p>
            </div>
            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  long: userData.location.coordinates[0],
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  long: currentOrder.deliveryAddress.longitude,
                },
              }}
            />

            {!showOtpBox ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200 cursor-pointer"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader size={20} color="white" />
                ) : (
                  "Mark as Delivered..."
                )}
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-100">
                <p className="font-semibold mb-2">
                  Enter OTP sent to{" "}
                  <span className="text-[#ff4d2d] text-medium">
                    {currentOrder.user.fullName}
                  </span>{" "}
                </p>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                {message && (
                  <p className="text-center text-green-500 text-2xl mb-4">
                    {message}
                  </p>
                )}

                <button
                  className="w-full bg-[#ff4d2d] text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all cursor-pointer"
                  onClick={verifyOtp}
                  disabled={!otp}
                >
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
