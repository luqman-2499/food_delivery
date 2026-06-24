import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// CREATE and EDIT EXISTING SHOP CONTROLLER

export const createAndEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body; // DATA COMING FROM FRONTEND THROUGH REQ.BODY
    let image;
    if (req.file) {
      // IMAGE COMES FROM FROTNEND THROGH REQ.FILE
      console.log(req.file);

      image = await uploadOnCloudinary(req.file.path);
    } // GIVE FILE PATH GOES TO CLOUDINARY TO STORE IMAGE AND RETURNS STRING STORED IN IMAGE VARIABLE

    // FIND SHOP IF NOT FOUND CREATE NEW SHOP
    let shop = await Shop.findOne({ owner: req.userId }); // Check current logged in uowner id matches with any existing shop owner id. This confirms shop already created or not based on that we move to Create OR Edit
    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      // IF SHOP AVAILABLE EDIT SHOP BLOCK
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image,
          owner: req.userId,
        },
        { returnDocument: true },
      ); // Once shop edited then update the DB
    }
    await shop.populate(["owner", "items"]);
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Shop Creation Error ${error}` });
  }
};

// FETCH CURRENT OWNER'S SHOP DATA

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Get Current Shop Error ${error}` });
  }
};

// GET SHOPS OF CURRENT USER CITY ( DISPLAY ON USER DASHBAORD SHOPS IN CURRENT CITY)

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params; // params means take city from URL
    // Match the uesr city with current city
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    // IF NO EXACT CITY MATCH FOUND, SHOW DUBAI SHOPS
    if (shops.length === 0) {
      shops = await Shop.find({
        city: { $regex: /^Dubai$/i },
      }).populate("items");
    }

    if (!shops) {
      return res.status(400).json({ message: "Shops Not Found" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `Get Shop By City Error ${error}` });
  }
};
