import jwt from "jsonwebtoken";

// Read the token from cookie received when user signed in and veerify its user ID with current req.userId
// Only Verify and store Chcek in DB and sending response from controller
// Then next() go to controller as spsecifiedd in route getCurrentUser()

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "UnAuthorized" });
    }
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodeToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
