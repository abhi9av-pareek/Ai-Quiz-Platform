import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function LoginModern() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle login (ONLY ONE FUNCTION)
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/login",
        formData,
      );

      // store token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      // redirect
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] p-6 font-sans">
      <div className="flex w-full max-w-[1100px] h-[650px] bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 bg-[#e6f7ef] flex-col items-center justify-center p-12 text-center border-r border-gray-100">
          <h2 className="text-2xl font-bold text-[#1a2e35] mb-2">
            Exam Mastery Hub
          </h2>
        </div>

        {/* RIGHT SIDE */}

        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Welcome Back!
          </h2>

          <p className="text-gray-500 mb-8">Login and Compete with Minds.</p>

          <div className="space-y-4">
            {/* EMAIL */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 w-full"
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 w-full"
            />
          </div>

          <button
            onClick={handleLogin}
            className="bg-[#1a2e35] text-white py-3.5 rounded-xl font-semibold mt-6"
          >
            Log In
          </button>

          <p className="text-center text-sm mt-8 text-gray-500">
            Are you new?
            <Link to="/signup" className="text-[#1dbf73] font-bold ml-1">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModern;
