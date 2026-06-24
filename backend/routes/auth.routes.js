import express from 'express'
import { googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from '../controllers/auth.controller.js'


const authRouter = express.Router()

// Authentication APIs

authRouter.post("/signup", signUp)
authRouter.post("/signin", signIn)
authRouter.delete("/signout", signOut)

// OTP ROUTES

authRouter.post("/send-otp", sendOtp)
authRouter.post("/verify-otp", verifyOtp)
authRouter.post("/reset-password", resetPassword)

// Google Auth Route

authRouter.post("/google-auth", googleAuth)



export default authRouter