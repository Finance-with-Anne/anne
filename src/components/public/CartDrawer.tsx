"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

function sym(cur: string) {
  if (cur === "GBP") return "£";
  if (cur === "USD") return "$";
  return "₦";
}

export default function CartDrawer() {
  const { items, count, total, currency, isOpen, removeItem, updateQty, closeCart } = useCart();
  const s = sym(currency);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={closeCart} />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-[#0d1220] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-700 dark:text-white/60" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Cart {count > 0 && <span className="text-gray-400 dark:text-white/40 font-normal">· {count}</span>}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-gray-300 dark:text-white/15" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-white/40">Your cart is empty</p>
              <p className="text-xs text-gray-400 dark:text-white/25 mt-1">Add products to get started.</p>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="flex gap-3 items-start">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-[#0822C0]/8 dark:bg-[#0822C0]/20 shrink-0 flex items-center justify-center">
                  <svg className="h-5 w-5 text-[#0822C0]/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{s}{item.price.toLocaleString()} each</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="h-6 w-6 rounded-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-bold text-sm leading-none"
                  >−</button>
                  <span className="text-xs font-semibold text-gray-700 dark:text-white/60 w-4 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="h-6 w-6 rounded-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-bold text-sm leading-none"
                  >+</button>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{s}{(item.price * item.qty).toLocaleString()}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-1.5 text-[11px] text-red-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-white/10 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-white/40">Total</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">{s}{total.toLocaleString()}</span>
            </div>
            <Link
              href="/shop/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0822C0] text-white text-sm font-semibold py-3 hover:bg-[#061aa0] transition-colors"
            >
              Checkout
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-[10px] text-center text-gray-400 dark:text-white/25">Secured by Flutterwave</p>
          </div>
        )}
      </div>
    </>
  );
}
