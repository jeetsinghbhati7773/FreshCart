import { useState } from "react";
import axios from "../utils/axiosInstance";
import toast from "react-hot-toast";

const Subscribe = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://hitman-grocery-backend.onrender.com/api/subscribe",
        { email }
      );
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (err) {
      toast.error("Subscription failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 mb-16">
      <h1 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h1>
      <p className="md:text-lg text-gray-500/70 pb-8">
        Subscribe to get the latest offers, new arrivals, and exclusive
        discounts
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12"
      >
        <input
          className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email id"
          required
        />
        <button
          type="submit"
          className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default Subscribe;
