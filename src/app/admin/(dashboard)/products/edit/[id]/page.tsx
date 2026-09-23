"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Info, Package, DollarSign, Image as ImageIcon, Tag, List, Star, Search, ChevronDown, Check, Palette } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { ImageUpload } from "@/components/ImageUpload";
import Image from "next/image";

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const defaultNote = `১। ডেলিভারি চার্জ সম্পর্কিত তথ্যঃ ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৮০ টাকা, ঢাকা সিটির বাইরে ডেলিভারি চার্জ ১৫০ টাকা।
২। বুকিং মানি সম্পর্কিত তথ্যঃ সারা বাংলাদেশে থানা লেভেল পর্যন্ত ক্যাশ অন ডেলিভারি, ১০০০ টাকা অগ্রিম। বাকি টাকা পণ্য বুঝে পেয়ে পরিশোধ করতে পারবেন।
৩। ছবিতে পণ্যের রঙ দেখুন; আপনার কম্পিউটার অথবা মোবাইলের রেজুলেশন ও লাইটিং এর জন্য ইমেজ ও প্রকৃত পণ্যের রঙ-এ সামান্য তারতম্য ঘটতে পারে।
৪। প্রোডাক্টের অর্ডার স্টক থাকা সাপেক্ষে ডেলিভারি করা হবে। অনিবার্য কারণে পণ্যের ডেলিভারিতে বিক্রেতা প্রতিশ্রুত ডেলিভারি সময়ের বেশী লাগতে পারে।`;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "saree", // default
    subCategory: "",
    regularPrice: "",
    discountPrice: "",
    sku: "",
    stock: "",
    note: defaultNote,
    images: [] as string[],
  });

  const [specs, setSpecs] = useState([{ label: "", value: "" }]);
  const [attributes, setAttributes] = useState([{ name: "", values: [{ value: "", meta: "", stock: "" }] }]);
  const [openAttrDropdown, setOpenAttrDropdown] = useState<number | null>(null);
  const [attrSearchQuery, setAttrSearchQuery] = useState("");
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openAttrDropdown !== null) {
        const ref = dropdownRefs.current[openAttrDropdown];
        if (ref && !ref.contains(e.target as Node)) {
          setOpenAttrDropdown(null);
          setAttrSearchQuery("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openAttrDropdown]);

  interface GlobalAttribute {
    _id: string;
    name: string;
    type: "text" | "color";
    values: { name: string; meta: string }[];
  }
  const [globalAttributes, setGlobalAttributes] = useState<GlobalAttribute[]>([]);

  useEffect(() => {
    fetch('/api/admin/attributes')
      .then(res => res.json())
      .then(data => {
        if (data.success) setGlobalAttributes(data.attributes);
      })
      .catch(err => console.error("Failed to load attributes", err));
  }, []);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to fetch product");
        
        setFormData({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          category: data.category || "saree",
          subCategory: data.subCategory || "",
          regularPrice: data.oldPrice ? data.oldPrice.toString() : data.price?.toString() || "",
          discountPrice: data.oldPrice ? data.price?.toString() : "",
          sku: data.sku || "",
          stock: data.stock?.toString() || "",
          note: data.note || defaultNote,
          images: data.images || [],
        });
        
        if (data.specifications && data.specifications.length > 0) {
          setSpecs(data.specifications);
        }
        
        if (data.attributes && data.attributes.length > 0) {
          // Convert numeric stock to string for the form
          const mappedAttributes = data.attributes.map((attr: any) => ({
            ...attr,
            values: attr.values.map((v: any) => ({
              ...v,
              stock: v.stock?.toString() || ""
            }))
          }));
          setAttributes(mappedAttributes);
        }
      } catch (err: any) {
        toast("error", err.message);
        router.push("/admin/products");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProduct();
  }, [id, router, toast]);

  const [categories, setCategories] = useState<{value: string, label: string, parentCategory: string | null}[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories.map((c: any) => ({
            value: c.slug,
            label: c.name,
            parentCategory: c.parentCategory || null
          })));
        }
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.slug = value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u0980-\u09FF\-]+/g, "");
      }
      if (name === "slug") {
        updated.slug = value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u0980-\u09FF\-]+/g, "");
      }
      return updated;
    });
  };

  const handleFeaturedImageUpload = (url: string) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      if (newImages.length > 0) {
        newImages[0] = url; // Replace existing featured image
      } else {
        newImages.push(url); // Add as first image if none exist
      }
      return { ...prev, images: newImages };
    });
  };

  const handleGalleryImageUpload = (url: string) => {
    setFormData(prev => {
      if (prev.images.length === 0) {
        // If they upload gallery first, make it the featured image automatically
        return { ...prev, images: [url] };
      }
      return { ...prev, images: [...prev.images, url] };
    });
  };

  const removeFeaturedImage = () => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.slice(1) // removes the first element
    }));
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove + 1) // +1 because gallery is offset by 1
    }));
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { label: "", value: "" }]);
  
  const removeSpec = (index: number) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, idx) => idx !== index));
    }
  };

  const handleAttributeNameChange = (attrIndex: number, name: string) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].name = name;
    
    const globalAttr = globalAttributes.find(g => g.name === name);
    if (globalAttr && globalAttr.values.length > 0) {
      newAttributes[attrIndex].values = globalAttr.values.map(val => ({ value: val.name, meta: val.meta, stock: "" }));
    } else {
      newAttributes[attrIndex].values = [{ value: "", meta: "", stock: "" }];
    }
    
    setAttributes(newAttributes);
  };

  const handleAttributeValueChange = (attrIndex: number, valIndex: number, field: 'value' | 'stock', val: string) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].values[valIndex][field] = val;
    setAttributes(newAttributes);
  };

  const addAttribute = () => setAttributes([...attributes, { name: "", values: [{ value: "", meta: "", stock: "" }] }]);
  
  const removeAttribute = (attrIndex: number) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, idx) => idx !== attrIndex));
    }
  };

  const addAttributeValue = (attrIndex: number) => {
    const newAttributes = [...attributes];
    newAttributes[attrIndex].values.push({ value: "", meta: "", stock: "" });
    setAttributes(newAttributes);
  };

  const removeAttributeValue = (attrIndex: number, valIndex: number) => {
    const newAttributes = [...attributes];
    if (newAttributes[attrIndex].values.length > 1) {
      newAttributes[attrIndex].values = newAttributes[attrIndex].values.filter((_, idx) => idx !== valIndex);
      setAttributes(newAttributes);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    setIsLoading(true);

    if (formData.images.length === 0) {
      toast("error", "Please upload a featured image.");
      setIsLoading(false);
      return;
    }

    try {
      const validSpecs = specs.filter(s => s.label.trim() !== "" && s.value.trim() !== "");

      const parsedAttributes = attributes
        .filter(attr => attr.name.trim() !== "")
        .map(attr => ({
          name: attr.name.trim(),
          values: attr.values
            .filter(v => v.value.trim() !== "" && v.stock.trim() !== "")
            .map(v => ({
              value: v.value.trim(),
              meta: v.meta || "",
              stock: Number(v.stock) || 0
            }))
        }))
        .filter(attr => attr.values.length > 0);

      const regPrice = Number(formData.regularPrice);
      const discPrice = formData.discountPrice ? Number(formData.discountPrice) : undefined;
      
      const payloadPrice = discPrice && discPrice < regPrice ? discPrice : regPrice;
      const payloadOldPrice = discPrice && discPrice < regPrice ? regPrice : undefined;

      const payload = {
        ...formData,
        price: payloadPrice,
        oldPrice: payloadOldPrice,
        stock: Number(formData.stock),
        specifications: validSpecs,
        attributes: parsedAttributes,
        status: status
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to update product");
      }

      toast("success", `Product ${status === 'draft' ? 'saved as draft' : 'updated successfully'}!`);
      router.push("/admin/products");

    } catch (error: any) {
      toast("error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredImage = formData.images[0];
  const galleryImages = formData.images.slice(1);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave('published'); }} className="p-6 md:p-8 w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Edit Product</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push(`/product/${formData.slug}`)}
            className="px-5 py-2.5 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors hidden sm:block"
          >
            View Live
          </button>
          <button 
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isLoading}
            className="px-5 py-2.5 text-primary font-bold bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors hidden sm:block disabled:opacity-70"
          >
            Save Draft
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-70 min-w-[140px]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Product</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Main Form) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                General Information
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Product Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Exclusive Cotton Saree"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Product Slug (URL) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="exclusive-cotton-saree"
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Unique URL for this product. Auto-generated from name.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Describe your product beautifully..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Pricing
              </h2>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Regular Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                    <input 
                      type="number" 
                      name="regularPrice"
                      value={formData.regularPrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-gray-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Discount Price (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                    <input 
                      type="number" 
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-primary"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">If provided, the regular price will be crossed out automatically.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Inventory
              </h2>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">SKU <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. RW-1001"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Stock <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="e.g. 50"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </div>



          {/* Specifications */}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <List className="w-5 h-5 text-primary" />
                Specifications
              </h2>
              <button 
                type="button" 
                onClick={addSpec}
                className="text-sm font-bold text-primary flex items-center gap-1 hover:underline bg-primary/10 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Label (e.g., Fabric)"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Value (e.g., Pure Cotton)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeSpec(idx)}
                    disabled={specs.length === 1}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 shrink-0"
                  >
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Product Note */}
          <div className="bg-red-50/50 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-red-50/80">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Info className="w-5 h-5" />
                Product Note (বিঃদ্রঃ)
              </h2>
            </div>
            <div className="p-6">
              <textarea 
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={6}
                placeholder="Write any special notes here..."
                className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y text-sm text-gray-700 leading-relaxed"
              ></textarea>
              <p className="text-xs text-gray-500 mt-2">This note will be displayed on the product single page exactly as typed.</p>
            </div>
          </div>

        </div>

        {/* Right Column (Side Options) */}
        <div className="space-y-8">
          
          {/* Upload Img */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 pb-0 flex justify-between items-center">
              <h2 className="text-[15px] font-bold text-gray-900">Upload Img</h2>
            </div>
            
            <div className="p-5">
              {/* Main Large Image Viewer */}
              <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl overflow-hidden group bg-[#F8F9FA] flex flex-col items-center justify-center mb-4">
                {featuredImage ? (
                  <>
                    <Image src={featuredImage} alt="Featured" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={removeFeaturedImage}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <ImageUpload onUpload={handleFeaturedImageUpload} folder={`readywear/products/${formData.slug || 'untitled'}/featured`} className="!p-0 !border-none !bg-transparent text-white w-full h-full">
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm pointer-events-auto cursor-pointer">Change Main Image</span>
                        </div>
                      </ImageUpload>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-xl">
                    <ImageUpload onUpload={handleFeaturedImageUpload} folder={`readywear/products/${formData.slug || 'untitled'}/featured`}>
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-bold uppercase">Upload Main</span>
                      </div>
                    </ImageUpload>
                  </div>
                )}
              </div>

              {/* Thumbnails Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-gray-50">
                    <Image src={img} alt="Gallery" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {galleryImages.length < 3 && (
                  <div className="aspect-square border-2 border-dashed border-gray-200 hover:border-primary/50 bg-gray-50 hover:bg-primary/5 rounded-lg transition-all overflow-hidden cursor-pointer">
                    <ImageUpload onUpload={handleGalleryImageUpload} folder={`readywear/products/${formData.slug || 'untitled'}/gallery`}>
                      <div className="w-full h-full flex flex-col items-center justify-center text-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-white flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </ImageUpload>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 md:p-6">
            <h2 className="text-[16px] font-bold text-gray-900 mb-4">Category</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Product Category</label>
                <div className="relative">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Clear subcategory when parent category changes
                      setFormData(prev => ({ ...prev, subCategory: "" }));
                    }}
                    className="w-full pl-4 pr-10 py-3 bg-gray-100/70 border border-transparent hover:border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer font-medium text-gray-900 text-sm"
                  >
                    {categories.filter(c => !c.parentCategory).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sub Category (Optional)</label>
                <div className="relative">
                  <select 
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 bg-gray-100/70 border border-transparent hover:border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer font-medium text-gray-900 text-sm"
                  >
                    <option value="">Select a sub category</option>
                    {categories.filter(c => c.parentCategory === formData.category).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <Link href="/admin/categories" className="bg-primary hover:bg-[#ff5a7f] text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md shadow-primary/20 text-center block w-full">
                Add Category
              </Link>
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4.5 h-4.5 text-primary" />
                  Attributes
                </h2>
                <p className="text-xs text-gray-400 mt-1">Select attributes and their values for this product</p>
              </div>
              <button 
                type="button"
                onClick={addAttribute}
                className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Add Attribute
              </button>
            </div>

            <div className="space-y-4">
              {attributes.map((attr, idx) => {
                const globalAttr = globalAttributes.find(g => g.name === attr.name);
                const isColorType = globalAttr?.type === "color";
                
                return (
                  <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/30 transition-all hover:border-gray-300 relative">
                    {/* Attribute Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                      <div className="flex items-center gap-3 flex-1 min-w-0" ref={el => { dropdownRefs.current[idx] = el; }}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${attr.name ? "bg-primary/10" : "bg-gray-100"}`}>
                          {isColorType ? (
                            <Palette className="w-4 h-4 text-primary" />
                          ) : (
                            <Tag className={`w-4 h-4 ${attr.name ? "text-primary" : "text-gray-400"}`} />
                          )}
                        </div>
                        {globalAttributes.length > 0 ? (
                          <div className="flex-1 relative min-w-0">
                            {/* Trigger Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenAttrDropdown(openAttrDropdown === idx ? null : idx);
                                setAttrSearchQuery("");
                              }}
                              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                                openAttrDropdown === idx 
                                  ? "border-primary ring-2 ring-primary/20 bg-white" 
                                  : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                              }`}
                            >
                              <span className={`text-sm font-bold truncate ${attr.name ? "text-gray-900" : "text-gray-400"}`}>
                                {attr.name || "Select Attribute..."}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openAttrDropdown === idx ? "rotate-180 text-primary" : ""}`} />
                            </button>

                            {/* Dropdown Panel */}
                            {openAttrDropdown === idx && (
                              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden w-[260px]">
                                {/* Options List */}
                                <div className="max-h-60 overflow-y-auto py-1.5 px-1.5">
                                  {globalAttributes
                                    .filter(g => !attributes.some((a, aIdx) => aIdx !== idx && a.name === g.name))
                                    .map(g => {
                                      const isSelected = attr.name === g.name;
                                      return (
                                        <button
                                          key={g._id}
                                          type="button"
                                          onClick={() => {
                                            handleAttributeNameChange(idx, g.name);
                                            setOpenAttrDropdown(null);
                                          }}
                                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all mb-0.5 ${
                                            isSelected 
                                              ? "bg-primary/5 border border-primary/20" 
                                              : "hover:bg-gray-50 border border-transparent"
                                          }`}
                                        >
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                            g.type === "color" 
                                              ? "bg-gradient-to-br from-pink-100 to-purple-100" 
                                              : "bg-gray-100"
                                          }`}>
                                            {g.type === "color" ? (
                                              <Palette className="w-4 h-4 text-purple-500" />
                                            ) : (
                                              <Tag className="w-4 h-4 text-gray-500" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-gray-900 truncate">{g.name}</div>
                                            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${g.type === "color" ? "bg-purple-400" : "bg-gray-400"}`}></span>
                                              {g.type === "color" ? "Color" : "Text"} · {g.values.length} value{g.values.length !== 1 ? "s" : ""}
                                            </div>
                                          </div>
                                          {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                              <Check className="w-3 h-3 text-white" />
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })
                                  }
                                  {globalAttributes
                                    .filter(g => !attributes.some((a, aIdx) => aIdx !== idx && a.name === g.name))
                                    .length === 0 && (
                                    <div className="px-3 py-5 text-center">
                                      <p className="text-xs text-gray-400">No attributes available</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="Attribute name (e.g. Size)"
                            value={attr.name}
                            onChange={(e) => handleAttributeNameChange(idx, e.target.value)}
                            className="flex-1 bg-transparent focus:outline-none text-sm font-bold text-gray-900 placeholder:font-medium placeholder:text-gray-400 min-w-0"
                          />
                        )}
                      </div>
                      {attributes.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeAttribute(idx)}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    
                    {/* Attribute Values */}
                    {attr.name && (
                      <div className="p-4">
                        {/* Values header */}
                        <div className="mb-3">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Values ({attr.values.length})
                          </span>
                        </div>

                        {/* Values Grid */}
                        <div className="space-y-2">
                          {attr.values.map((v, vIdx) => (
                            <div 
                              key={vIdx} 
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-white border-gray-200 transition-all hover:border-gray-300"
                            >
                              {/* Color swatch or number badge */}
                              {isColorType && v.meta ? (
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0" 
                                  style={{ backgroundColor: v.meta }}
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                                  {vIdx + 1}
                                </div>
                              )}
                              
                              {/* Value name (read-only) */}
                              <span className="flex-1 text-sm font-medium text-gray-900 min-w-0 truncate">
                                {v.value}
                              </span>
                              
                              {/* Stock input */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase">Stock</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  placeholder="0"
                                  value={v.stock}
                                  onChange={(e) => handleAttributeValueChange(idx, vIdx, 'stock', e.target.value)}
                                  className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all text-xs text-center font-semibold"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {attr.values.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-xs text-gray-400">No values configured for this attribute. Add values from the Attributes menu.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty state */}
                    {!attr.name && (
                      <div className="p-6 text-center">
                        <p className="text-xs text-gray-400">Select an attribute above to configure its values</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hint */}
            {globalAttributes.length === 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Create global attributes from the <strong>Attributes</strong> menu first for a better experience.</span>
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </form>
  );
}
