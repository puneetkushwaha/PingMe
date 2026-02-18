import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, QrCode, Monitor } from "lucide-react";
import QRCode from "react-qr-code";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn, initiatePairing, pairingCode, isPairing } = useAuthStore();
  const [loginMode, setLoginMode] = useState("password"); // "password" or "qr"

  useEffect(() => {
    if (loginMode === "qr") {
      initiatePairing();
    }
  }, [loginMode, initiatePairing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
              transition-colors overflow-hidden"
              >
                <img src="/logo.jpg" className="w-full h-full object-cover" alt="Logo" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">
                {loginMode === "password" ? "Sign in to your account" : "Login with QR Code"}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-base-200 p-1 rounded-xl">
            <button
              onClick={() => setLoginMode("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${loginMode === 'password' ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/60 hover:text-base-content'}`}
            >
              <Lock className="w-4 h-4" /> Password
            </button>
            <button
              onClick={() => setLoginMode("qr")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${loginMode === 'qr' ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/60 hover:text-base-content'}`}
            >
              <QrCode className="w-4 h-4" /> QR Code
            </button>
          </div>

          {loginMode === "password" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email or Phone Number</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className={`input input-bordered w-full pl-10`}
                    placeholder="you@example.com or +91..."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-base-content/40" />
                    ) : (
                      <Eye className="h-5 w-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
              <div className="p-4 bg-white rounded-2xl shadow-xl ring-1 ring-black/5">
                {pairingCode ? (
                  <QRCode
                    value={pairingCode}
                    size={200}
                    level="H"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center bg-base-300 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">To use PingMe on your computer:</p>
                <ol className="text-xs text-base-content/60 text-left space-y-1 inline-block">
                  <li>1. Open PingMe on your phone</li>
                  <li>2. Tap <strong>Settings</strong> or <strong>Menu</strong></li>
                  <li>3. Select <strong>Linked Devices</strong> and scan this code</li>
                </ol>
              </div>
              <div className="flex items-center gap-2 text-xs text-warning animate-pulse">
                <Monitor className="w-4 h-4" />
                Waiting for authorization...
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
      />
    </div>
  );
};
export default LoginPage;
