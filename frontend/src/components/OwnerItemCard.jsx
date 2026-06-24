import React from "react";
import axios from "axios";
import { FaPenToSquare } from "react-icons/fa6";
import { FaRegTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

// OWNER DASHBAORD EDIT AND DELETE ITEMS CARD COMPONENT
function OwnerItemCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // DELETE ITEM BUTTON

  const handleDeleteItem = async () => {
    try {
      const result = await axios.delete(
        `${serverUrl}/api/item/delete/${data._id}`,
        { withCredentials: true },
      );
      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl ">
      {/* LEFT SIDE IMAGE  */}
      <div className="w-36 shrink-0 bg-gray-50">
        <img src={data.image} alt="" className="w-full h-full object-cover" />
      </div>

      {/* LEFT SIDE CONTENT  */}
      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h2 className="text-base font-semibold text-[#ff4d2d]">
            {data.name}
          </h2>
          <p className="text-base font-semibold text-gray-700">
            Category: {data.category}
          </p>
          <p className="text-base font-semibold text-gray-700">
            Food Type: {data.foodType}
          </p>
        </div>
        {/* RIGHT SIDE CONTENT  */}
        <div className="flex items-center justify-between">
          <div className="text-[#ff4d2d] font-bold">{data.price}</div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer">
              <FaPenToSquare
                size={20}
                onClick={() => navigate(`/edit-item/${data._id}`)}
              />
            </div>

            <div
              className="p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer"
              onClick={handleDeleteItem}
            >
              <FaRegTrashCan size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerItemCard;
