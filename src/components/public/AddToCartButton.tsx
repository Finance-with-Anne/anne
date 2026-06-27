"use client";

import { useCart } from "@/contexts/CartContext";

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    image_url?: string | null;
  };
}

export default function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        image_url: product.image_url,
      })}
      className="flex-1 rounded-xl bg-[#0822C0] text-white font-bold py-3.5 px-6 text-sm hover:bg-[#0618a0] transition-colors"
    >
      Add to Cart
    </button>
  );
}
