import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

// CREATE INSTANCE FOR RAZORPAY

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// PLACING ORDERS OF USERS
export const placeOrder = async (req, res) => {
  try {
    // Bring items from CheckOut
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    // Check Cart Items Available
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is Empty" });
    }

    // If NO Data in Delivery Address
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "Incomplete Delivery Address" });
    }

    // Push Different Items based on their Shops
    const groupItemsByShop = {}; // Initial Empty, Later key: shopId  value: [item]
    cartItems.forEach((item) => {
      // item is just a variable it hold whole object of cartItems for every loop holds object which includes { id, name, price, shop, etc......}
      const shopId = item.shop; // from cartItems redux GET shop field (holds full actual shop Id) for that item.
      // shopId holds the actual shop field ID Number E.g. shopId : 'A' normal var storing
      if (!groupItemsByShop[shopId]) {
        // Initially checking {} has ['A'] or Not well No object empty in shopId just varaible 'A' not ['A'] True

        groupItemsByShop[shopId] = []; // Above condtion TRUE so, create object;  JS Format: object[key] = value so {A: []}
      }
      groupItemsByShop[shopId].push(item); // Now in Array of key 'A' push whole item OBJECT WHICH INCLUDES {A: [ {id,name, shop, price, etc } ] }
    });

    // FINALLY ALL ITEMS PUSHED IN THIER RESPECTIVE SHOPS
    // groupItemsByShop = {
    //   A: [
    //     { name: "Burger", shop: "A", price: 200, etc... },
    //     { name: "Fries", shop: "A", price:100, etc... }
    //   ],
    //   B: [
    //     { name: "Pizza", shop: "B", price:100, etc.... }
    //   ]
    // }

    // Now we find the each shop from shop model using the key stored in groupItemsByShop() and populate whole data. Eg. take 'A' and map with shop model
    // Object.keys wil return only keys from object now we will map each shopId
    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        // Go to Shop model find this id ('A') in Shop model Check shopId === Object._Id;
        const shop = await Shop.findById(shopId).populate("owner");
        // shop = { EXAMPLE
        //  _id: "A",
        //  name: "Food Hub",
        //  image: "...",
        //  owner: "U1",  // Here we have only ID so we populate
        //  city: "Manama",
        //  state: "...",
        //  address: "...",
        //  items: ["I1","I2"]
        // }
        // NOW POPULATE Owner from normal ID to full data what all we have in user about that owner keep in {}
        if (!shop) {
          throw new Error("Shop Not Found");
        }

        // GET Items from each Shop

        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0,
        );
        //
        return {
          shop: shop.id, // from shop model findbyId line
          owner: shop.owner.id, // after populating owner we got id of owner
          subtotal, // calulcated subtotal for eaach item from groupItemsByShop[shopId]
          shopOrderItems: items.map((i) => ({
            // items varaible above holds each item data take data from there
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      }),
    );

    // CREATE ORDER FOR ONLINE RAZORPAY PAYMEMT!

    if (paymentMethod == "online") {
      const razorOrder = await instance.orders.create({
        // Round-off amount to numbers,
        // convert to paise so *100
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      // CREATE ORDER
      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: razorOrder.id,
        payment: false,
      });

      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
      });
    }

    // CREATE ORDER FOR COD PAYMENT AND PLACE

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price",
    );
    await newOrder.populate("shopOrders.shop", "name socketId");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    // We define an Event for Socket and same Event we call in FrontEnd; User place order so owner will listen in frontend: Recceiving new order instantly No Refresh

    // REAL-TIME NEW ORDERS UPDATES TO OWNER NO REFRESH....

    const io = req.app.get("io");

    if (io) {
      // Sending data to multiple Shops
      newOrder.shopOrders.forEach((shopOrder) => {
        // stored owner socketId in a variable
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          // Sending real-time order using io.to()
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            deliveryAddress: newOrder.deliveryAddress,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            payment: newOrder.payment,
          });
        }
      });
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    return res.status(500).json({ message: `Order Creation Error ${error}` });
  }
};

