import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter using SMTP

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// FUNCTION FOR SENDING OTP TO EMAIL; SUB AND BODY FORMAT DEFINED HERE

export const sendOtpMail = async ({ to, otp }) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password",
    html: `<p> Your OTP for Password Reset is <b>${otp}</b>, It Expires in 5 minutes. </p>`,
  });
};

// SEND OTP DELIVERY TO USER

export const sendDeliveryOtpMail = async ({ user, otp }) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "Delivery OTP",
    html: `<p> Your OTP for Delivery is <b>${otp}</b>, It Expires in 5 minutes. </p>`,
  });
};
