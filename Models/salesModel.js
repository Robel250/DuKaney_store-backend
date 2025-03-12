import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Types.ObjectId,
            ref: "my store Item",
            required: true,
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "user",
            required: true,
        },
        quantitySold: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        soldAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Sales = mongoose.model("Sales", salesSchema);