// RAZORPAY PAYMENT VERIFICATION
export const verifyPayment = async (req, res) => {
  try {
    // In frontend we auto-receive paymentId so from front we send here
    const { razorpay_payment_id, orderId } = req.body;
    // Through paymentId we check wether payment is 'captured' by Razor or not using instance built-in methods() and funcs()
    const payment = await instance.payments.fetch(razorpay_payment_id); // The payments() check whetehr through this id aany ayment made or not !
    if (!payment || payment.status !== "captured") {
      // In payment we have many things
      return res.status(400).json({ message: "Payment Not Captured" });
    }
    // If payment captured then, we will find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order Not Found" });
    }
    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name socketId");
    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");

    // We define an Event for Socket and same Event we call in FrontEnd; User place order so owner will listen in frontend: Recceiving new order instantly No Refresh

    // REAL-TIME NEW ORDERS UPDATES TO OWNER NO REFRESH....

    const io = req.app.get("io");

    if (io) {
      // Sending data to multiple Shops
      order.shopOrders.forEach((shopOrder) => {
        // stored owner socketId in a variable
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          // Sending real-time order using io.to()
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            deliveryAddress: order.deliveryAddress,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            payment: order.payment,
          });
        }
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json({ message: `Verify Payment Error ${error}` });
  }
};

// GET ROLE BASED Users, Owners ORDERS IN 'MY ORDERS' PAGE

export const getMyOrders = async (req, res) => {
  try {
    // Find USER from userId

    const user = await User.findById(req.userId);

    // ROLE BASED GET ORDERS

    if (user.role === "user") {
      // From Orders find orders of current user based on matching current id and userId in token cookie Match (isAuth)
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 }) // GET The Latest Order like users last order dispalayed first SORT
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      // Auth Check for Owner
      const orders = await Order.find({ "shopOrders.owner": req.userId }) // If shop A logs in he gets order details.
        // ALL ORDERS ARE SENT TO OWNERS. EG. SHOP a RECIEVES ORDERS OF SHOP B AND VICE VERSA
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      // FILTER ORDERS SO OWNER RECEIVE ONLY HIS SHOP ORDERS NOT OTHER SHOPS ORDERS
      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        deliveryAddress: order.deliveryAddress,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id == req.userId),
        createdAt: order.createdAt,
        payment: order.payment,
      }));

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get Current User Orders Error ${error}` });
  }
};

// UPDATE STATUS OF ORDERS

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.find((o) => String(o.shop) === shopId);
    if (!shopOrder) {
      return res.status(400).json({ message: "Shop Order Not Found" });
    }
    shopOrder.status = status;

    // DELIVERY BOYS AND OUT FOR DELIVERY PART
    let deliveryBoysPayload = [];
    if (status === "out for delivery" && !shopOrder.assignment) {
      // No asignment created yet fr this order
      // From Order data in deliveryAddress Fetch lat and long
      const { longitude, latitude } = order.deliveryAddress;
      // Find Delivery Boys within 5km Radius
      // stores array of full rider documents (not just IDs).
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        // Check those boys whoose location within our order.deliveryAddress using operations provided by geo JSON
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000, // Checks within 5km
          },
        }, // nearByDeliveryBoys [1,2,3,4,5]
      });

      // Filtering BOYS WHO AREE "BUSY"

      // Store all Delivery boys IDS of nearByDeliveryBoys(within 5km ) in varaible neaarByIds. nearByIds [1,2,3,4,5]
      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      // STORE THOSE WHO ARE BUSY !
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds }, // from all nearByIds check and store those Ids who is already assignedTo meaning BUSY !
        status: { $nin: ["brodcasted", "completed"] }, // Among busyIds  filter those who doesnt come in comeplted ( free) or brodcasted ( free waiting to accept). checking who aare Busy !
      }).distinct("assignedTo"); // After mapping each boy IDS we found that one boy i.e; boy 5 doesnt statify the condtion so in busyIds [1,2,3,4] boy ID 5 doesnt have assignedTo and nor fall in status

      // FILTER FREE BOYS OUT OF BusyIds we use sets effiecient when too many delivery boys
      const busyIdSet = new Set(busyIds.map((id) => String(id))); // Converting ObjectIds in DB to String
      // ['1', '2', '3', '4']. e take all busy riders ID
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );
      // go to nearByDeliveryBoys and convert thier object into string and get those which are not in busyIds i.e. availableBoys = boy 5 full object

      // Extract only ID from whole object of boy 5; canditate = [5] to store in delivery model DB
      const candidates = availableBoys.map((b) => b._id);
      //  Check candidate have rider if no save order and return msg
      if (candidates.length == 0) {
        await order.save();
        return res.json({
          message: "Order Updated but no Available Delivery Boys !",
        });
      }
      // since we have candidate; crate new delivery Assigment in DB based on delivery model
      const deliveryAssignment = await DeliveryAssignment.create({
        // Create New DeliveryModel. The data we get like shop name, ordr and all is from Order Model Object
        order: order._id, //
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      // In order model under shpOrder currently no boy accepted so in assignedDeliveryBoy feild will be defualt null. Noboday accepted yet!
      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      //FULL ID of delivery assignment

      // all free riders clean data is stored in arrayto show in frotnend temp
      shopOrder.assignment = deliveryAssignment._id;
      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      // REAL TIME UPDATE TO DELIVERY BOYS WHEN STATUS 'Out For Delivery'
      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;
          if (boySocketId) {
            io.to(boySocketId).emit("newAssignment", {
              sentTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items:
                deliveryAssignment.order.shopOrders.find((so) =>
                  so._id.equals(deliveryAssignment.shopOrderId),
                ).shopOrderItems || [],
              subtotal: deliveryAssignment.order.shopOrders.find((so) =>
                so._id.equals(deliveryAssignment.shopOrderId),
              )?.subtotal,
            });
          }
        });
      }
    }

    await order.save();

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile",
    );
    await order.populate("user", "socketId");

    // REAAL TIME SOCKET CONNECTION FOR STATUS CHANGE
    const updatedShopOrder = order.shopOrders.find(
      (o) => String(o.shop?._id || o.shop) === shopId,
    );

    const io = req.app.get("io");
    if (io) {
      // Here we take userId as he is getting Updates
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment?._id,
    });
  } catch (error) {
    return res.status(500).json({ message: `Order Status Error ${error}` });
  }
};

// GET assignments of Orders

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    // FIND CURRENT DELIVERY ID
    const deliveryBoyId = req.userId;
    // Ids which we brodcasted if we have that delivery ID we get thaat person; getting assignments
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    const formatted = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subtotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subtotal,
    }));

    return res.status(200).json({ formatted });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get Assignment Error !!! ${error}` });
  }
};

