"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Loader2, LayoutList, Search, ImageIcon } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";
import { ImageUpload } from "@/components/ImageUpload";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
      } else {
        toast("error", data.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast("error", "An error occurred while fetching categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "name" && !editingId) {
        // Only auto-generate slug when adding, not editing (unless they change it manually)
        updated.slug = value.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^\w\u0980-\u09FF-]+/g, "");
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Operation failed");
      }

      toast("success", editingId ? "Category updated successfully" : "Category created successfully");
      
      // Reset form
      setFormData({ name: "", slug: "", image: "" });
      setEditingId(null);
      
      // Refresh list
      fetchCategories();
    } catch (error: any) {
      toast("error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast("success", "Category deleted successfully");
        setCategories(categories.filter(c => c._id !== id));
      } else {
        toast("error", data.message || "Failed to delete category");
      }
    } catch (error: any) {
      toast("error", error.message || "An error occurred");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 w-full animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-[#F5426A]" />
            Categories
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage product categories and collections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Add/Edit Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Summer Collection"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Slug (URL) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="summer-collection"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category Image</label>
              
              <div className="relative w-full aspect-video rounded-xl overflow-hidden group bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#F5426A]/50 transition-all">
                {formData.image ? (
                  <>
                    <Image src={formData.image} alt="Category" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <ImageUpload onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))} folder="readywear/categories" className="!p-0 !border-none !bg-transparent text-white w-full h-full">
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm pointer-events-auto cursor-pointer">Change Image</span>
                        </div>
                      </ImageUpload>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full text-gray-400 hover:text-[#F5426A] transition-colors cursor-pointer">
                    <ImageUpload onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))} folder="readywear/categories">
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-bold uppercase">Upload Image</span>
                      </div>
                    </ImageUpload>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              {editingId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", slug: "", image: "" });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? "Update Category" : "Add Category")}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Categories List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">All Categories</h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                      <p className="text-gray-500 mt-2">Loading categories...</p>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <LayoutList className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">No categories found</h3>
                      <p className="text-gray-500 mt-1">Try a different search or add a new category.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category._id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {category.image ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 relative">
                            <Image src={category.image} alt={category.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{category.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(category)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(category._id, category.name)}
                            className="p-2 text-gray-400 hover:text-[#F5426A] hover:bg-[#F5426A]/10 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
