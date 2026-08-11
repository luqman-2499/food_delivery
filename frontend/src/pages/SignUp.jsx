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

function SignUp() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  // PASSWORD EYE BUTTON
  const [showPassword, setShowPassword] = useState(false);

  // FOR ROLE SWITCH
  const [role, setRole] = useState("user");

  // For Navigating to another Page without Page Refresh
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");

  // FOR ERROR MESSAGE FOR FEILDS
  const [err, setErr] = useState("");

  // LOADING SPINNER WHILE SBMITTING FORM
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  // FUCNTION FOR SIGNUP BUTTTON

  const handleSignup = async () => {
    if (!fullName || !email || !password || !mobile) {
      toast.warning("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`, // Go to this controller and create user then return
        {
          fullName,
          email,
          mobile,
          password,
          role,
        },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data));
      toast.success(result.data.message || "Signup successful");
      navigate("/"); // Once signup success return user to home page based on his role that dashbaord page
      setErr("");
    } catch (error) {
      // ERROR MESSAGE
      const msg = error?.response?.data?.message || "Signup failed";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // FIREBASE GOOGLE AUTHENTICATION SETUP

  const handleGoogleAuth = async () => {
  try {
    if (!mobile) {
      return setErr("Mobile Number is Required !");
    }

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const { data } = await axios.post(
      `${serverUrl}/api/auth/google-auth`,
      {
        fullName: result.user.displayName,
        email: result.user.email,
        role,
        mobile,
      },
      { withCredentials: true },
    );

    dispatch(setUserData(data));
    navigate("/");
  } catch (error) {
    toast.error("Google signup failed");
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
          Create your account to get started to explore delicious food
          deliveries.
        </p>

        {/* FULL NAME  */}

        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter Your Full Name"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
          />
        </div>

        {/* MOBILE NUMBER  */}

        <div className="mb-4">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile Number
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter Your Mobile Number"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
            required
          />
        </div>

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

        {/* PASSWORD WITH SHOW HIDDNE ICON */}

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
          </div>
        </div>

        {/* ROLES SWITCH  */}

        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                key={r}
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : {
                        border: `1px solid ${primaryColor}`,
                        color: primaryColor,
                      }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SIGNUP  BUTTON  */}

        <button
          type="button"
          className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#e64323] text-white hover:bg-[#e64323] cursor-pointer mt-4`}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
        </button>
        {err && <p className="text-red-500 mt-3">*{err}</p>}

        {/* GOOGLE ACCOUNT SETUP  */}

        <button
          className="w-full mt-6 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 duration-200 border-gray-400 hover:bg-gray-200 cursor-pointer"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </button>

        <p
          className="text-center mt-6 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Aleady have an Account ?
          <span className="text-[#ff4d2d]">Sign In</span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
