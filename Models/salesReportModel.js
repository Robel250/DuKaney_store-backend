// import mongoose from "mongoose";

// const salesReportSchema = new mongoose.Schema(
//     {
//         userId: {
//             type: mongoose.Types.ObjectId,
//             ref: "user",
//             required: true,
//         },
//         date: {
//             type: Date,
//             required: true,
//         },
//         totalEarnings: {
//             type: Number,
//             required: true,
//         },
//         sales: [
//             {
//                 itemId: {
//                     type: mongoose.Types.ObjectId,
//                     ref: "my store Item",
//                     required: true,
//                 },
//                 quantitySold: {
//                     type: Number,
//                     required: true,
//                 },
//                 totalPrice: {
//                     type: Number,
//                     required: true,
//                 },
//                 soldAt: {
//                     type: Date,
//                     required: true,
//                 },
//             },
//         ],
//     },
//     { timestamps: true }
// );

// export const SalesReport = mongoose.model("SalesReport", salesReportSchema);
