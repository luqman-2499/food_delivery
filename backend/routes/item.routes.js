import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addItem,
  deleteItem,
  editItem,
  getItemByCity,
  getItemById,
  getItemsByShop,
  rating,
  searchItems,
} from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

// User Routes

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.delete("/delete/:itemId", isAuth, deleteItem);
itemRouter.get("/get-item-by-city/:city", getItemByCity);
itemRouter.get("/get-item-by-shop/:shopId", isAuth, getItemsByShop);
itemRouter.get("/search-items", isAuth, searchItems);
itemRouter.post("/rating", isAuth, rating);

export default itemRouter;
