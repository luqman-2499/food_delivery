import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useUpdateLocation() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    // SEND CURRENT LAT, LONG TO API ANF UPDATE THOSE ND STORE IN DB FOR FURTHER DELIVERY LIVE TRACKING PURPOSE

    // Earlier navigator's currentPosition() gets current lcoation using lat long values from geoapify
    const updateLocation = async (lat, long) => {
      const result = await axios.post(
        `${serverUrl}/api/user/update-location`,
        { lat, long },
        { withCredentials: true },
      );
    };

    // Using navigator whenever lat, long gets changed for that we use WatchPosition() IS USED. Starts listening to location changes continuously.
    const watchId = navigator.geolocation.watchPosition((pos) => {
      updateLocation(pos.coords.latitude, pos.coords.longitude);
      // return () => navigator.geolocation.clearWatch(watchId);
    });
    // It ensures that the active location watcher is properly stopped when the component/page is no longer in use.
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
}

export default useUpdateLocation;
