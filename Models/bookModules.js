// import mongoose from "mongoose";

// const bookSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: true,
//         },
//         quantity: {
//             type: Number,
//             required: true,
//         }, price:{
//             type:Number,
//             required:true,
//         },
//         totalItem: { 
//             type: Number, 
//              required: false
//              },
//         expiryDate: {
//             type: Date,
//             required: true,
//         },
       
//         image: {
//             type: String,
//             required: false,
//         },
//         userId: {
//             type: mongoose.Types.ObjectId,
//             ref: "user",
//             required: true, 
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// export const storeItem = mongoose.model("my store Item", bookSchema);
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        totalItem: {
            type: Number,
            required: false,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        image: {
            type: String,
            required: false,
        },
        barcode: {
            type: String, // Field to store barcode
            required: true,
            unique: true, // Ensures barcode is unique
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "user",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Register model with name "my store Item"
export const storeItem = mongoose.model("my store Item", bookSchema);


