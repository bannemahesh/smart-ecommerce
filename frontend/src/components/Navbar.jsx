import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            S
          </div>

          <span className="text-lg font-bold tracking-tight text-slate-900">
            SmartCart
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">

          <Link
            to="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive("/")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive("/products")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Products
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/cart"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/cart")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Cart
              </Link>

              <Link
                to="/orders"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/orders")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Orders
              </Link>

              <button
                onClick={logout}
                className="ml-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className={`ml-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/login")
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Register
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;