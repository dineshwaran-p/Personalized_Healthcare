import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { identifyPendoVisitor, trackPendoEvent } from "../../utils/pendo";

// How the visitor reached the auth page: redirected by ProtectedRoute (sets state.from),
// via the header Login button (the /signup route sets state.isSignUp), or directly.
const getAuthEntryPoint = (locationState) => {
  if (locationState?.from) return "protected_route";
  if (locationState?.isSignUp) return "header_login";
  return "direct";
};

// eslint-disable-next-line react/prop-types -- this codebase does not declare PropTypes
const AuthPage = ({ setIsAuthenticated, setUser  }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authMode = isLogin ? "login" : "signup";
  
    if (!isLogin && formData.password !== formData.confirmPassword) {
      // Pendo: sign-up blocked by client-side validation
      trackPendoEvent("auth_failed", {
        authMode,
        failureStage: "client_validation",
        errorMessage: "Passwords do not match",
      });
      alert("Passwords do not match");
      return;
    }
  
    let httpStatus;
    try {
      const endpoint = isLogin ? "http://localhost:4000/login" : "http://localhost:4000/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      httpStatus = response.status;
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }
  
      console.log("User authenticated:", data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
  
      setIsAuthenticated(true);
      setUser(data.user);

      // Pendo: identify the authenticated visitor, then record the successful sign-in / sign-up.
      // Only the user id is sent, never name, email or password.
      identifyPendoVisitor(data.user?.id);
      const authEventProperties = {
        userId: data.user?.id,
        authMethod: "email_password",
        redirectFrom: location.state?.from,
        entryPoint: getAuthEntryPoint(location.state),
      };
      if (isLogin) {
        trackPendoEvent("user_logged_in", authEventProperties);
      } else {
        trackPendoEvent("user_signed_up", authEventProperties);
      }
      navigate("/"); // Redirect after login/signup
  
    } catch (error) {
      console.error("Auth error:", error.message);
      // Pendo: failed sign-in / sign-up (server rejection, or network / response parsing error).
      // httpStatus is only set once the server has responded.
      trackPendoEvent("auth_failed", {
        authMode,
        failureStage: httpStatus ? "server" : "network",
        httpStatus,
        errorMessage: error.message?.slice(0, 100),
      });
    }
  };
  
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex">
        {/* Left Panel - Animation */}
        <div className="w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 p-12 text-white hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6">
              {isLogin ? "Welcome Back!" : "Join Us Today"}
            </h2>
            <p className="mb-8">
              {isLogin
                ? "Stay connected with your health journey"
                : "Start your personalized health experience"}
            </p>
            <motion.div
              animate={{ rotate: isLogin ? 0 : 180 }}
              transition={{ duration: 0.8 }}
              className="w-32 h-32 mx-auto"
            >
              <div className="w-full h-full bg-white/20 rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* Right Panel - Form */}
        <motion.div
          className="w-full lg:w-1/2 p-12"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {isLogin ? "Sign In" : "Create Account"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>

         
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
