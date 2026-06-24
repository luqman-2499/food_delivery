// FOR EVERY USER A SOCKET ID IS CREATED
// This whole file manages user connection status:
// Save socket ID on connect, mark online, and mark offline on disconnect

import User from "./models/user.model.js";
// (io) comes from index file after listening to port it sends socket server object which is in io
export const socketHandler = async (io) => {
  // in io we have built-in events. Using connection we connect user
  io.on("connection", (socket) => {
    // Once user gets connected then
    socket.on("identity", async ({ userId }) => {
      try {
        // Find the user by userid in User model and
        const user = await User.findByIdAndUpdate(
          userId,
          // Update the socketId with auto genrated ID and set isOnline true
          {
            socketId: socket.id,
            isOnline: true,
          },
          { returnDocument: true },
        );
      } catch (error) {
        console.log(error);
      }
    });

    //
    socket.on("updateLocation", async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
          socketId: socket.id,
        });

        if (user) {
          io.emit("updateDeliveryLocation", {
            deliveryBoyId: userId,
            latitude,
            longitude,
          });
        }
      } catch (error) {
        console.log("updateDeliveryLocation Error");
      }
    });
    // When disconnect then find user by socketId and then change values
    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          {
            socketId: null,
            isOnline: false,
          },
        );
      } catch (error) {
        console.log(error);
      }
    });
  });
};
