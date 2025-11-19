import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function NavBar({ user }) {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await axios.post(
        "http://localhost:5001/api/auth/sign-out",
        {},
        { withCredentials: true }
      );
      // Clear user data

      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  console.log(user, "this is user");
  return (
    <div className="w-full h-16 bg-[#0b121f] flex fixed justify-between items-center px-5 z-20">
      <div className="flex">
        <div>
          <img
            src={user?.avatar}
            alt=""
            className="size-9  object-cover border-b-gray-700"
          />
        </div>

        <p className="text-white ml-3 text-lg self-center font-mono">
          {user?.username}
        </p>
      </div>

      <div title="Logout">
        <svg
          data-slot="icon"
          fill="none"
          className="text-white cursor-pointer size-7"
          stroke-width="1.5"
          stroke="currentColor"
          onClick={() => handleSignOut()}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
          ></path>
        </svg>
      </div>
    </div>
  );
}

export default NavBar;
