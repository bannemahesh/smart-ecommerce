import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

function AdminDashboard() {
  const { token, isAuthenticated } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load dashboard"
        );
      }

      setStats(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please login as admin.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-9 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-8 h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-xl font-bold text-red-800">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                fetchDashboard();
              }}
              className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            ADMIN PANEL
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Overview of your store's users, products, orders, and sales.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Users */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Users
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {stats.total_users}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg">
                👥
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Products
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {stats.total_products}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-lg">
                📦
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Orders
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {stats.total_orders}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-lg">
                🛒
              </div>
            </div>
          </div>

          {/* Sales */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Sales
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  ₹{Number(stats.total_sales).toFixed(2)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                ₹
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest orders placed in your store.
            </p>
          </div>

          {stats.recent_orders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📦
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No orders yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Recent customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      Order #{order.id}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      ₹{Number(order.total).toFixed(2)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      order.order_status === "delivered"
                        ? "bg-emerald-50 text-emerald-700"
                        : order.order_status === "shipped"
                        ? "bg-blue-50 text-blue-700"
                        : order.order_status === "processing"
                        ? "bg-amber-50 text-amber-700"
                        : order.order_status === "cancelled"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {order.order_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;