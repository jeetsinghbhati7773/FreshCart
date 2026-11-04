import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { API_URL } from "../config";

export const AppContext = createContext();

const getSessionId = () => {
  let sid = localStorage.getItem("shoppilot_session_id");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("shoppilot_session_id", sid);
  }
  return sid;
};

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(false);
  const [isSeller, setIsSeller] = useState(true);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [sessionId] = useState(getSessionId);

  // Check login using saved token
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setUser(false);

      try {
        const res = await axios.get(`${API_URL}/userAuth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(false);
      }
    };

    checkLogin();
  }, []);

  // Cart State with localStorage persistence
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    mrpTotal: 0,
    savings: 0,
    gst: 0,
    totalAmount: 0,
    itemCount: 0,
    warnings: [],
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    // Compute client-side fallback summary whenever cartItems change
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const gst = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + gst;
    const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    setCartSummary((prev) => ({
      ...prev,
      subtotal,
      gst,
      totalAmount,
      itemCount,
    }));
  }, [cartItems]);

  // Addresses
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const data = localStorage.getItem("savedAddresses");
    return data ? JSON.parse(data) : [];
  });

  useEffect(() => {
    localStorage.setItem("savedAddresses", JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  // Fetch Products & Categories from backend
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/categories`),
        ]);

        if (prodRes.status === "fulfilled") {
          setProducts(prodRes.value.data.products || []);
          setProductError(null);
        } else {
          setProductError("Failed to load products");
        }

        if (catRes.status === "fulfilled") {
          setCategories(catRes.value.data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch catalog:", error);
        setProductError("Failed to load catalog");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCatalog();
  }, []);

  // Fetch Authoritative Backend Cart on Mount & on Login
  const refreshBackendCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "x-session-id": sessionId };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.get(`${API_URL}/cart`, { headers });
      if (res.data?.success && res.data.cart) {
        const serverCart = res.data.cart;
        if (serverCart.items && serverCart.items.length > 0) {
          const mappedItems = serverCart.items.map((i) => ({
            _id: i.productId,
            name: i.name,
            price: i.offerPrice,
            mrp: i.price,
            image: i.image,
            quantity: i.quantity,
            unit: i.unit,
            brand: i.brand,
            category: i.category,
            inStock: i.inStock,
          }));
          setCartItems(mappedItems);
        }
        setCartSummary({
          subtotal: serverCart.subtotal,
          mrpTotal: serverCart.mrpTotal,
          savings: serverCart.savings,
          gst: serverCart.gst,
          totalAmount: serverCart.totalAmount,
          itemCount: serverCart.itemCount,
          warnings: serverCart.warnings || [],
        });
      }
    } catch (err) {
      // Fallback to local storage silently
    }
  }, [sessionId]);

  useEffect(() => {
    refreshBackendCart();
  }, [refreshBackendCart, user]);

  // Cart Helper functions
  const getCartQuantityById = (productId) => {
    const item = cartItems.find((i) => i._id === productId || i.id === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = async (productId, quantity = 1) => {
    const product = products.find((p) => p._id === productId || p.id === productId);
    if (!product) return;

    // 1. Optimistic Local Update
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === productId || item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item._id === productId || item.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            _id: product._id || product.id,
            id: product.id || product._id,
            name: product.name,
            price: product.offerPrice,
            mrp: product.price,
            image: product.image?.[0] || "",
            unit: product.unit || "",
            brand: product.brand || "",
            category: product.category || "",
            quantity,
            inStock: product.inStock,
          },
        ];
      }
    });

    // 2. Authoritative Backend Cart Sync
    try {
      const token = localStorage.getItem("token");
      const headers = { "x-session-id": sessionId };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.post(
        `${API_URL}/cart/items`,
        { productId, quantity },
        { headers }
      );
    } catch (err) {
      console.warn("Backend cart sync notice:", err.response?.data?.message || err.message);
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId && item.id !== productId));

    try {
      const token = localStorage.getItem("token");
      const headers = { "x-session-id": sessionId };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.delete(`${API_URL}/cart/items/${productId}`, { headers });
    } catch (err) {
      console.warn("Backend remove item notice:", err.message);
    }
  };

  const updateQuantity = async (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId || item.id === productId
          ? { ...item, quantity: qty }
          : item
      )
    );

    try {
      const token = localStorage.getItem("token");
      const headers = { "x-session-id": sessionId };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.put(
        `${API_URL}/cart/items/${productId}`,
        { quantity: qty },
        { headers }
      );
    } catch (err) {
      console.warn("Backend update quantity notice:", err.message);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    try {
      const token = localStorage.getItem("token");
      const headers = { "x-session-id": sessionId };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.delete(`${API_URL}/cart`, { headers });
    } catch (err) {
      // ignore
    }
  };

  const value = {
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    navigate,
    products,
    setProducts,
    categories,
    loadingProducts,
    productError,
    searchQuery,
    setSearchQuery,
    cartItems,
    setCartItems,
    cartSummary,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartQuantityById,
    refreshBackendCart,
    sessionId,
    selectedAddress,
    setSelectedAddress,
    savedAddresses,
    setSavedAddresses,
    showAddressModal,
    setShowAddressModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
