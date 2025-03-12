
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// const authenticate = (req, res, next) => {
//     try {
//         const token = req.headers.authorization.split(' ')[1];
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         req.userId = decoded.id;
//         req.userRole = decoded.role;
//         req.userEmail = decoded.email; // Attach the email to the request object

//         console.log("User ID:", req.userId);
//         console.log("User Role:", req.userRole);
//         console.log("User Email:", req.userEmail); // Debugging

//         next();
//     } catch (error) {
//         res.status(401).send({ message: 'Unauthorized' });
//     }
// };
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Access denied, no token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userEmail = decoded.email; 
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// requireAdmin.js
// const requireAdmin = (req, res, next) => {
//     if (req.user.role !== 'admin') {
//         return res.status(403).json({ message: 'Access denied, admin rights required.' });
//     }
//     next();
// };


export default authenticate;
// const authenticate = (req, res, next) => {
//     try {
//         const token = req.headers.authorization.split(' ')[1];
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);

//         req.userId = decoded.id;
//         req.userRole = decoded.role;
//         req.userEmail = decoded.email;

//         // if (req.userRole === 'seller' && !decoded.isApproved) {
//         //     return res.status(403).json({ message: 'Access pending admin approval' });
//         // }

//         next();
//     } catch (error) {
//         res.status(401).json({ message: 'Unauthorized' });
//     }
// };

// export default authenticate;
