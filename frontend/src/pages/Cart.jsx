import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";

function Cart() {
  // MAIN CART PAGE
  const { cartItems, totalAmount } = useSelector((state) => state.user);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      {/* div so that items display properly on small devices */}
      <div className=" w-full max-w-200">
        <div className="flex items-center gap-5 mb-6 relative">
          {/* Back Button  */}
          <div className="z-10 cursor-pointer" onClick={() => navigate("/")}>
            <IoArrowBack size={35} className="text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-start">Your Cart</h1>
        </div>
        {cartItems?.length == 0 ? (
          <p className="text-center">Your Cart is Empty</p>
        ) : (
          <>
            <div className="space-y-5">
              {cartItems.map(
                (
                  item,
                  index, // map redux cartitem object and if found send to CartItemCard only sending no display(cartItemCard) here
                ) => (
                  <CartItemCard data={item} key={index} />
                ),
              )}
              {/*  DIV FOR TOTAL AMOUNT  */}
              <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
                <h1 className="text-lg font-semibold">Total Amount</h1>
                <span className="text-xl font-bold text-[#ff4d2d]">
                  {totalAmount}
                </span>
              </div>
              {/* CHECKOUT BUTTON  */}
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer"
                  onClick={() => navigate("/checkout")}
                >
                  {" "}
                  Proceed to Check Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
