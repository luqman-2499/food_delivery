import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// ITEM CREATION CONTROLLER

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    // FIND SHOP EXIST OR NOT
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop Not Found" });
    }

    // ITEM CREATION
    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    }); // Item Created and in last in shop field we specify that shop id which user created. As before creaating id user creates shop so from ther we get shop id.

    shop.items.push(item._id); // Since item field in shop model is empty now Push items in shop model. go to shop model in items field push this item id
    await shop.save();
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Add Item Error ${error}` });
  }
};

// EDIT PARTICULAR ITEM

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        foodType,
        price,
        ...(image && { image }),
      },
      { returnDocument: "after" },
    );

    if (!item) {
      return res.status(400).json({ message: "Item not Found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Edit Item Error ${error}` });
  }
};

// GET ITEM DETAILS WHEN CLICKED FOR EDIT ITEM

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "Item Nout Found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `Get Item Error ${error}` });
  }
};

// DELETE ITEM

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "Item not Found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter((i) => i.toString() !== item._id.toString());
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Delete Item Error ${error}` });
  }
};

// GET ITEMS BY CITY

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ message: "City is Required" });
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    if (shops.length === 0) {
  return res.status(404).json({ message: "Shops Not Found" });
}
    const shopIds = shops.map((shop) => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } });

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: `Get Item By City Error ${error}` });
  }
};

// GET ITEMS BY SHOP

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    // go to shop model match shop id with sent from frotnend and populate its items feild with actaul data
    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) {
      return res.status(400).json({ message: "Shop Not Found !!" });
    }
    return res.status(200).json({
      shop,
      items: shop.items,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get Items By Shop Error!! ${error}` });
  }
};

// SEARCH ITEMS IN SEARCH BOX

export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query || !city) {
  return res
    .status(400)
    .json({ message: "Query and city are required" });
}

    // Match the user city with current city
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    if (shops.length === 0) {
  return res.status(404).json({ message: "Shops Not Found" });
}
    const shopIds = shops.map((s) => s._id);
    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name image");
    return res.status(200).json(items);
  } catch (error) {
    return res.status(400).json({ message: `Search Item Error ${error}` });
  }
};

// RATING FOOD
export const rating = async (req, res) => {
  try {
    // ItemId and raating number from Frontend User
    const { itemId, rating } = req.body;

    if (!itemId || !rating) {
      return res.status(400).json({ message: "abc" });
    }
    // Specifying Range cuz API manual testing user may give -1 or 10
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating kust be between 1 and 5" });
    }

    const item = await Item.findById(itemId);
    // IF ITEM ID NOT FOUND
    if (!item) {
      return res.status(400).json({ message: "Item not Found!" });
    }
    // Adds + 1 in rating field; suppose DB rating has 3 then 3 + 1
    // this 1 might be new user or new rating from same user; regardless of how many stars selected
    const newCount = item.rating.count + 1; // newCount => 3 + 1 = 4

    // In DB avg: 4, COUNT: 3 Then (4 * 3 + 1 ) / 4 => newAvg = 3.5
    const newAverage =
      (item.rating.average * item.rating.count + rating) / newCount;

    item.rating.count = newCount;
    item.rating.average = newAverage;
    await item.save();
    // sending only selected Data from Model
    return res.status(200).json({ rating: item.rating });
  } catch (error) {
    return res.status(400).json(`Rating error ${error}`);
  }
};
