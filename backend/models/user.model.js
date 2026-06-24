import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    mobile: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      required: true,
    },

    resetOtp: {
      type: String,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    otpExpires: {
      type: Date,
    },
    // Storing Socket Id
    socketId: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },

    // GeoJSON Format
    // To Store rider live location, update location, find nearest rider
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // longitude, latitude
    },
  },
  { timestamps: true },
);

// Specifying this feild to be treated as Map in DB
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
// user Model is stored in varaiable User. In DB It rules our lowercase and pluralize. So in DB users.
// User var used to interact with data for eg, User.create() to create a new user.
export default User;
