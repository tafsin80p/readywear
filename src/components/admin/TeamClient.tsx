"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Mail, 
  User, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  X, 
  Lock, 
  AlertCircle, 
  Loader2,
  PackageCheck,
  Ban
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/context/ConfirmContext";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  createdAt: string;
}

export function TeamClient({ 
  initialMembers, 
  currentUserId 
}: { 
  initialMembers: TeamMember[]; 
  currentUserId: string;
}) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirm();

  // Add Member Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as "admin" | "staff"
  });

  // Edit Member Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "staff" as "admin" | "staff",
    newPassword: ""
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "staff"
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      role: member.role,
      newPassword: ""
    });
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Adding team member...");
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success && data.member) {
        toast.success(data.message || "Member created successfully", { id: toastId });
        setMembers(prev => [data.member, ...prev]);
        setIsAddOpen(false);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to create member", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Error creating member", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editFormData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editFormData.newPassword && editFormData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating member...");
    try {
      const res = await fetch(`/api/admin/team/${editingMember._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name,
          role: editFormData.role,
          password: editFormData.newPassword || undefined
        })
      });
      const data = await res.json();

      if (data.success && data.member) {
        toast.success("Member updated successfully", { id: toastId });
        setMembers(prev => prev.map(m => m._id === editingMember._id ? data.member : m));
        setEditingMember(null);
        router.refresh();
      } else {
        toast.error(data.message || "Failed to update member", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating member", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (member._id === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    const confirmed = await confirm({
      title: "Remove Team Member",
      message: `Are you sure you want to remove "${member.name}" (${member.email})? This member will immediately lose all access.`,
      confirmText: "Yes, Remove",
      variant: "danger"
    });

    if (!confirmed) return;

    const toastId = toast.loading("Removing member...");
    try {
      const res = await fetch(`/api/admin/team/${member._id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Member removed", { id: toastId });
        setMembers(prev => prev.filter(m => m._id !== member._id));
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete member", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Error removing member", { id: toastId });
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = members.length;
  const adminCount = members.filter(m => m.role === "admin").length;
  const staffCount = members.filter(m => m.role === "staff").length;

  return (
    <div className="w-full space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Team</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalMembers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Administrators</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{adminCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Full System Access</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Staff Operators</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{staffCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Orders Only (No Delete)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm active:scale-[0.99]"
        >
          <UserPlus className="w-4 h-4" />
          Add New Member
        </button>
      </div>

      {/* Team Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Access & Permissions</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isCurrent = member._id === currentUserId;
                  const isAdmin = member.role === "admin";

                  return (
                    <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isAdmin 
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              {member.name}
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                  You
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{member.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <PackageCheck className="w-3.5 h-3.5" />
                            Staff Operator
                          </span>
                        )}
                      </td>

                      {/* Permissions Description */}
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <div className="text-xs text-gray-700">
                            <span className="font-medium text-emerald-600">● Full Access</span>
                            <p className="text-[11px] text-gray-400 mt-0.5">Settings, analytics, orders, products & team</p>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-700">
                            <span className="font-medium text-amber-600">● Orders Only</span>
                            <p className="text-[11px] text-gray-400 mt-0.5">View, manage & add orders. Cannot delete or see admin settings.</p>
                          </div>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Edit Member"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteMember(member)}
                            disabled={isCurrent}
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrent 
                                ? "opacity-30 cursor-not-allowed bg-gray-50 text-gray-400" 
                                : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                            }`}
                            title={isCurrent ? "You cannot delete yourself" : "Remove Member"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Add Team Member</h2>
                  <p className="text-xs text-gray-500">Create an operator or admin login for your store</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address (Login ID) *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. staff@readywear.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password * (Min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Role & Permissions *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Staff Card */}
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, role: "staff" }))}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.role === "staff"
                        ? "border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-sm text-gray-900">Staff Operator</span>
                      </div>
                      {formData.role === "staff" && (
                        <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Orders Only Access</p>
                    <ul className="text-[11px] text-gray-500 mt-2 space-y-1">
                      <li className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" /> View & update orders
                      </li>
                      <li className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" /> Add manual orders
                      </li>
                      <li className="flex items-center gap-1 text-red-500">
                        <Ban className="w-3 h-3" /> Cannot delete orders
                      </li>
                      <li className="flex items-center gap-1 text-red-500">
                        <Ban className="w-3 h-3" /> No settings/analytics
                      </li>
                    </ul>
                  </div>

                  {/* Admin Card */}
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, role: "admin" }))}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.role === "admin"
                        ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-sm text-gray-900">Administrator</span>
                      </div>
                      {formData.role === "admin" && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Full Access</p>
                    <ul className="text-[11px] text-gray-500 mt-2 space-y-1">
                      <li className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" /> Full settings & API
                      </li>
                      <li className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" /> Delete & trash access
                      </li>
                      <li className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" /> Analytics & Reports
                      </li>
                      <li className="flex items-center gap-1 text-emerald-600">
                        <Check className="w-3 h-3" /> Manage team members
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Team Member</h2>
                  <p className="text-xs text-gray-500">{editingMember.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role & Permissions
                </label>
                <select
                  value={editFormData.role}
                  disabled={editingMember._id === currentUserId}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value as "admin" | "staff" }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                >
                  <option value="staff">Staff Operator (Order Management Only)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
                {editingMember._id === currentUserId && (
                  <p className="text-[11px] text-gray-400 mt-1">You cannot change your own admin role.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Change Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter new password (optional)"
                    minLength={6}
                    value={editFormData.newPassword}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
