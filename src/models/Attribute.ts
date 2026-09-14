import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttribute extends Document {
  name: string;
  type: "text" | "color";
  values: {
    name: string;
    meta: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AttributeSchema: Schema<IAttribute> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ["text", "color"], default: "text" },
    values: [
      {
        name: { type: String, required: true },
        meta: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

// Delete cached model to force schema update in development
if (mongoose.models.Attribute) {
  delete mongoose.models.Attribute;
}
if (mongoose.connection && mongoose.connection.models && mongoose.connection.models.Attribute) {
  delete mongoose.connection.models.Attribute;
}

const Attribute: Model<IAttribute> = mongoose.model<IAttribute>("Attribute", AttributeSchema);

export default Attribute;
