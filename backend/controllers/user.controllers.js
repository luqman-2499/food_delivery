import User from "../models/user.model.js";

// GET CURRENT LOGGED-IN USER INFO

// Once Token verified in isAuth() Here we check in DB to match wehther userId verified is matching with that user or not

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; //Store the incoming userId in var userId
    if (!userId) {
      return res.status(401).json({ message: "UnAuthorized" });
    }
    const user = await User.findById(userId); // find the signed in user UserId, Find any existing user has same ID
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get Current User Error ! ${error}` });
  }
};

// Take Users current location coordinates and store in DB
export const updateUserLocation = async (req, res) => {
  try {
    const { lat, long } = req.body; // Take lat and long from frontend
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [long, lat],
        },
      },
      { returnDocument: "after" },
    );
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    return res.status(200).json({ message: "Location Updated" });
  } catch (error) {
    return res.status(500).json({ message: `Location Update ${error}` });
  }
};
