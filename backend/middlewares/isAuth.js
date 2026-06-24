import jwt from "jsonwebtoken";

// Read the token from cookie received when user signed in and veerify its user ID with current req.userId
// Only Verify and store Chcek in DB and sending response from controller
// Then next() go to controller as spsecifiedd in route getCurrentUser()

// export const  isAuth = async (req,res,next) => {
//     try {
//         const token = req.cookies.token // token already present in cookie inside var token; so it req cookie to give from token
//         if(!token) {
//             return res.status(401).json({ message: "UnAuthorized" })
//         }

//         // VERIFY THE TOKEN AND STORE IN VARIAABLE DECODE TOKEN
//         const decodeToken = jwt.verify(token, process.env.JWT_SECRET)

//         req.userId=decodeToken.userId // Simply store the decode token with its userId in the Incoming userId
//         next() // Move to Controller user.controller() so DB verification of userId is done
//     } catch (error) {
//         return res.status(401).json({ message: "Invalid or expired token" })
//     }
// }

export const isAuth = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);

    const token = req.cookies.token;
    console.log("Token:", token);

    if (!token) {
      return res.status(401).json({ message: "UnAuthorized" });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decodeToken);

    req.userId = decodeToken.userId;
    next();
  } catch (error) {
    console.log("isAuth Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
