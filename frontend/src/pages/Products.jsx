import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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

function Products() {
  const { token, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (category) {
        params.append("category", category);
      }

      if (minPrice) {
        params.append("min_price", minPrice);
      }

      if (maxPrice) {
        params.append("max_price", maxPrice);
      }

      const url = `${API_BASE_URL}/products${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url);

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

  const handleFilter = (event) => {
    event.preventDefault();
    fetchProducts();
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      alert("Please login to add products to your cart.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add product to cart");
      }

      alert("Product added to cart successfully.");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================= HEADER ================= */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">

          <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-slate-500">
            STORE
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                All Products
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Browse our collection and find something you'll love.
              </p>
            </div>

            {!loading && !error && (
              <p className="text-sm text-slate-500">
                {products.length} products
              </p>
            )}

          </div>
        </div>
      </section>


      {/* ================= CONTENT ================= */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">

        {/* ================= FILTERS ================= */}
        <form
          onSubmit={handleFilter}
          className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >

          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Filter products
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Narrow down products by category and price.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* Category */}
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
            />

            {/* Min price */}
            <input
              type="number"
              placeholder="Minimum price"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
            />

            {/* Max price */}
            <input
              type="number"
              placeholder="Maximum price"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
            />

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20"
            >
              Apply Filters
            </button>

          </div>
        </form>


        {/* ================= LOADING ================= */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-slate-100" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}

          </div>
        )}


        {/* ================= ERROR ================= */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* ================= EMPTY ================= */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
              —
            </div>

            <h2 className="font-semibold text-slate-900">
              No products found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your filters and search again.
            </p>

          </div>
        )}


        {/* ================= PRODUCT GRID ================= */}
        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product) => (

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

                  {/* Stock */}
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


                {/* Information */}
                <div className="p-5">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {product.category}
                  </p>

                  <h2 className="line-clamp-1 text-base font-semibold text-slate-900">
                    {product.name}
                  </h2>

                  <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
                    {product.description}
                  </p>


                  {/* Price */}
                  <div className="mt-5 flex items-center justify-between">

                    <span className="text-lg font-bold text-slate-900">
                      ₹{product.price}
                    </span>

                    <span className="text-xs text-slate-500">
                      {product.stock > 0
                        ? `${product.stock} available`
                        : "Unavailable"}
                    </span>

                  </div>


                  {/* Cart */}
                  <button
                    disabled={product.stock === 0}
                    onClick={() => addToCart(product.id)}
                    className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {product.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>
    </main>
  );
}

export default Products;