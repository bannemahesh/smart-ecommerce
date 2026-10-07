import { Link } from "react-router-dom";

function PaymentSuccess() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto flex max-w-lg items-center justify-center">

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">

          {/* Success icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
              ✓
            </div>
          </div>

          {/* Heading */}
          <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-emerald-600">
            PAYMENT CONFIRMED
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Payment Successful
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
            Your payment was completed successfully. Thank you for your order.
          </p>

          {/* Information */}
          <div className="mt-7 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Your order has been confirmed and is now being processed.
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">

            <Link
              to="/orders"
              className="flex-1 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View My Orders
            </Link>

            <Link
              to="/products"
              className="flex-1 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}

export default PaymentSuccess;