// ACCEPT ORDER  (Delivery boy Accept)

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "Assignment Not Found !!!" });
    }
    // If someone accepting the order which is already accepted by previous delivery guy
    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "Assignment Expired !!!" });
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You are Already Assigned to another Order " });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();

    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "Order Not Found" });
    }

    let shopOrder = order.shopOrders.id(assignment.shopOrderId);
    shopOrder.assignedDeliveryBoy = req.userId;

    await order.save();

    return res.status(200).json({
      message: "Order Accepted",
    });
  } catch (error) {
    return res.status(400).json({ message: `Accept Order Error ${error}` });
  }
};

// GET CURRENT ORDERS INFO  (Show orders on delivery Page)

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });

    if (!assignment) {
      return res.status(400).json({ message: "Assignment Not Found" });
    }

    if (!assignment.order) {
      return res.status(400).json({ message: "Order Not Found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so.id) == String(assignment.shopOrderId),
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "ShopOrder Not Found" });
    }

    let deliveryBoyLocation = { lat: null, long: null };
    if (assignment.assignedTo.location.coordinates.length === 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.long = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, long: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.long = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get Current Order Error ${error} ` });
  }
};

// GET ORDERS INFO (User Track Order page)

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ message: "Order not Found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get orders BY iD  Error ${error}` });
  }
};

// Send Delivery OTP  To User

export const sentDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter Valid Order/shopOrderId" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();
    await sendDeliveryOtpMail({
      user: order.user,
      otp: otp,
    });
    return res
      .status(200)
      .json({ message: `OTP Successfully sent to ${order?.user?.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: `OTP Delivery Error ${error}` });
  }
};

// VERIFY OTP BY DELIVERY

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter Valid Order/shopOrderId" });
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: " Invalid/ Expired OTP" });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();

    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res.status(200).json({ message: `Order Delivered Successfully` });
  } catch (error) {
    return res.status(500).json({ message: `Verify OTP Error ${error}` });
  }
};

// DELIVERY BOY EARNINGS ( HOURLY BASIS )
export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const startsOfDay = new Date();
    startsOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay },
    }).lean();

    let todaysDeliveries = [];
    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          shopOrder.assignedDeliveryBoy == deliveryBoyId &&
          shopOrder.status == "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startsOfDay
        ) {
          todaysDeliveries.push(shopOrder);
        }
      });
    });

    let stats = {};
    todaysDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));

    formattedStats.sort((a, b) => a.hour - b.hour);
    return res.status(200).json(formattedStats);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Today Deliveries Errror ${error}` });
  }
};
