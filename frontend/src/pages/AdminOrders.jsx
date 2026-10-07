import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

function AdminOrders() {
  const { token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${orderId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update order"
        );
      }

      setMessage(
        `Order #${orderId} updated to ${status}.`
      );

      fetchOrders();
    } catch (error) {
      setError(error.message);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700";

      case "shipped":
        return "bg-blue-50 text-blue-700";

      case "processing":
        return "bg-amber-50 text-amber-700";

      case "confirmed":
        return "bg-indigo-50 text-indigo-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPaymentClasses = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "refunded":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Orders
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please login as admin.
            </p>
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
            Order Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View customer orders and manage their current status.
          </p>
        </div>

        {/* Messages */}
        <div className="mb-6 space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              📦
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Customer orders will appear here once they are placed.
            </p>
          </div>
        ) : (
          <>
            {/* Order count */}
            <div className="mb-5">
              <p className="text-sm text-slate-500">
                {orders.length} order
                {orders.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Order header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-500">
                        ORDER
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        #{order.id}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="mt-6 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {order.customer_name}
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      {order.customer_email}
                    </p>
                  </div>

                  {/* Order details */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">
                        Total
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        ₹{Number(order.total).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Payment
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentClasses(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Placed
                      </span>

                      <span className="text-right text-sm font-medium text-slate-700">
                        {new Date(
                          order.timestamp
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <label
                      htmlFor={`status-${order.id}`}
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Update Status
                    </label>

                    <select
                      id={`status-${order.id}`}
                      value={order.order_status}
                      onChange={(event) =>
                        updateStatus(
                          order.id,
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm font-medium capitalize text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    >
                      <option value="pending">
                        Pending
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="processing">
                        Processing
                      </option>

                      <option value="shipped">
                        Shipped
                      </option>

                      <option value="delivered">
                        Delivered
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default AdminOrders;