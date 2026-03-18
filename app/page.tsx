"use client";
import { useAppContext } from "@/lib/components/AppContext";
import Calendar from "@/lib/components/Calendar";
import SideBar from "@/lib/components/SideBar";
import { Spinner } from "@heroui/react";

export default function Home() {
  const { isLoading } = useAppContext();

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen z-10">
          <Spinner color="secondary"></Spinner>
        </div>
      ) : (
        <div className="">
          <SideBar />
          <Calendar />
        </div>
      )}
    </>
  );
}
