"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, PackageX, Copy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";

export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      } else {
        toast("error", data.message || "Failed to fetch products");
      }
    } catch (error) {
      toast("error", "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (res.ok) {
        toast("success", "Product deleted successfully");
        setProducts(products.filter(p => p._id !== id));
      } else {
        toast("error", data.error || "Failed to delete product");
      }
    } catch (error: any) {
      toast("error", error.message || "An error occurred while deleting");
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to duplicate "${name}"?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (res.ok) {
        toast("success", "Product duplicated successfully");
        // Refetch products to show the newly duplicated one
        fetchProducts();
      } else {
        toast("error", data.error || "Failed to duplicate product");
      }
    } catch (error: any) {
      toast("error", error.message || "An error occurred while duplicating");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesStock = stockFilter === "all" || 
                         (stockFilter === "in-stock" ? p.inStock : !p.inStock);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your store's products, pricing, and inventory.</p>
        </div>
        <Link 
          href="/admin/products/add"
          className="bg-primary hover:bg-[#ff5a7f] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-6 relative z-30">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl font-medium text-sm transition-colors md:w-auto ${
              showFilters || categoryFilter !== "all" || stockFilter !== "all" || statusFilter !== "all"
                ? "bg-pink-50 border-pink-200 text-primary" 
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {(categoryFilter !== "all" || stockFilter !== "all" || statusFilter !== "all") && "(Active)"}
          </button>

          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Stock Status</label>
                  <select 
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="all">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="all">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      setCategoryFilter("all");
                      setStockFilter("all");
                      setStatusFilter("all");
                      setSearchQuery("");
                      setShowFilters(false);
                    }}
                    className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right sticky right-0 bg-gray-50/80 z-10 border-l border-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <p className="mt-4 text-gray-500 font-medium">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <PackageX className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                      <p className="text-gray-500 mt-1 max-w-sm">We couldn't find any products matching your search or your store is currently empty.</p>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="mt-4 text-primary font-semibold hover:underline">
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden relative shrink-0 bg-gray-50">
                          {product.images && product.images[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Img</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                            {product.status === 'draft' && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                Draft
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Added {new Date(product.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">৳{product.price}</span>
                        {product.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">৳{product.oldPrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-semibold ${product.inStock ? 'text-emerald-600' : 'text-red-600'}`}>
                          {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-gray-50/50 z-10 border-l border-gray-100 shadow-[-5px_0_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <Link href={`/product/${product.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Live">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/products/edit/${product._id}`} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDuplicate(product._id, product.name)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Mobile fallback (always visible on very small screens) */}
                      <button className="p-2 text-gray-400 lg:hidden">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
            <span>Showing {filteredProducts.length} products</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-50">Prev</button>
              <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-white disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
