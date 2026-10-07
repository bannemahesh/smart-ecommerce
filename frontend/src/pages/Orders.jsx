import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

function Orders() {
  const { token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "confirmed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getPaymentStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "failed":
        return "bg-red-50 text-red-700 border-red-200";

      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-lg text-center">

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
            📦
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Orders
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please sign in to view your orders.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
          </Link>

        </div>
      </main>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-9 w-48 animate-pulse rounded bg-slate-200" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-4 px-6 py-10 sm:px-8 lg:px-12">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </section>

      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-lg">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h1 className="font-semibold text-red-900">
              Unable to load orders
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={fetchOrders}
              className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>

          </div>

        </div>
      </main>
    );
  }

  // =========================
  // ORDERS
  // =========================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">

          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            ACCOUNT
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                My Orders
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View and track your recent purchases.
              </p>
            </div>

            <span className="hidden text-sm text-slate-500 sm:block">
              {orders.length}{" "}
              {orders.length === 1 ? "order" : "orders"}
            </span>

          </div>

        </div>

      </section>


      {/* Orders */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              📦
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              You haven't placed any orders yet. Start shopping to see your
              purchases here.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start Shopping
            </Link>

          </div>
        ) : (
          <div className="space-y-5">

            {orders.map((order) => (

              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >

                {/* Top */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      #{order.id}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                  </div>


                  {/* Total */}
                  <div className="sm:text-right">

                    <p className="text-xs text-slate-500">
                      Order total
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      ₹{Number(order.total).toFixed(2)}
                    </p>

                  </div>

                </div>


                {/* Status */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                      order.order_status
                    )}`}
                  >
                    {order.order_status === "confirmed"
                      ? "Order Confirmed"
                      : order.order_status}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStyle(
                      order.payment_status
                    )}`}
                  >
                    {order.payment_status === "paid"
                      ? "Payment Successful"
                      : `Payment: ${order.payment_status}`}
                  </span>
                </div>


                {/* Bottom */}
                <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-2 text-sm text-slate-500">

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs">
                      ✓
                    </span>

                    <span>
                      {order.order_status === "delivered"
                        ? "Your order has been delivered."
                        : "Your order is being processed."}
                    </span>

                  </div>


                  <Link
                    to={`/orders/${order.id}`}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View Order
                  </Link>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>

    </main>
  );
}

export default Orders;