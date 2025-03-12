// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { User } from "../Models/usermodel.js"; // Assuming the User model is in this path

// dotenv.config();
// export const requireAdminAuthorization = async (req, res, next) => {
//     try {
//         const { adminName, adminPassword } = req.body;

//         // Ensure admin credentials are provided
//         if (!adminName || !adminPassword) {
//             return res.status(400).json({ message: "Admin credentials are required" });
//         }

//         // Find the admin user by username and role
//         const admin = await User.findOne({ username: adminName, role: 'admin' });

//         // Check if the admin exists
//         if (!admin) {
//             return res.status(401).json({ message: "Invalid admin credentials" });
//         }

//         // Compare the provided password with the hashed password in the database
//         const isPasswordValid = await admin.comparePassword(adminPassword);

//         if (!isPasswordValid) {
//             return res.status(401).json({ message: "Invalid admin credentials" });
//         }

//         // Proceed if admin credentials are valid
//         next();
//     } catch (error) {
//         console.error("Admin authorization error:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };