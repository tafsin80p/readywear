import mongoose from "mongoose";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export const inventoryService = {
  /**
   * Deduct stock when an order is confirmed / finalized.
   * Decrements both the product total stock and matching attribute value stocks.
   */
  async deductOrderStock(order: any) {
    if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return;
    }

    for (const item of order.items) {
      if (!item.productId) continue;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      try {
        let product = null;
        if (mongoose.Types.ObjectId.isValid(item.productId)) {
          product = await Product.findById(item.productId);
        }
        if (!product) {
          product = await Product.findOne({
            $or: [{ slug: item.productId }, { sku: item.productId }]
          });
        }

        if (!product) {
          console.warn(`[Inventory] Product not found for ID/SKU: ${item.productId}`);
          continue;
        }

        // Deduct root level product stock
        const currentStock = Number(product.stock) || 0;
        product.stock = Math.max(0, currentStock - quantity);
        product.inStock = product.stock > 0;

        // Deduct variant / attribute value stock if applicable
        if (product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0) {
          const itemSize = item.size ? String(item.size).trim().toLowerCase() : null;
          const itemColor = item.color ? String(item.color).trim().toLowerCase() : null;

          product.attributes.forEach((attr: any) => {
            const attrName = attr.name ? String(attr.name).trim().toLowerCase() : "";
            if (Array.isArray(attr.values)) {
              attr.values.forEach((val: any) => {
                const valName = val.value ? String(val.value).trim().toLowerCase() : "";

                let matches = false;
                if (attrName === "size" && itemSize && valName === itemSize) {
                  matches = true;
                } else if (attrName === "color" && itemColor && valName === itemColor) {
                  matches = true;
                } else if (item.attributes && typeof item.attributes === "object") {
                  const plainAttrs = item.attributes instanceof Map 
                    ? Object.fromEntries(item.attributes) 
                    : item.attributes;
                  for (const [k, v] of Object.entries(plainAttrs)) {
                    if (
                      String(k).trim().toLowerCase() === attrName && 
                      String(v).trim().toLowerCase() === valName
                    ) {
                      matches = true;
                      break;
                    }
                  }
                }

                if (matches) {
                  const currentValStock = Number(val.stock) || 0;
                  val.stock = Math.max(0, currentValStock - quantity);
                }
              });
            }
          });
        }

        await product.save();
        console.log(`[Inventory] Deducted ${quantity} from product "${product.name}" (Remaining stock: ${product.stock})`);
      } catch (err) {
        console.error(`[Inventory] Error deducting stock for product ${item.productId}:`, err);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/categories");
    } catch (e) {
      // Revalidation in non-request contexts or development
    }
  },

  /**
   * Restock product quantity when an order is cancelled or marked fake.
   * Increments both the product total stock and matching attribute value stocks.
   */
  async restockOrderStock(order: any) {
    if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return;
    }

    for (const item of order.items) {
      if (!item.productId) continue;
      const quantity = Math.max(1, Number(item.quantity) || 1);

      try {
        let product = null;
        if (mongoose.Types.ObjectId.isValid(item.productId)) {
          product = await Product.findById(item.productId);
        }
        if (!product) {
          product = await Product.findOne({
            $or: [{ slug: item.productId }, { sku: item.productId }]
          });
        }

        if (!product) {
          console.warn(`[Inventory] Product not found for ID/SKU: ${item.productId}`);
          continue;
        }

        // Restock root level product stock
        const currentStock = Number(product.stock) || 0;
        product.stock = currentStock + quantity;
        product.inStock = product.stock > 0;

        // Restock variant / attribute value stock if applicable
        if (product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0) {
          const itemSize = item.size ? String(item.size).trim().toLowerCase() : null;
          const itemColor = item.color ? String(item.color).trim().toLowerCase() : null;

          product.attributes.forEach((attr: any) => {
            const attrName = attr.name ? String(attr.name).trim().toLowerCase() : "";
            if (Array.isArray(attr.values)) {
              attr.values.forEach((val: any) => {
                const valName = val.value ? String(val.value).trim().toLowerCase() : "";

                let matches = false;
                if (attrName === "size" && itemSize && valName === itemSize) {
                  matches = true;
                } else if (attrName === "color" && itemColor && valName === itemColor) {
                  matches = true;
                } else if (item.attributes && typeof item.attributes === "object") {
                  const plainAttrs = item.attributes instanceof Map 
                    ? Object.fromEntries(item.attributes) 
                    : item.attributes;
                  for (const [k, v] of Object.entries(plainAttrs)) {
                    if (
                      String(k).trim().toLowerCase() === attrName && 
                      String(v).trim().toLowerCase() === valName
                    ) {
                      matches = true;
                      break;
                    }
                  }
                }

                if (matches) {
                  const currentValStock = Number(val.stock) || 0;
                  val.stock = currentValStock + quantity;
                }
              });
            }
          });
        }

        await product.save();
        console.log(`[Inventory] Restocked ${quantity} to product "${product.name}" (New stock: ${product.stock})`);
      } catch (err) {
        console.error(`[Inventory] Error restocking product ${item.productId}:`, err);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/categories");
    } catch (e) {
      // Revalidation in non-request contexts or development
    }
  }
};
