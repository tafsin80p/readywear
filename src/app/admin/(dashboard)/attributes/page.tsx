"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, Tag, Settings, ArrowLeft, Palette, Type } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AttributeTerm {
  name: string;
  meta: string;
}

interface Attribute {
  _id: string;
  name: string;
  type: "text" | "color";
  values: AttributeTerm[];
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // View State: null = main view, string = configuring specific attribute ID
  const [activeAttributeId, setActiveAttributeId] = useState<string | null>(null);

  // Form State: Add Attribute
  const [attrName, setAttrName] = useState("");
  const [attrType, setAttrType] = useState<"text" | "color">("text");

  // Form State: Add Term
  const [termName, setTermName] = useState("");
  const [termMeta, setTermMeta] = useState("#F5426A");

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await fetch("/api/admin/attributes");
      const data = await res.json();
      if (data.success) {
        setAttributes(data.attributes);
      }
    } catch (error) {
      toast("Failed to load attributes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName.trim()) return toast("Attribute name is required", "error");

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: attrName.trim(), type: attrType, values: [] }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast("Attribute created successfully", "success");
        setAttrName("");
        setAttrType("text");
        fetchAttributes();
      } else {
        toast(data.error || "Failed to create attribute", "error");
      }
    } catch (error) {
      toast("Something went wrong", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attribute? All its terms will be lost.")) return;
    try {
      const res = await fetch(`/api/admin/attributes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Attribute deleted", "success");
        if (activeAttributeId === id) setActiveAttributeId(null);
        fetchAttributes();
      } else {
        toast(data.error || "Failed to delete", "error");
      }
    } catch (error) {
      toast("Something went wrong", "error");
    }
  };

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAttributeId) return;
    if (!termName.trim()) return toast("Name is required", "error");

    const activeAttr = attributes.find(a => a._id === activeAttributeId);
    if (!activeAttr) return;

    // Check for duplicates
    if (activeAttr.values.some(v => v.name.toLowerCase() === termName.trim().toLowerCase())) {
      return toast("This term already exists", "error");
    }

    const newTerm: AttributeTerm = {
      name: termName.trim(),
      meta: activeAttr.type === "color" ? termMeta : "",
    };

    const newValues = [...activeAttr.values, newTerm];

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/attributes/${activeAttributeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: newValues }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Term added", "success");
        setTermName("");
        setTermMeta("#F5426A");
        fetchAttributes();
      } else {
        toast(data.error || "Failed to add term", "error");
      }
    } catch (error) {
      toast("Something went wrong", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTerm = async (termNameToDelete: string) => {
    if (!activeAttributeId) return;
    
    const activeAttr = attributes.find(a => a._id === activeAttributeId);
    if (!activeAttr) return;

    const newValues = activeAttr.values.filter(v => v.name !== termNameToDelete);

    try {
      const res = await fetch(`/api/admin/attributes/${activeAttributeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: newValues }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Term removed", "success");
        fetchAttributes();
      }
    } catch (error) {
      toast("Failed to remove term", "error");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading attributes...</div>;
  }

  const activeAttr = activeAttributeId ? attributes.find(a => a._id === activeAttributeId) : null;

  return (
    <div className="p-6 md:p-8 w-full">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        {activeAttr ? (
          <button 
            onClick={() => setActiveAttributeId(null)}
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeAttr ? `Configure Terms: ${activeAttr.name}` : "Attributes"}
          </h1>
          <p className="text-gray-500 mt-1">
            {activeAttr 
              ? `Manage the predefined values for the ${activeAttr.name} attribute.` 
              : "Attributes let you define extra product data, such as size or color."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            
            {activeAttr ? (
              // Add Term Form
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New {activeAttr.name}
                </h2>
                <form onSubmit={handleAddTerm} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder={activeAttr.type === "color" ? "e.g. Red, Navy Blue" : "e.g. S, M, XL"}
                      value={termName}
                      onChange={(e) => setTermName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all"
                      required
                    />
                  </div>

                  {activeAttr.type === "color" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color Value</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={termMeta}
                          onChange={(e) => setTermMeta(e.target.value)}
                          className="w-12 h-12 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={termMeta}
                          onChange={(e) => setTermMeta(e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all uppercase font-medium"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Add New Item"}
                  </button>
                </form>
              </>
            ) : (
              // Add Attribute Form
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Attribute
                </h2>
                <form onSubmit={handleAddAttribute} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Size, Color, Fabric"
                      value={attrName}
                      onChange={(e) => setAttrName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5426A]/20 focus:border-[#F5426A] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAttrType("text")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                          attrType === "text" 
                            ? "bg-pink-50 border-primary text-primary" 
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Type className="w-4 h-4" /> Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttrType("color")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                          attrType === "color" 
                            ? "bg-pink-50 border-primary text-primary" 
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Palette className="w-4 h-4" /> Color
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Add Attribute"}
                  </button>
                </form>
              </>
            )}
            
          </div>
        </div>

        {/* List Section */}
        <div className="xl:col-span-2 space-y-4">
          
          {activeAttr ? (
            // Terms List
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-5 text-sm font-bold text-gray-700">Name</th>
                    {activeAttr.type === "color" && (
                      <th className="py-3 px-5 text-sm font-bold text-gray-700">Preview</th>
                    )}
                    <th className="py-3 px-5 text-sm font-bold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeAttr.values.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        No terms added yet. Add one on the left.
                      </td>
                    </tr>
                  ) : (
                    activeAttr.values.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-5 font-semibold text-gray-900">{v.name}</td>
                        {activeAttr.type === "color" && (
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                                style={{ backgroundColor: v.meta }}
                              ></span>
                              <span className="text-xs text-gray-500 uppercase">{v.meta}</span>
                            </div>
                          </td>
                        )}
                        <td className="py-3 px-5 text-right">
                          <button
                            onClick={() => handleDeleteTerm(v.name)}
                            className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            // Attributes List
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-5 text-sm font-bold text-gray-700">Name</th>
                    <th className="py-3 px-5 text-sm font-bold text-gray-700">Terms</th>
                    <th className="py-3 px-5 text-sm font-bold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attributes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Tag className="w-8 h-8 text-primary opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No attributes yet</h3>
                        <p className="text-gray-500">Create your first attribute on the left.</p>
                      </td>
                    </tr>
                  ) : (
                    attributes.map((attr) => (
                      <tr key={attr._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-gray-900 mb-0.5">{attr.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{attr.type} attribute</div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-wrap gap-1.5">
                            {attr.values.length > 0 ? (
                              attr.values.slice(0, 5).map((v, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                  {v.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">No terms</span>
                            )}
                            {attr.values.length > 5 && (
                              <span className="px-2 py-0.5 text-gray-500 text-xs font-semibold">+{attr.values.length - 5} more</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveAttributeId(attr._id)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <Settings className="w-3.5 h-3.5" /> Configure terms
                            </button>
                            <button
                              onClick={() => handleDeleteAttribute(attr._id)}
                              className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
          )}
          
        </div>
        
      </div>
    </div>
  );
}
