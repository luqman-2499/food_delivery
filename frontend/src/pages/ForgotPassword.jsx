import React, { useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { serverUrl } from "../App";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // FOR ERROR MESSAGE FOR FEILDS
  const [err, setErr] = useState("");

  // LOADING SPINNER WHILE SBMITTING FORM
  const [loading, setLoading] = useState(false);

  // FUNCTION TO SEND OTP

  const handleSendOtp = async () => {
    if (!email) {
      toast.warning("Email is required");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true },
      );
      console.log(result);
      setErr("");
      toast.success(result.data.message || "OTP sent successfully");
      setStep(2);
      setLoading(false);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to send OTP";
      setErr(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  // VERIFICATION OF OTP

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.warning("Enter OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true },
      );
      console.log(result);
      if (result.data) {
        setErr("");
        toast.success(result.data.message || "OTP verified");
        setStep(3);
        setLoading(false);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Invalid OTP";
      setErr(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  // NEW PASSWORD

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true },
      );
      setErr("");
      console.log(result);
      setLoading(false);
      toast.success(result.data.message || "Password reset successful");
      navigate("/signin");
    } catch (error) {
      const msg = error?.response?.data?.message || "Password Reset failed";
      setErr(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full p-8 max-w-md ">
        <div className="items-center flex gap-4 mb-4">
          <IoArrowBackOutline
            size={34}
            className="text-[#ff4d2d] mt-2 cursor-pointer"
            onClick={() => navigate("/signin")}
          />
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            {" "}
            Forgot Password
          </h1>
        </div>

        {/* ENTER EMAIL  */}

        {step == 1 && (
          <div>
            <div className="mb-6 mt-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter Your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            <button
              type="button"
              className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#e64323] text-white hover:bg-[#e64323] cursor-pointer mt-4`}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Send OTP"}
            </button>
            {err && <p className="text-red-500 mt-3">*{err}</p>}
          </div>
        )}

        {/* ENTER OTP  */}

        {step == 2 && (
          <div>
            <div className="mb-6 mt-4">
              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-1"
              >
                OTP
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                required
              />
            </div>

            <button
              type="button"
              className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#e64323] text-white hover:bg-[#e64323] cursor-pointer mt-4`}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Verify OTP"}
            </button>
            {err && <p className="text-red-500 mt-3">*{err}</p>}
          </div>
        )}

        {/* SET NEW PASSWORD  */}

        {step == 3 && (
          <div>
            <div className="mb-6 mt-4">
              <label
                htmlFor="newpassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  placeholder="Enter new Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                  required
                />

                <button
                  type="button"
                  className="absolute top-3 right-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD  */}
            <div className="mb-6 mt-4">
              <label
                htmlFor="confirm-password"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  placeholder="Confirm Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  required
                />

                <button
                  type="button"
                  className="absolute top-3 right-3 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#e64323] text-white hover:bg-[#e64323] cursor-pointer mt-4`}
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ClipLoader size={20} color="white" />
              ) : (
                "Reset Password"
              )}
            </button>
            {err && <p className="text-red-500 mt-3">*{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
