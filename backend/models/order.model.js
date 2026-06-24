import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema(
  {
    // item name which is ordered
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      reqquired: true,
    },
    // Shortcut way only if we have single value for field like here only number so,
    name: String,
    price: Number,
    quantity: Number,
  },
  { timestamps: true },
);

const shopOrderSchema = new mongoose.Schema(
  {
    // Shop Name
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    // Owner Name
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Divide the AMOUNT to send to different shops for different items
    subtotal: Number,

    // Different items have different data like name, qty, etc
    shopOrderItems: [shopOrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "preparing", "out for delivery", "delivered"],
      default: "pending",
    },

    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null, // If Status pending so delivery null initial
    },

    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deliveryOtp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const orderSchema = new mongoose.Schema(
  {
    // which user ordered
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    deliveryAddress: {
      text: String,
      latitude: Number,
      longitude: Number,
    },

    totalAmount: {
      type: Number,
    },

    // Users can order from different shops so,
    // when order placed it should be sent only to that specific shop,
    shopOrders: [shopOrderSchema],
    // FOR RAZORPAY ONLINE
    payment: {
      type: Boolean,
      default: false,
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },
  },

  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
