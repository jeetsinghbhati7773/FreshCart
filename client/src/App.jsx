import react from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetail from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AddAddressModal from "./components/AddAddressModal";
import FAQ from "./pages/FAQ";
import Seller from "./pages/Seller";
import SellerLogin from "./pages/SellerLogin";
import ProtectedSellerRoute from "./pages/ProtectedSellerRoute";
import MyOrders from "./pages/MyOrders";
import UserChat from "./components/UserChat";
import PaymentMethods from "./pages/PaymentMethods";
import NotFound from "./pages/NotFound";
const App = () => {
  const { showUserLogin, showAddressModal, user, isSeller } = useAppContext();
  const isSellerPath = useLocation().pathname.includes("seller");
  return (
    <div>
      {isSellerPath ? null : <Navbar />}
      <div
        className={`${
          isSellerPath
            ? ""
            : "px-4 sm:px-8 md:px-12 lg:px-20 xl:px-28 2xl:px-32"
        }`}
      >
        {showUserLogin ? <Login /> : null}
        {showAddressModal && <AddAddressModal />}

        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:categoryName" element={<ProductCategory />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/seller-login" element={<SellerLogin />} />
          <Route
            path="/seller"
            element={
              <ProtectedSellerRoute>
                <Seller />
              </ProtectedSellerRoute>
            }
          />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {user && <UserChat />}
        <Toaster
          position="top-center"
          toastOptions={{ duration: 1000 }}
          reverseOrder={false}
        />
      </div>
      {isSellerPath
        ? null
        : <Footer /> || <Toaster position="top-center" reverseOrder={false} />}
    </div>
  );
};
export default App;
