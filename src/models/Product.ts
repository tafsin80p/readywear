import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  images: string[];
  inStock: boolean;
  stock: number;
  rating: number;
  reviews: number;
  specifications: { label: string; value: string }[];
  attributes: { name: string; values: { value: string; meta: string; stock: number }[] }[];
  status: 'published' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    discount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    specifications: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    attributes: [
      {
        name: { type: String, required: true },
        values: [
          {
            value: { type: String, required: true },
            meta: { type: String, default: "" },
            stock: { type: Number, required: true, min: 0 },
          }
        ],
      },
    ],
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
  },
  { timestamps: true }
);

// Indexes for optimized querying
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ category: 1, createdAt: -1 });

// Pre-save hook to calculate discount percentage
ProductSchema.pre("save", function () {
  if (this.oldPrice && this.price < this.oldPrice) {
    this.discount = Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  } else {
    this.discount = 0;
  }
  
  if (this.stock <= 0) {
    this.inStock = false;
  } else {
    this.inStock = true;
  }
});

// Delete cached model to force schema update in development
if (mongoose.models.Product) {
  // @ts-ignore
  delete mongoose.models.Product;
}
if (mongoose.connection && mongoose.connection.models && mongoose.connection.models.Product) {
  // @ts-ignore
    delete mongoose.connection.models.Product;
}

const Product: Model<IProduct> = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
