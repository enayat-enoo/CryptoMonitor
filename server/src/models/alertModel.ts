import { Schema, model } from "mongoose";

interface IAlert {
  coinID: string;
  currency: string;
  targetPrice: number;
  condition: "above" | "below"; 
  triggered: boolean; 
}

const alertSchema = new Schema<IAlert>(
  {
    coinID: { type: String, required: true },
    currency: { type: String, default: "usd" },
    targetPrice: { type: Number, required: true },
    condition: { type: String, enum: ["above", "below"], required: true },
    triggered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for evaluateAlerts query performance
alertSchema.index({ triggered: 1 });
alertSchema.index({ coinID: 1 });

export default model<IAlert>("Alert", alertSchema);
