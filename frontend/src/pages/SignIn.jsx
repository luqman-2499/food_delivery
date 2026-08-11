import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { toast } from "react-toastify";

function SignIn() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";
  // PASSWORD EYE BUTTON
  const [showPassword, setShowPassword] = useState(false);

  // FOR ERROR MESSAGE FOR FEILDS
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // LOADING SPINNER WHILE SBMITTING FORM
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // SIGNIN FUCNTION

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.warning("Email and Password required");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data));
      toast.success(result.data.message || "Login successful");
      navigate("/");
      setErr("");
    } catch (error) {
      const msg = error?.response?.data?.message || "Login failed";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // FIREBASE GOOGLE AUTHENTICATION SETUP

  const handleGoogleAuth = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const { data } = await axios.post(
      `${serverUrl}/api/auth/google-auth`,
      {
        email: result.user.email,
      },
      { withCredentials: true },
    );

    dispatch(setUserData(data));
    navigate("/");
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Google login failed"
    );
  }
};

  return (
    // DIV - MAIN COLOR OF PAGE
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border"
        style={{ borderColor: borderColor, borderStyle: "solid" }}
      >
        <h1
          className={`text-3xl font-bold mb-2`}
          style={{ color: primaryColor }}
        >
          Snap Delivery
        </h1>

        <p className="text-gray-600 mb-8">
          Sign in to your account to get started to explore delicious food
          deliveries.
        </p>

        {/* EMAIL  */}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter Your Email"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        {/* PASSWORD WITH SHOW HIDDEN ICON */}

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              placeholder="Enter Your Password"
              style={{ border: `1px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />

            <button
              className="absolute top-4 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>

            <div
              className="text-right mb-5 text-[#ff4d2d] font-medium cursor-pointer"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password
            </div>
          </div>
        </div>

        {/* SignIn  BUTTON  */}

        <button
          type="button"
          className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#e64323] text-white hover:bg-[#e64323] cursor-pointer mt-4`}
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>
        {err && <p className="text-red-500 mt-3">*{err}</p>}

        {/* GOOGLE ACCOUNT SETUP  */}

        <button
          className="w-full mt-6 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 duration-200 border-gray-400 hover:bg-gray-200 cursor-pointer"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign in with Google</span>
        </button>

        <p
          className="text-center mt-6 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Want to create new account ?
          <span className="text-[#ff4d2d]">Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
