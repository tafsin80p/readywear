import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug if not provided, though we expect it to be provided
CategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w\u0980-\u09FF-]+/g, '');
  }
  next();
});

// Delete cached model to force schema update in development
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}
if (mongoose.connection && mongoose.connection.models && mongoose.connection.models.Category) {
  delete mongoose.connection.models.Category;
}

const Category: Model<ICategory> = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
