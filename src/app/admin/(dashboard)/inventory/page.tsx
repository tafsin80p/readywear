import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import InventoryClient from "@/components/admin/InventoryClient";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminInventoryPage() {
  await connectToDatabase();

  const rawProducts = await Product.find()
    .select("name sku images stock price oldPrice discount category updatedAt")
    .sort({ updatedAt: -1 })
    .lean();
    
  const products = JSON.parse(JSON.stringify(rawProducts));

  return <InventoryClient products={products} />;
}
