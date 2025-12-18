import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import loginIllustration from "@/assets/login.gif";
import logo from "@/assets/logo.png";
import { setUserSession } from "@/lib/cookies";
const LoginForm = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mobileNumber.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits",
        variant: "destructive",
      });
      phoneInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://amsstores1.leapmile.com/user/validate?user_phone=${mobileNumber}&password=${password}`
      );
      const data = await response.json();

      if (response.ok && data.user_id && data.user_name) {
        // Store user data in cookies (convert to strings)
        setUserSession(String(data.user_id), String(data.user_name));
        
        navigate("/home");
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        setTimeout(() => {
          phoneInputRef.current?.focus();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 animate-fade-in">
      {/* Logo on Top */}
      <div className="flex justify-center mb-8 animate-scale-in">
        <img 
          src={logo} 
          alt="Leapmile Robotics" 
          className="object-contain drop-shadow-2xl"
          style={{ width: '220px' }}
        />
      </div>

      {/* Login Container with Enhanced Design */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-[0_20px_60px_-15px_rgba(53,28,117,0.3)] transition-all duration-500">
        {/* Decorative Top Border with Animation */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
        </div>
        
        {/* Login Illustration and Title - Side by Side with Enhanced Design */}
        <div className="relative bg-gradient-to-b from-primary/5 to-transparent pt-8 pb-6">
          <div className="flex items-center justify-center gap-6">
            <div className="animate-scale-in">
              <img 
                src={loginIllustration} 
                alt="Login illustration" 
                className="w-20 h-20 object-contain hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
              Login
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="px-6 md:px-8 pb-6 space-y-5">
          {/* Mobile Number Field */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-semibold text-gray-700">
              Enter Mobile Number
            </Label>
            <Input
              ref={phoneInputRef}
              id="mobile"
              type="tel"
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setMobileNumber(value);
                }
              }}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 transition-all py-6 text-base"
              placeholder="Enter your mobile number"
              minLength={10}
              maxLength={10}
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 10) {
                    setPassword(value);
                  }
                }}
                className="w-full rounded-xl border-2 border-gray-200 focus:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 transition-all py-6 text-base pr-12"
                placeholder="Enter your password"
                maxLength={10}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
                ) : (
                  <Eye className="w-5 h-5 transition-transform duration-200 hover:scale-110" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl py-6 font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 mt-8"
            style={{ backgroundColor: '#351C75' }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
