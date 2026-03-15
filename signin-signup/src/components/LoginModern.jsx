import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function LoginModern() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] p-6 font-sans">
      <div className="flex w-full max-w-[1100px] h-[650px] bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* LEFT SIDE */}
        <div className="hidden md:flex w-1/2 bg-[#e6f7ef] flex-col items-center justify-center p-12 text-center border-r border-gray-100">
          <div className="mb-8">
            <img
              src="/path-to-your-illustration.png"
              alt="Student taking quiz"
              className="max-w-[85%] h-auto mix-blend-multiply"
            />
          </div>

          <h2 className="text-2xl font-bold text-[#1a2e35] mb-2">
            Exam Mastery Hub
          </h2>

          <p className="text-[#4b635a] text-sm max-w-[300px] leading-relaxed">
            Unleash Your Academic Success with BrainByte's Exam Excellence
            Platform
          </p>

          <div className="flex gap-2 mt-6">
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
            <span className="h-2 w-6 rounded-full bg-[#1dbf73]"></span>
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
            <span className="h-2 w-2 rounded-full bg-gray-300"></span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-[#1dbf73] p-1 rounded-md text-white font-bold text-xs">
              🎓
            </div>
            <h1 className="text-2xl font-bold text-[#1a2e35] tracking-tight">
              BrainByte
            </h1>
          </div>

          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Welcome Back!
          </h2>

          <p className="text-gray-500 mb-8">Login and Compete with Minds.</p>

          <button className="border border-gray-200 rounded-xl py-3 mb-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-600 font-medium">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5"
              alt="google"
            />
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-100 w-full"></div>
            <span className="absolute px-4 bg-white text-xs text-gray-400 uppercase tracking-widest">
              or with email
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Username or email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#1dbf73]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#1dbf73]"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="bg-[#1a2e35] hover:bg-[#121f24] text-white py-3.5 rounded-xl font-semibold mt-6"
          >
            Log In
          </button>

          {/* 🔹 Router Link added here */}
          <p className="text-center text-sm mt-8 text-gray-500">
            Are you new?
            <Link
              to="/signup"
              className="text-[#1dbf73] font-bold ml-1 hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModern;
