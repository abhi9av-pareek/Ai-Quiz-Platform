import { Link } from "react-router-dom";
import React from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl flex overflow-hidden max-w-4xl w-full">
        {/* Left Side - Branding (Matching your Image) */}
        <div className="hidden md:flex w-1/2 bg-[#E9F7F2] flex-col items-center justify-center p-10">
          <div className="bg-white p-6 rounded-full mb-6 shadow-sm">
            {/* Replace with your actual BrainByte Logo/Illustration */}
            <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center">
              <GraduationCap size={60} className="text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 text-center">
            Exam Mastery Hub
          </h2>
          <p className="text-slate-500 text-center mt-2 text-sm leading-relaxed">
            Unleash Your Academic Success with <br />
            <span className="font-semibold text-emerald-600 font-mono text-lg">
              BrainByte
            </span>
          </p>
        </div>

        {/* Right Side - Simplified Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-400 text-sm">
              Join the BrainByte community today
            </p>
          </div>

          <form className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Eg. Virat Kohli"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Contact Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  placeholder="Eg. +91 7878689008"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Education
              </label>
              <div className="relative">
                <GraduationCap
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-gray-600">
                  <option>Select your level</option>
                  <option>Dropout</option>
                  <option>High School</option>
                  <option>Undergraduate</option>
                  <option>Postgraduate</option>
                  <option>Professional</option>
                </select>
              </div>
            </div>

            {/* Set Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Set Password
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 mt-2"
            >
              Sign Up
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase tracking-widest">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Google Signup */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg"
                width="18"
                alt="Google"
              />
              <span className="text-sm font-semibold text-gray-700">
                Google
              </span>
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already a member?{" "}
            <Link to="/" className="text-emerald-600 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Signup;
