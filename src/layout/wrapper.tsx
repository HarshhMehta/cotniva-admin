"use client";
import React from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { ToastContainer } from "react-toastify";
import { redirect } from "next/navigation";
import useAuthCheck from "@/hooks/use-auth-check";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const [sideMenu, setSideMenu] = React.useState<boolean>(false);
  const { authChecked, authenticated } = useAuthCheck();

  if (authChecked && !authenticated) {
    redirect("/login");
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="tp-main-wrapper bg-slate-100 min-h-screen overflow-x-hidden">
      <Sidebar sideMenu={sideMenu} setSideMenu={setSideMenu} />
      <div className="tp-main-content w-full min-w-0 lg:ml-[250px] lg:w-[calc(100%-250px)] xl:ml-[300px] xl:w-[calc(100%-300px)]">
        <Header setSideMenu={setSideMenu} />
        {children}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Wrapper;
