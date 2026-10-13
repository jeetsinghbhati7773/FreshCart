import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { sellerAxios } from "../utils/axiosInstance";
import { useAppContext } from "../context/AppContext";

const ProtectedSellerRoute = ({ children }) => {
  const { isSeller, setIsSeller } = useAppContext();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifySeller = async () => {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        setIsSeller(false);
        setChecking(false);
        return;
      }

      try {
        const res = await sellerAxios.get(
          "https://hitman-grocery-backend.onrender.com/api/seller/check-auth",
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Fix here
            },
          }
        );

        if (res.status === 200) {
          setIsSeller(true);
        } else {
          setIsSeller(false);
        }
      } catch (error) {
        setIsSeller(false);
      } finally {
        setChecking(false);
      }
    };

    verifySeller();
  }, [setIsSeller]);

  if (checking) return <div>Loading...</div>;

  return isSeller ? children : <Navigate to="/seller-login" replace />;
};

export default ProtectedSellerRoute;
