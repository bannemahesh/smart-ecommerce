import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../services/api";

const productImages = {
  "Bluetooth Speaker Pro":
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",

  "Wireless Headphones":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",

  "Wireless Mouse":
    "https://images.unsplash.com/photo-1527814050087-3793815479db",

  shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",

  "Casual Cotton T-Shirt":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",

  "Stainless Steel Water Bottle":
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8",

  "Laptop Backpack":
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",

  "Smart Watch":
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

  "Face Moisturizer":
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883",

  "Fitness Resistance Bands":
    "https://images.unsplash.com/photo-1598289431512-b97b0917affc",

  "Novel — The Silent Patient":
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f",

  "LED Study Lamp":
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
};

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="bg-white">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-32">

          <div className="max-w-3xl">

            <p className="mb-5 text-xs font-semibold tracking-[0.25em] text-slate-400">
              SMART E-COMMERCE
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Everything you need,
              <br />
              <span className="text-slate-400">
                all in one place.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Discover quality products, add them to your cart,
              and manage your orders with ease.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/products"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Shop Now
              </Link>

              <Link
                to="/products"
                className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Explore Products
              </Link>

            </div>

          </div>
        </div>

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-slate-800/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-20 h-96 w-96 rounded-full bg-slate-800/30 blur-3xl" />
      </section>


      {/* ================= PRODUCTS ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">

        {/* Section heading */}
        <div className="mb-10 flex items-end justify-between gap-6">

          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-slate-500">
              SHOP
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Popular Products
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Discover some of our most popular products.
            </p>
          </div>

          <Link
            to="/products"
            className="hidden whitespace-nowrap text-sm font-semibold text-slate-900 hover:underline sm:block"
          >
            View all →
          </Link>

        </div>


        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        )}


        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            No products available yet.
          </div>
        )}


        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {products.slice(0, 8).map((product) => (

              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
              >

                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">

                  {productImages[product.name] ? (
                    <img
                      src={productImages[product.name]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No Image
                    </div>
                  )}

                  {/* Stock badge */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.stock > 0
                          ? "bg-white/90 text-slate-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock > 0
                        ? "In stock"
                        : "Out of stock"}
                    </span>
                  </div>

                </div>


                {/* Product information */}
                <div className="p-5">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {product.category}
                  </p>

                  <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                    {product.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {product.description}
                  </p>


                  {/* Bottom */}
                  <div className="mt-5 flex items-center justify-between">

                    <span className="text-lg font-bold text-slate-900">
                      ₹{product.price}
                    </span>

                    <Link
                      to="/products"
                      className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      View
                    </Link>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}


        {/* Mobile View All */}
        <div className="mt-8 sm:hidden">
          <Link
            to="/products"
            className="block rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            View all products →
          </Link>
        </div>

      </section>


      {/* ================= TRUST SECTION ================= */}
      <section className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:grid-cols-3 sm:px-8 lg:px-12">

          <div>
            <div className="mb-3 text-xl font-bold text-slate-900">
              ✓
            </div>

            <h3 className="font-semibold text-slate-900">
              Quality Products
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Carefully selected products for everyday needs.
            </p>
          </div>

          <div>
            <div className="mb-3 text-xl font-bold text-slate-900">
              ✓
            </div>

            <h3 className="font-semibold text-slate-900">
              Secure Payments
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Safe and secure checkout with Stripe.
            </p>
          </div>

          <div>
            <div className="mb-3 text-xl font-bold text-slate-900">
              ✓
            </div>

            <h3 className="font-semibold text-slate-900">
              Order Tracking
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track your orders from purchase to delivery.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;