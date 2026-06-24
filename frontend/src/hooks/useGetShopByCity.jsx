import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity, setUserData } from "../redux/userSlice";

// Auto check logged-in user on APP start

function useGetShopByCity() {
  const [loading, setLoading] = useState(true);
  const { currentCity } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  useEffect(() => {
    if (!currentCity) return;
    const fetchShops = async () => {
      // fetchUser() is Fucntion to call the API
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentCity}`,
          {
            withCredentials: true, // SEND COOKIE TO BACKEND
          },
        );
        dispatch(setShopsInMyCity(result.data));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [currentCity]);
  return loading;
}

export default useGetShopByCity;
