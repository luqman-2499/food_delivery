import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemByCity from "./hooks/useGetItemsByCity";
import Cart from "./pages/Cart";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrder from "./pages/TrackOrder";
import Shop from "./pages/Shop";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { setSocket } from "./redux/userSlice";
import PageNotFound from "./pages/PageNotFound";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// SERVER BACKEND URL
export const serverUrl = "http://localhost:8000";

function App() {
  const loading = useGetCurrentUser();
  useUpdateLocation();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();
  const { userData } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  // SOCKET SETUP
  useEffect(() => {
    // Creates Backedn Connection and Stores socket io methods and tools, etc... and disoatched to Redux
    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    // If socket connected with backend run this
    socketInstance.on("connect", () => {
      // Send event name 'identity' and data the userId to backend socket.js
      if (userData) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    });
    return () => {
      socketInstance.disconnect();
    };
  }, [userData?._id]);
  if (loading) return <div>Loading....</div>;
  return (
    // FIRST LETTER OF EVERY WORD CAPITALIZED
    <div className="capitalize">
      <ToastContainer position="top-center" />
      <Routes>
        <Route
          path="/signup"
          element={!userData ? <SignUp /> : <Navigate to={"/"} />}
        ></Route>

        <Route
          path="/signin"
          element={!userData ? <SignIn /> : <Navigate to={"/"} />}
        ></Route>

        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
        ></Route>

        <Route
          path="/"
          element={userData ? <Home /> : <Navigate to={"/signin"} />}
        ></Route>

        <Route
          path="create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />}
        ></Route>

        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to={"/signin"} />}
        ></Route>

        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to={"/signin"} />}
        ></Route>

        <Route
          path="/cart"
          element={userData ? <Cart /> : <Navigate to={"/signin"} />}
        ></Route>

        <Route
          path="/checkout"
          element={userData ? <CheckOut /> : <Navigate to={"/signin"} />}
        ></Route>

        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />}
        ></Route>

        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to={"/signin"} />}
        ></Route>
        <Route
          path="/track-order/:orderId"
          element={userData ? <TrackOrder /> : <Navigate to={"/signin"} />}
        ></Route>
        <Route
          path="/shop/:shopId"
          element={userData ? <Shop /> : <Navigate to={"/signin"} />}
        ></Route>
        <Route path="*" element={<PageNotFound />}></Route>
      </Routes>
    </div>
  );
}

export default App;
