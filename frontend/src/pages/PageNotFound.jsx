import React from "react";
import { useNavigate } from "react-router-dom";

function PageNotFound() {
  const navigate = useNavigate();
  return (
    <section className="bg-white min-h-screen flex items-center justify-center px-4">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div
              className="bg-[url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')] h-63 sm:h-88 md:h-100 bg-center bg-no-repeat bg-contain"
              aria-hidden="true"
            >
              <h1 className="text-black text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8 font-bold">
                404
              </h1>
            </div>

            <div className="-mt-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-black">
                Looks like you're lost
              </h3>

              <p className="mb-6 text-black">
                The page you are looking for is not available!
              </p>

              <button
                onClick={() => navigate("/")}
                className="my-5 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PageNotFound;
