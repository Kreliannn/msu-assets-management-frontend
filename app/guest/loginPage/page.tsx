"use client"
import React, { useState } from "react";
import Image from "next/image";
import { successAlert, errorAlert } from "@/app/utils/alert";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if(username == "office" && password == "123"){
        router.push("/pages/office/home")
    }else if(username == "cics" && password == "123"){
        router.push("/pages/cics/home")
    }else if(username == "evaluator" && password == "123"){
        router.push("/pages/evaluator/home")
    } else {
        errorAlert("login failed")
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#DAB368]/30 bg-white p-8 shadow-xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          

           <div className="relative mx-auto mb-4 h-20 w-20 rounded-full border-2 border-[#DAB368] bg-white p-2 shadow-md">
            <Image
                src="/assets/office_logo.png"
                alt="MSU Main Property Office Logo"
                fill
                className="object-contain"
                sizes="80px"
                priority
            />
            </div>

          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Welcome Back
          </h1>

          <p className="mt-2 text-[#595959]">
            Login to access your account.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#642209]">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[#DAB368] px-4 py-3 text-[#1A1A1A] outline-none transition focus:border-[#642209] focus:ring-2 focus:ring-[#DAB368]/40"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#642209]">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#DAB368] px-4 py-3 text-[#1A1A1A] outline-none transition focus:border-[#642209] focus:ring-2 focus:ring-[#DAB368]/40"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#642209] py-3 font-semibold text-white transition duration-200 hover:bg-[#4A1806] active:scale-[0.98]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}