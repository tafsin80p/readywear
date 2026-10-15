"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, ShoppingBag, User, Phone, MapPin, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function CreateOrderModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    address: "",
    area: "inside" as "inside" | "outside",
    productId: "",
    quantity: 1,
    size: "",
    color: "",
    note: ""
  });

  useEffect(() => {
    if (isOpen && products.length === 0) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setFetchingProducts(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        if (data.products.length > 0 && !formData.productId) {
          setFormData(prev => ({ ...prev, productId: data.products[0]._id }));
        }
      }
    } catch (e) {
      console.error("Failed to load products for manual order", e);
    } finally {
      setFetchingProducts(false);
    }
  };

  const selectedProduct = products.find(p => p._id === formData.productId) || products[0];
  const unitPrice = selectedProduct?.price || 0;
  const deliveryCharge = formData.area === "inside" ? 80 : 150;
  const subtotal = unitPrice * (formData.quantity || 1);
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone || !formData.address) {
      toast.error("Please enter customer name, phone and address");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerInfo: {
          firstName: formData.firstName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          area: formData.area,
          note: formData.note ? formData.note.trim() : undefined,
        },
        items: [
          {
            productId: selectedProduct._id,
            title: selectedProduct.name,
            price: unitPrice,
            image: selectedProduct.images?.[0] || "",
            quantity: Number(formData.quantity) || 1,
            size: formData.size?.trim() || undefined,
            color: formData.color?.trim() || undefined,
          }
        ],
        pricing: {
          subtotal,
          deliveryCharge,
          total
        },
        paymentMethod: "cod",
        source: "Manual (Admin / Staff)"
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      toast.success(`Order created successfully! (${data.displayId || "New Order"})`);
      setIsOpen(false);
      setFormData({
        firstName: "",
        phone: "",
        address: "",
        area: "inside",
        productId: products[0]?._id || "",
        quantity: 1,
        size: "",
        color: "",
        note: ""
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>Create Order</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">New Manual Order</h3>
                  <p className="text-xs text-gray-500">Create an order for phone/chat customers</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Product *
                </label>
                {fetchingProducts ? (
                  <div className="py-2.5 text-xs text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
                  </div>
                ) : (
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — ৳{p.price} {p.sku ? `(${p.sku})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Size (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36, M, Free"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Information</h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number (01XXXXXXXXX) *"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      placeholder="Full Delivery Address *"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.area === 'inside' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                  <input
                    type="radio"
                    name="shipping_area"
                    checked={formData.area === "inside"}
                    onChange={() => setFormData({ ...formData, area: "inside" })}
                    className="accent-primary"
                  />
                  <div className="text-xs">
                    <div>Inside Dhaka</div>
                    <div className="font-normal opacity-70">৳ 80</div>
                  </div>
                </label>
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.area === 'outside' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                  <input
                    type="radio"
                    name="shipping_area"
                    checked={formData.area === "outside"}
                    onChange={() => setFormData({ ...formData, area: "outside" })}
                    className="accent-primary"
                  />
                  <div className="text-xs">
                    <div>Outside Dhaka</div>
                    <div className="font-normal opacity-70">৳ 150</div>
                  </div>
                </label>
              </div>

              {/* Order Calculation Preview */}
              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-600 border border-gray-100">
                <div className="flex justify-between">
                  <span>Subtotal ({formData.quantity} item):</span>
                  <span className="font-semibold text-gray-900">৳ {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold text-gray-900">৳ {deliveryCharge}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 text-sm font-bold text-gray-900">
                  <span>Total Bill:</span>
                  <span className="text-primary font-black">৳ {total}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
