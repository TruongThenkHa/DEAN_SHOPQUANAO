import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/Home";
import Blog from "./pages/Blog";
import NotFound from "./pages/notfound.jsx";
import AdminHome from "./pages/Admin/homee.jsx";
import AdminRoute from "./components/guards/AdminRoute";
import AdminCustomerList from "./pages/Admin/CustomerList.jsx";
import AdminCategoryList from "./pages/Admin/CategoryList.jsx";
import AdminProductList from "./pages/Admin/ProductList.jsx";
import AdminOrderList from "./pages/Admin/OrderList.jsx";
import AdminAnalyticList from "./pages/Admin/AnalyticList.jsx";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <div className="pt- min-h-screen">
        <Routes>
          {/* Trang user */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/blog" element={<Blog />} />

          {/* 🌟 Trang admin */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminHome /> {/* Layout admin */}
              </AdminRoute>
            }
          >
            {/* Các trang con trong layout admin */}
            <Route path="customers" element={<AdminCustomerList />} />
            <Route path="categories" element={<AdminCategoryList />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="analytics" element={<AdminAnalyticList />} />
            {/* Tức là /admin/customers */}
          </Route>

          {/* Trang 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
      <Toaster richColors position="top-right" />
    </>
  );
}

export default function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
