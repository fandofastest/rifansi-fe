"use client";
import React from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function UserMetaCard() {
  // Display username and role from the authentication context
  const { user } = useAuth();
  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image
              width={80}
              height={80}
              src="/images/user/owner.jpg"
              alt="user"
            />
          </div>
          <div>
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user?.username || "Pengguna"}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.role?.roleName || "Tidak Ada Peran"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
