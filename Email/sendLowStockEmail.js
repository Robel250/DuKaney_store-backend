import nodemailer from 'nodemailer';
import { User } from "../Models/usermodel.js"; // Ensure User model is imported

// Function to send the low stock email directly
const sendLowStockEmail = async (item) => {
    try {
        // Find the user associated with the item using the userId
        const user = await User.findById(item.userId);  // Ensure 'userId' exists in the item
        if (user && user.email) {
            // Set up the email transporter
            const transporter = nodemailer.createTransport({
                service: 'Gmail', // or another email service
                auth: {
                    user: process.env.EMAIL, // Add this to your .env file
                    pass: process.env.EMAIL_PASSWORD, // Add this to your .env file
                },
                tls: {
                    rejectUnauthorized: false, // Allows self-signed certificates
                }
            });

            const mailOptions = {
                from: `"Dukaney-Store" <${process.env.EMAIL}>`,
                to: user.email,
                subject: 'Low Stock Notification',
                html: `<p> The item "${item.name}" has a low stock quantity of ${item.quantity}. Please restock soon.</p>`,
            };

            // Send the email
            await transporter.sendMail(mailOptions);
            console.log('Low stock email sent successfully');
        } else {
            console.log("User not found or email missing.");
        }
    } catch (error) {
        console.error("Error in fetching user or sending email:", error);
    }
};

export { sendLowStockEmail };
