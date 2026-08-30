import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginModern from "./components/LoginModern";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import QuizSetup from "./components/QuizSetup";
import Quiz from "./components/Quiz";
import ResultsHistory from "./components/ResultsHistory";
import Results from "./components/Results";
import Analytics from "./components/Analytics";
import Profile from "./components/Profile";
import GyantraLanding from "./components/GyantraLanding";
import GyantraBlog from "./components/GyantraBlog";
import Bookmarks from "./components/Bookmarks";
import GyanS from "./components/GyanS";
import GyanBot from "./components/GyanBot";
import Performance from "./components/Performance";

// Routes where GyanBot should NOT appear (pre-login pages)
const PRE_LOGIN_ROUTES = ["/", "/landing", "/blog", "/login", "/signup"];

function GyanBotGlobal() {
  const { pathname } = useLocation();
  const isPostLogin = !PRE_LOGIN_ROUTES.includes(pathname);
  if (!isPostLogin) return null;
  return <GyanBot />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* GyanBot floats on all post-login pages automatically */}
        <GyanBotGlobal />
        <Routes>
          {/* Landing page is the entry point */}
          <Route path="/"          element={<GyantraLanding />} />
          <Route path="/landing"   element={<GyantraLanding />} />
          <Route path="/blog"      element={<GyantraBlog />} />
          <Route path="/login"     element={<LoginModern />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/QuizSetup" element={<QuizSetup />} />
          <Route path="/quiz"      element={<Quiz />} />
          <Route path="/results"   element={<Results />} />
          <Route path="/results/history" element={<ResultsHistory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/gyans"      element={<GyanS />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
