import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminLogin from "./pages/AdminLogin";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import PaymentSuccess from "./pages/PaymentSuccess";
import Auth0Sync from "./components/Auth0Sync";

function App() {
  return (
    <BrowserRouter>
      <Auth0Sync />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />
        <Route
          path="/payment-success"
          element={<PaymentSuccess />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;