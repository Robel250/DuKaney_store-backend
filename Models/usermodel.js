// import mongoose, { Types } from 'mongoose'

// const UserSchema =mongoose.Schema(
//     {
//         username:{
//             types:String,
//             required:true,
//             unique:true
//         },
//         email:{
//             types:String,
//             required:true,
//             unique:true
//         },
//         password:{
//             types:String,
//             required:true,
            
//         },
       
//     },
//     {
//         timestamps:tru
//     }
// );
// export const User = mongoose.model('user',UserSchema)



import mongoose from 'mongoose';

const UserSchema = mongoose.Schema(
    {
        username: {
            type: String, 
            required: true,
            unique: true,
        },
        email: {
            type: String, 
            required: true,
            unique: true,
        },
        password: {
            type: String, 
            required: true,
        },
        isEmailVerified: { type: Boolean, default: false },
        verificationToken: { type: String }

    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model('user', UserSchema);
