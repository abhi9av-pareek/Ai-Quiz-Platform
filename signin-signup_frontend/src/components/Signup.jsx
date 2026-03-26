import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    educationLevel: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/signup",
        formData,
      );

      console.log("Signup success:", res.data);

      alert("Signup successful");
    } catch (error) {
      console.log("Signup error:", error.response?.data);
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    // left side of login page
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl flex overflow-hidden max-w-4xl w-full">
        <div className="hidden md:flex w-1/2 bg-[#E9F7F2] flex-col items-center justify-center p-10">
          <div className="bg-white p-6 rounded-full mb-6 shadow-sm">
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

        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-400 text-sm">
              Join the BrainByte community today
            </p>
          </div>
          {/* right side of login page*/}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
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
                  placeholder="Enter your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Contact */}
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
                  type="text"
                  placeholder="eg. 8946925959"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="eg. user01@gmail.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
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
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                >
                  <option value="">Select</option>
                  <option value="Dropout">Dropout</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-3 rounded-xl"
            >
              Sign Up
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already a member?{" "}
            <Link to="/" className="text-emerald-600 font-bold">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
