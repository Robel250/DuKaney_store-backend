// Middleware to require admin authorization
const requireAdmin = (req, res, next) => {
    // Check if the user's role is admin
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: "Admin credentials are required" });
    }
    // If the user is an admin, proceed to the next middleware or route handler
    next();
};

export default requireAdmin;
