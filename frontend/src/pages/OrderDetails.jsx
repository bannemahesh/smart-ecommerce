import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

function OrderDetails() {
  const { orderId } = useParams();
  const { token, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load order details
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load order details"
          );
        }

        setOrder(data.order);
        setItems(data.items || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [isAuthenticated, token, orderId]);

  // Real-time order status updates
  useEffect(() => {
    if (!isAuthenticated || !order) {
      return;
    }

    const userId = order.user_id;

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/${userId}`
    );

    socket.onopen = () => {
      console.log("Order WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (
          data.type === "order_status_update" &&
          Number(data.order_id) === Number(orderId)
        ) {
          setOrder((previousOrder) => ({
            ...previousOrder,
            order_status: data.order_status,
          }));
        }
      } catch (error) {
        console.error(
          "Failed to process WebSocket message:",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error("Order WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Order WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [isAuthenticated, order, orderId]);

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
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "failed":
        return "bg-red-50 text-red-700 border-red-200";

      case "refunded":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStepStatus = (step) => {
    const statuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];

    const currentIndex = statuses.indexOf(
      order?.order_status?.toLowerCase()
    );

    const stepIndex = statuses.indexOf(step);

    if (order?.order_status?.toLowerCase() === "cancelled") {
      return "inactive";
    }

    if (stepIndex <= currentIndex) {
      return "completed";
    }

    return "upcoming";
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
            Order Details
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Please sign in to view your order.
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
      <main className="min-h-screen bg-slate-50 px-6 py-10">

        <div className="mx-auto max-w-5xl">

          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 h-48 animate-pulse rounded-2xl bg-white" />

          <div className="mt-6 h-72 animate-pulse rounded-2xl bg-white" />

        </div>

      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">

        <div className="mx-auto max-w-lg text-center">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h1 className="font-semibold text-red-900">
              Unable to load order
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <Link
              to="/orders"
              className="mt-5 inline-block text-sm font-semibold text-slate-900 hover:underline"
            >
              ← Back to Orders
            </Link>

          </div>

        </div>

      </main>
    );
  }

  // =========================
  // NOT FOUND
  // =========================

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">

        <div className="mx-auto max-w-lg text-center">

          <h1 className="text-3xl font-bold text-slate-900">
            Order not found
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            We couldn't find the requested order.
          </p>

          <Link
            to="/orders"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Back to Orders
          </Link>

        </div>

      </main>
    );
  }

  // =========================
  // ORDER DETAILS
  // =========================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">

          <Link
            to="/orders"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← Back to Orders
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                ORDER
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                #{order.id}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Placed on{" "}
                {new Date(order.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                  order.order_status
                )}`}
              >
                {order.order_status}
              </span>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getPaymentStyle(
                  order.payment_status
                )}`}
              >
                Payment: {order.payment_status}
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8">

        {/* Order tracking */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Order Tracking
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your order status updates in real time.
              </p>
            </div>

            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 sm:flex">
              ✓
            </div>

          </div>


          {/* Tracking steps */}
          <div className="mt-8 overflow-x-auto">

            <div className="flex min-w-[650px]">

              {[
                ["pending", "Order Placed"],
                ["confirmed", "Confirmed"],
                ["processing", "Processing"],
                ["shipped", "Shipped"],
                ["delivered", "Delivered"],
              ].map(([status, label], index) => {

                const stepStatus = getStepStatus(status);

                return (
                  <div
                    key={status}
                    className="relative flex flex-1 flex-col items-center"
                  >

                    {/* Connecting line */}
                    {index > 0 && (
                      <div
                        className={`absolute right-1/2 top-4 h-0.5 w-full ${
                          stepStatus === "completed"
                            ? "bg-slate-900"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    {/* Circle */}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        stepStatus === "completed"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {stepStatus === "completed" ? "✓" : index + 1}
                    </div>

                    <p
                      className={`mt-3 text-xs font-semibold ${
                        stepStatus === "completed"
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {label}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

          {order.order_status?.toLowerCase() === "cancelled" && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              This order has been cancelled.
            </div>
          )}

        </div>


        {/* Order items */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">

            <h2 className="text-lg font-semibold text-slate-900">
              Order Items
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {items.length}{" "}
              {items.length === 1 ? "product" : "products"} in this order
            </p>

          </div>


          {items.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No items found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {items.map((item) => (

                <div
                  key={item.id}
                  className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
                >

                  <div className="min-w-0">

                    <h3 className="font-semibold text-slate-900">
                      {item.product_name}
                    </h3>

                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {item.category}
                    </p>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      Quantity:{" "}
                      <span className="font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                    </p>

                  </div>


                  <div className="shrink-0 sm:text-right">

                    <p className="text-sm text-slate-500">
                      ₹{Number(item.price).toFixed(2)} each
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      ₹{Number(item.subtotal).toFixed(2)}
                    </p>

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>


        {/* Summary */}
        <div className="mt-6 flex justify-end">

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:max-w-sm">

            <div className="flex items-center justify-between">

              <span className="font-semibold text-slate-900">
                Total
              </span>

              <span className="text-2xl font-bold text-slate-900">
                ₹{Number(order.total).toFixed(2)}
              </span>

            </div>

            <p className="mt-2 text-right text-xs text-slate-400">
              Payment status:{" "}
              <span className="capitalize">
                {order.payment_status}
              </span>
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default OrderDetails;