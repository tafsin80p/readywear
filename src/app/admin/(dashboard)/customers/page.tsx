import React from "react";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { Search, Mail, Calendar, TrendingUp, ShieldBan } from "lucide-react";
import Image from "next/image";
import { CustomerActions } from "@/components/admin/CustomerActions";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const formatDate = (date: Date | string) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

export default async function AdminCustomersPage() {
  await connectToDatabase();

  // Aggregate users to include total orders and total spent
  const rawCustomers = await User.aggregate([
    { $match: { role: 'user' } },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'userId',
        as: 'orders'
      }
    },
    {
      $addFields: {
        totalOrders: { $size: '$orders' },
        // Calculate total spent only for orders that are not cancelled
        totalSpent: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$orders",
                  as: "order",
                  cond: { $ne: ["$$order.status", "cancelled"] }
                }
              },
              as: "validOrder",
              in: "$$validOrder.pricing.total"
            }
          }
        }
      }
    },
    {
      $project: {
        orders: 0,
        password: 0
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  // Serialize complex types (like MongoDB ObjectId)
  const customers = JSON.parse(JSON.stringify(rawCustomers));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and view your customer base</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers Table - Full width, no side gaps */}
      <div className="w-full bg-white border-y border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-sm font-semibold text-gray-600">
              <th className="px-6 py-4 whitespace-nowrap">Customer Info</th>
              <th className="px-6 py-4 whitespace-nowrap">Contact</th>
              <th className="px-6 py-4 whitespace-nowrap">Joined Date</th>
              <th className="px-6 py-4 whitespace-nowrap text-center">Total Orders</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Total Spent</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-900 font-medium text-lg">No customers found</p>
                    <p className="text-gray-500 text-sm mt-1">When users sign up, they will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer: any) => (
                <tr 
                  key={customer._id}
                  className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {customer.image ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                          <Image src={customer.image} alt={customer.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{customer.name}</span>
                        {/* Optional: Add a badge if they are a top spender */}
                        <div className="flex items-center gap-2 mt-0.5">
                          {customer.totalSpent > 5000 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                              <TrendingUp className="w-3 h-3" /> VIP
                            </span>
                          )}
                          {customer.isBanned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600">
                              <ShieldBan className="w-3 h-3" /> Banned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(customer.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center justify-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                        {customer.totalOrders}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-bold text-gray-900 text-sm">৳ {customer.totalSpent.toLocaleString('en-US')}</span>
                      <span className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">(Lifetime Value)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <CustomerActions customerId={customer._id.toString()} isBanned={customer.isBanned || false} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
