import React, { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { FaSearchLocation } from "react-icons/fa";
import { TbCurrentLocationFilled } from "react-icons/tb";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaRegCreditCard } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import { serverUrl } from "../App";
import { addMyOrder } from "../redux/userSlice";
import { toast } from "react-toastify";
import { resetCart } from "../redux/userSlice";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// function RecenterMap({ location }) {
//   if (location.lat && location.long) {
//     const map = useMap(); // useMap hook to be used outside ONLY ! used to reset map
//     map.setView([location.lat, location.long], 16, { animate: true }); // used to show recentred updated map
//   }
//   return null;
// }

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location.lat && location.long) {
      map.setView([location.lat, location.long], 16, {
        animate: true,
      });
    }
  }, [location, map]);

  return null;
}


function CheckOut() {
  const navigate = useNavigate();
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector(
    (state) => state.user,
  );
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  // Update the Inout Address
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentLoading, setCurrentLoading] = useState(false);
  const deliveryFee = totalAmount > 300 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;
  const remaining = 300 - totalAmount;

  // DARG THE MAP POINTER
  const onDragEnd = (e) => {
    console.log(e.target._latlng); // log only e and In console u can see inside target we have letlng which givs lat and long of city
    const { lat, lng } = e.target._latlng; // Store New latitude aand longitude values In new varaibles
    dispatch(setLocation({ lat, long: lng })); // Dispatch those new values and store in lat, long keys in redux mapSlice
    getAddressByLatLng(lat, lng); // Pass those values to fucntion()
  };

  // GET Current Location of User when button 'current location' clicked
  const getCurrentLocation = async () => {
    setCurrentLoading(true);
    const latitude = userData.location.coordinates[1];
    const longitude = userData.location.coordinates[0];
    dispatch(setLocation({ lat: latitude, long: longitude }));
    getAddressByLatLng(latitude, longitude);
    setCurrentLoading(false);
  };

  // Based on new { lat, lng } use API to GET New Address line and display on 'Search input Bar'
  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`, // Using Reverse API to GET address line from latitude aand longitude
      );
      dispatch(setAddress(result?.data?.results[0].address_line2)); // Once address is fetched dispatch in redux so that 'address' key value is updated
    } catch (error) {
      console.log(error);
    }
  };

  // Allows user to type and then search for typed location from 'search bar'
  const getLatLngByAddress = async () => {
    if (!addressInput.trim()) return; // User doesnt type and hit search button. Trim is used soemtimes spaces counted s text so.
    setSearchLoading(true);
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`,
      ); // Use Frward API ton GET the typed Text location from user.
      if (!result.data.features.length) {
        toast.error("Location not found");
        return;
      } // If location not found return nothing
      const { lat, lon, formatted } = result.data.features[0].properties;
      dispatch(setLocation({ lat, long: lon }));
      dispatch(setAddress(formatted)); // formaatted cleans up messy user text. since redux address is updated it goes to useEffect
    } catch (error) {
      console.log(error);
    } finally {
      setSearchLoading(false);
    }
  };

  //  PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!location?.lat || !location?.long || !addressInput) {
      toast.warning("Please select delivery address");
      return;
    }
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.long,
          },
          totalAmount: AmountWithDeliveryFee,
          cartItems,
        },
        { withCredentials: true },
      );

      // PAYMENT METHODS
      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data));
        localStorage.removeItem("cartItems");
        dispatch(resetCart());
        toast.success("Order placed successfully");
        navigate("/order-placed");
      } else {
        // Call fucntion we paste a script of razorpay window in index.html
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        toast.info("Redirecting to payment Gateway");
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Unable to open Payment gateway!! Please try again or use COD";
      toast.error(msg);
    }
  };

  // TO OPEN RAZORPAY WINDOW
  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Snap",
      description: "Food Delivery Website",
      order_id: razorOrder.id,

      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true },
          );

          dispatch(addMyOrder(result.data));
          localStorage.removeItem("cartItems");
          dispatch(resetCart());
          toast.success("Payment successful & order placed");
          navigate("/order-placed");
        } catch (error) {
          const msg =
            error?.response?.data?.message || "Payment verification failed";
          toast.error(msg);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    // we set address meaning if adress changes auto run this and save the formaatted address and store in setAddressInput()
    // Once address updated it re-renders componenet UI and then in value of input shows clean formatted Address
    setAddressInput(address || "");
  }, [address]);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6 ">
      {/* Back Button  */}
      <div
        className="absolute top-5 left-5 z-10 cursor-pointer"
        onClick={() => navigate("/cart")}
      >
        <IoArrowBack size={35} className="text-orange-600" />
      </div>

      {/* div for Adjustment for big and small devices  */}
      <div className="w-full max-w-230 bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="font-bold text-2xl text-gray-800">Check Out</h1>

        {/* LOCATION and MAP SECTION  */}
        <section>
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <FaLocationDot size={24} className="text-[#ff4d2d]" />
            Delivery Location
          </h2>
          <div className="flex gap-2 mb-3 items-center">
            <input
              type="text"
              className="flex-1 border border-gray-300 roundd-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] mt-3 rounded-xl"
              placeholder="Enter Your Delivery Address..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-[#ff4d2d] hover:bg-orange-600 text-white px-3 py-2 rounded-full flex items-center justify-center h-12 w-12 shrink-0 cursor-pointer"
              onClick={getLatLngByAddress}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <ClipLoader size={20} color="white" />
              ) : (
                <FaSearchLocation />
              )}
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 rounded-full flex items-center justify-center h-12 w-12 shrink-0 cursor-pointer"
              onClick={getCurrentLocation}
              disabled={currentLoading}
            >
              {currentLoading ? (
                <ClipLoader size={20} color="white" />
              ) : (
                <TbCurrentLocationFilled />
              )}
            </button>
          </div>

          {/* MAP VISUAL  */}
          <div className="rounded-xl border overflow-hidden">
            {/* Inner box */}
            <div className="h-64 w-full flex items-center justify-center">
              {location?.lat && location?.long ? (
                <MapContainer
                  className="w-full h-full"
                  center={[location.lat, location.long]} // focus on those lat and long
                  zoom={16} // More zoom More things to see around better 16-18
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap location={location} />
                  <Marker
                    position={[location.lat, location.long]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  ></Marker>
                </MapContainer>
              ) : (
                <p className="text-sm text-gray-500">Loading map...</p>
              )}
            </div>
          </div>
        </section>

        {/* PAYMENT METHODS DESIGN ONLY */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Payment Methods
          </h2>

          {/* TWO TYPES OF PAYMENT  */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* COD  */}
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-oraange-50 shadow cursor-pointer" : "border-gray-300 hover:border-gray-300 cursor-pointer"}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-200">
                <MdDeliveryDining className="text-green-700 text-3xl" />
              </span>
              <div>
                <p className="font-semibold text-gray-900">cash on delivery</p>
                <p className="text-xs text-gray-600 mt-1">pay on delivery</p>
              </div>
            </div>

            {/* ONLINE  */}
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "online" ? "border-[#ff4d2d] bg-oraange-50 shadow cursor-pointer" : "border-gray-300 hover:border-gray-300 cursor-pointer"}`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-200">
                <FaMobileScreenButton className="text-blue-700 text-2xl" />
              </span>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-200">
                <FaRegCreditCard className="text-purple-700 text-2xl" />
              </span>
              <div>
                <p className="font-semibold text-gray-900">
                  UPI/credit/debit card
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Pay securely online
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ORDER SUMMARY  */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Order Summary
          </h2>
          {/* GET cartItems from Redux userSlcie */}
          <div className="rounded-xl border space-y-2 bg-gray-50 p-4">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-medium text-gray-600 font-medium"
              >
                {/* LEFT SIDE ITEMS  */}
                <span>
                  {item.name} * {item.quantity}
                </span>
                <span className=""> {item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            {/* SUBTOTAL  */}
            <div className="flex justify-between text-gray-900 font-semibold">
              <span>Sub Total</span>
              <span>{totalAmount}</span>
            </div>
            {/* DELIVERY FEE  */}
            <div className="flex justify-between font-medium text-gray-600">
              <span>
                Delivery Fee{" "}
                {deliveryFee !== 0 && (
                  <span className="text-xs font-semibold text-green-600 ml-1">
                    (Add items worth {remaining} more for free delivery)
                  </span>
                )}
              </span>
              <span
                className={
                  deliveryFee === 0 ? "text-green-600" : "text-gray-600"
                }
              >
                {deliveryFee === 0 ? "Free" : deliveryFee}
              </span>
            </div>
            {/* TOTAL AMOUNT  */}
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
              <span>Total Amount</span>
              <span>{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        {/* PLACE ORDER BUTTON  */}
        <button
          className="w-full bg-[#ff4d2d] hover:bg-orange-600 text-white py-3  font-semibold rounded-full text-lg cursor-pointer"
          onClick={handlePlaceOrder}
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
}
export default CheckOut;
