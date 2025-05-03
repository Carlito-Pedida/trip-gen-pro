import React from "react";
import { Link, useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/ auth";

const PageLayout = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };
  return (
    <main className="">
      <div className="flex mt-10 justify-center ">
        <button
          onClick={handleLogout}
          className="cursor-pointer border border-amber-500 px-3 me-3 rounded-md"
        >
          <img src="/assets/icons/logout.svg" alt="logout" className="size-6" />
        </button>

        <Link
          to={"/dashboard"}
          className="cursor-pointer bg-primary-100 !text-white rounded-md px-7 py-2 "
        >
          Go To Dashboard
        </Link>
      </div>
    </main>
  );
};

export default PageLayout;
