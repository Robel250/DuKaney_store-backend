
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../Models/usermodel.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { PORT } from '../config.js';
import authenticate from '../middleware/authenticate.js';
import bodyParser from 'body-parser';
import { sendEmail } from '../Email/approve.js';
import requireAdmin from '../middleware/requireAdmin.js';
dotenv.config();
const router = express.Router();
const app = express();
app.use(bodyParser.json());
const generateToken = (userId, userRole, userEmail ) => {
    const payload = { id: userId, role: userRole, email: userEmail, };
    return jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn: "1h",
    });
};


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    }
});

// Send Verification Email
const sendVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: `"Dukaney-Store" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="https://dukaney-store-backend-1.onrender.com/user/verify?token=${token}">here</a> to verify your email.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};

// Signup Endpoint
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const verificationToken = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '1h' });
        console.log("password b" , password)
        console.log(hashedPassword)

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            verificationToken
        });
   
        console.log("new user",newUser)
        await newUser.save();
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: 'User created successfully. Please verify your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/signin', async (req, res) => {
    
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
            
        }
        console.log('User found:', user.username);
        if (!user.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify your email to login' });
        }
        if (!user.isApproved) {
            return res.status(402).json({ message: 'wait to approve admin' });
        }

       console.log("passwords"+password)
       console.log("user.password"+user.password)
       const isPasswordValid=await bcrypt.compare(password,user.password)
       console.log(isPasswordValid)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id, user.role, user.email);

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// router.post('/signin', async (req, res) => {
//     console.log('Signin endpoint hit');
//     const { username, password } = req.body;

//     const user = await User.findOne({ username });
//     if (!user) {
//         console.log('User not found');
//         return res.status(404).json({ message: 'User not found' });
//     }

//     console.log('User found:', user.username);
//     return res.status(200).json({ message: 'Login successful', user });
// });


router.get('/verify', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ email: decoded.email, verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.isEmailVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/pending-sellers', authenticate,  async (req, res) => {
    try {
        // Only admins can view pending sellers
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const pendingSellers = await User.find({ role: 'seller', isApproved: false });
        res.json(pendingSellers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending sellers' });
    }
});

router.put('/approve/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the requesting user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Find the user by ID and update approval status
        const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send email notification to the seller
        const emailContent = `
            Hi ${user.username},
            Your account has been approved by the admin. You can now access the store management system.
        `;
        await sendEmail(user.email, 'Account Approved', emailContent);

        res.json({ message: 'Seller approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while approving the seller' });
    }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

        await user.save();

        // Send reset email
        const resetUrl = `https://du-kaney-store.vercel.app/user/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: `"Dukaney-Store" <${process.env.EMAIL}>`,
            to: email,
            subject: 'Reset Your Password',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset link sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Change this from GET to POST
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    console.log('Received Token:', token); // Check if the token is received correctly

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            console.log('User not found or token expired');
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash and save new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



router.get('/users', authenticate, async (req, res) => {
    try {
        const currentUserEmail = req.userEmail;
        const users = await User.find({ email: { $ne: currentUserEmail } }, 'username email');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});


router.post('/send-email', authenticate, async (req, res) => {
    const { recipients, subject, message } = req.body;
    const senderEmail = req.userEmail; // Get the sender's email from the token

    try {
        // Find the recipient users in the database
        const users = await User.find({ email: { $in: recipients } }, 'email');

        if (users.length === 0) {
            return res.status(404).json({ message: 'No valid recipients found' });
        }

        // Prepare email options
        const mailOptions = {
            from: `"Dukaney(User)" <${senderEmail}>`, // Set sender email
            to: users.map(user => user.email).join(','),
            subject,
            html: `<p>${message}</p>`,
        };

        // Send the email using nodemailer
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});


// Send Email to a Specific Address
router.post('/contact', authenticate, async (req, res) => {
    const { subject, message } = req.body;
    const senderEmail = req.userEmail; // Get the sender's email from the authenticated user

    if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required' });
    }

    const mailOptions = {
        from: `"DuKaney-store" <${process.env.EMAIL}>`,
        to: 'hanibiniam25@gmail.com', // Your email address as the receiver
        subject: subject,
        html: `<p>Message from: ${senderEmail}</p><p>${message}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});









app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ role: user.role }); // Send user role (admin/seller)
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  









export default router;
