import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  // navigator() fetches our current location and we can get to see lat and long from coords object data
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      // Uses Browser Gps Position through navigator.geolocation.....position holds the coords of location...
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({ lat: latitude, long: longitude })); // get the latitude and longitude values in lat and long keys and dispatch it to store in Redux mapSlice
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
      );
      dispatch(
        setCurrentCity(
          result?.data?.results[0].city || result?.data?.results[0].county,
        ),
      );
      dispatch(setCurrentState(result?.data?.results[0].state));
      dispatch(
        setCurrentAddress(
          result?.data?.results[0].address_line2 ||
            result?.data?.results[0].address_line1,
        ),
      );
      dispatch(setAddress(result?.data?.results[0].address_line2)); // Store the Address in REDUX in address key of mapSlice...Delivery Address at Checkout. Someties address could be same as current Address
    });
  }, []);
}

export default useGetCity;
