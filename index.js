


import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
import bookRouter from "./routes/booksRoutes.js";
import userRouter from "./routes/UserRoot.js";
import salesRoutes from "./routes/salesRoute.js"
import cron from "node-cron";
import chatRouter from "./routes/chatRouter.js"
import bodyParser from 'body-parser';
import sendEmailHandler from './controllers/sendEmail.js';  // Assuming the file is 'sendEmail.js'
 // Adjust the path if necessary
import { sendDailyReport } from "./Email/sendDailyReport.js";
import { User } from './Models/usermodel.js';
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4444;
const mongoDBURL = process.env.MONGO_URI;
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use("/sales", salesRoutes);
app.use('/chat', chatRouter);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to MERN stack Tutorial" });
});


app.use("/items", bookRouter);
app.use("/user", userRouter);




app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

// mongoose
//     .connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log("Connected to the database");
//         app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//     })
//     .catch((error) => console.error("Database connection error:", error));

mongoose.connect(mongoDBURL)
  .then(() => {
    console.log("Connected to the database");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
)



  .catch(err => console.error("Database connection error:", err));
  