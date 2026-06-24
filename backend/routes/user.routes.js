import express from 'express'
import { getCurrentUser, updateUserLocation } from '../controllers/user.controllers.js'
import { isAuth } from '../middlewares/isAuth.js'


const userRouter = express.Router()

// Current User Route

userRouter.get("/current",isAuth,getCurrentUser)

// UPDATE USER LOCATION 
userRouter.post("/update-location",isAuth,updateUserLocation)


export default userRouter