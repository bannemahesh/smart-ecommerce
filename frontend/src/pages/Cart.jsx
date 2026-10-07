import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../services/api";

function Cart() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load cart");
      }

      setCart(data.cart || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/cart/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update quantity");
      }

      fetchCart();
    } catch (error) {
      setError(error.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cart/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to remove product");
      }

      fetchCart();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCheckout = async () => {
    try {
      setError("");

      // Step 1: Create the order
      const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.detail || "Failed to create order"
        );
      }

      // Step 2: Create Stripe Checkout session
      const paymentResponse = await fetch(
        `${API_BASE_URL}/payments/${orderData.order_id}/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData.detail || "Failed to create Stripe checkout"
        );
      }

      // Step 3: Redirect customer to Stripe Checkout
      window.location.href = paymentData.checkout_url;
    } catch (error) {
      setError(error.message);
    }
  };

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-lg text-center">

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
            🛒
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Your Cart
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please sign in to view and manage your shopping cart.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-7 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
          </button>

        </div>
      </main>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-9 w-48 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="h-64 animate-pulse rounded-2xl bg-white" />

          </div>

        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && cart.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-lg text-center">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <h1 className="font-semibold text-red-900">
              Unable to load your cart
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={fetchCart}
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
  // EMPTY CART
  // =========================

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-lg text-center">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
            🛒
          </div>

          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            SHOPPING CART
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Looks like you haven't added anything to your cart yet.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-7 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Continue Shopping
          </button>

        </div>
      </main>
    );
  }

  // =========================
  // CART
  // =========================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">

          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            SHOPPING CART
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Your Cart
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review your items before checkout.
              </p>
            </div>

            <span className="hidden text-sm text-slate-500 sm:block">
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </span>

          </div>

        </div>
      </section>


      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">


          {/* ================= CART ITEMS ================= */}

          <div className="space-y-4">

            {cart.map((item) => (

              <article
                key={item.cart_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  {/* Product */}
                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.category}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {item.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      ₹{Number(item.price).toFixed(2)} each
                    </p>

                  </div>


                  {/* Right side */}
                  <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">

                    {/* Quantity */}
                    <div className="flex items-center rounded-lg border border-slate-300">

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        −
                      </button>

                      <span className="flex h-9 min-w-10 items-center justify-center border-x border-slate-300 px-2 text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product_id,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className="flex h-9 w-9 items-center justify-center text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        +
                      </button>

                    </div>


                    {/* Price + Remove */}
                    <div className="text-right">

                      <p className="text-lg font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() =>
                          removeFromCart(item.product_id)
                        }
                        className="mt-1 text-xs font-medium text-red-600 transition hover:text-red-700 hover:underline"
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                </div>

              </article>

            ))}

          </div>


          {/* ================= SUMMARY ================= */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

            <h2 className="text-lg font-semibold text-slate-900">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium text-slate-900">
                  ₹{total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Shipping
                </span>

                <span className="font-medium text-slate-900">
                  Free
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">

                <div className="flex items-center justify-between">

                  <span className="font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    ₹{total.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>


            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}


            <button
              onClick={handleCheckout}
              className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/products")}
              className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue Shopping
            </button>


            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              Secure checkout powered by Stripe.
            </p>

          </aside>

        </div>

      </section>

    </main>
  );
}

export default Cart;