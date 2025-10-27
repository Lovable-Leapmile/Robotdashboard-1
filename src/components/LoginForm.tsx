import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginIllustration from "@/assets/login.gif";
import logo from "@/assets/logo.png";

const LoginForm = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", { mobileNumber, password });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 animate-fade-in">
      {/* Logo on Top */}
      <div className="flex justify-center mb-8 animate-scale-in">
        <img 
          src={logo} 
          alt="Leapmile Robotics" 
          className="h-16 md:h-20 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Login Container with Enhanced Design */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-[0_20px_60px_-15px_rgba(53,28,117,0.3)] transition-all duration-500">
        {/* Decorative Top Border */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary"></div>
        
        {/* Login Illustration */}
        <div className="flex justify-center pt-6 pb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full"></div>
            <img 
              src={loginIllustration} 
              alt="Login illustration" 
              className="w-36 h-36 object-contain relative z-10 hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Login Title */}
        <div className="text-center pb-4">
          <h1 className="text-4xl font-bold" style={{ color: '#8E77C3' }}>
            Login
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="px-6 md:px-8 pb-6 space-y-5">
          {/* Mobile Number Field */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-semibold text-gray-700">
              Enter Mobile Number
            </Label>
            <Input
              id="mobile"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all py-6 text-base"
              placeholder="Enter your mobile number"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all py-6 text-base"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full rounded-xl py-6 font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 mt-8"
            style={{ backgroundColor: '#351C75' }}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
