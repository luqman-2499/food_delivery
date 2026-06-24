import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

// Auto check logged-in user on APP start

function useGetCurrentUser() {
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      // fetchUser() is Fucntion to call the API
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true, // SEND COOKIE TO BACKEND
        });
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  return loading;
}

export default useGetCurrentUser;
