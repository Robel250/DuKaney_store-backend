

// Email Sending Code
import nodemailer from 'nodemailer';
import { Sales } from '../Models/salesModel.js';
import { User } from '../Models/usermodel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// Function to fetch daily sales
const getDailySales = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await Sales.find({
        soldAt: { $gte: startOfDay, $lt: endOfDay },
    }).populate('itemId userId');
};

// Function to get all verified user emails
const getUserEmails = async () => {
    return await User.find({ isEmailVerified: true }, 'email');
};

// Function to send the email
const sendDailyReport = async () => {
    try {
        const salesData = await getDailySales();
        const userEmails = await getUserEmails();

        if (salesData.length === 0 || userEmails.length === 0) {
            console.log('No sales data or no verified emails found.');
            return;
        }

        let report = `<h2>Daily Sales Report</h2>
        <table class='table table-striped text-center'>
        <thead>
        <tr>
            <th class='border'>No</th>
            <th class='border'>Item</th>
            <th class='border'>Quantity</th>
            <th class='border'>Total Price</th>
            <th class='border'>Sold At</th>
        </tr>
        </thead>
        <tbody>`;

        salesData.forEach((sale, index) => {
            report += `<tr>
                <td class='border'>${index + 1}</td>
                <td class='border'>${sale.itemId.name}</td>
                <td class='border'>${sale.quantitySold}</td>
                <td class='border'>$${sale.totalPrice.toFixed(2)}</td>
                <td class='border'>${new Date(sale.soldAt).toLocaleString()}</td>
            </tr>`;
        });

        report += `</tbody></table>`;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            secure: false,
            tls: {
                rejectUnauthorized: false,
            },
        });

        for (const user of userEmails) {
            let mailOptions = {
                from: `"Dukaney-Store" <${process.env.EMAIL}>`,
                to: user.email,
                subject: 'Daily Sales Report',
                html: report,
            };
            await transporter.sendMail(mailOptions);
        }

        console.log('✅ Daily sales report sent!');
    } catch (error) {
        console.error('❌ Error sending daily report:', error);
    }
};

// Schedule to run at 11:59 PM every day
import cron from 'node-cron';
// cron.schedule('*/1 * * * *', async () => {
//     console.log('Running test email job...');
//     await sendDailyReport();
// });
 cron.schedule("59 23 * * *", () => {
        console.log("⏳ Running daily report email job...");
        sendDailyReport();
    });
export { sendDailyReport };
