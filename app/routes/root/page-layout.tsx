import { RootNavbar } from "components";
import React from "react";
import { Link, Outlet, redirect, useNavigate } from "react-router";
import { getExistingUser, logoutUser, storeUserData } from "~/appwrite/ auth";
import { account } from "~/appwrite/client";

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) return redirect("/sign-in");

    const existingUser = await getExistingUser(user.$id);
    return existingUser?.$id ? existingUser : await storeUserData();
  } catch (error) {
    console.log("Error fetching user", error);
    return redirect("/sign-in");
  }
}

const PageLayout = () => {
  return (
    <div className="bg-light-200">
      <RootNavbar />
      <Outlet />
    </div>
  );
};

export default PageLayout;
