import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem("user_name");
    const storedUserId = localStorage.getItem("user_id");

    if (!storedUserName || !storedUserId) {
      navigate("/");
      return;
    }

    setUserName(storedUserName);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#351C75' }}>
          Welcome, {userName}!
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          You have successfully logged in to your account.
        </p>
        <Button
          onClick={handleLogout}
          className="rounded-xl px-8 py-6 font-semibold text-base"
          style={{ backgroundColor: '#351C75' }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Home;
