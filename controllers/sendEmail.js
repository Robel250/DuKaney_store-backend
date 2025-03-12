import nodemailer from 'nodemailer';
import { User } from '../Models/usermodel.js';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { sender, userIds, content } = req.body;

  try {
    // Fetch selected users' emails from the database
    const users = await User.find({ _id: { $in: userIds } });
    const recipientEmails = users.map(user => user.email);

    // Configure the email transporter (use environment variables for sensitive info)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email sending options
    const mailOptions = {
      from: sender,
      to: recipientEmails.join(','),
      subject: 'Message from Store Management System',
      text: content,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
}
