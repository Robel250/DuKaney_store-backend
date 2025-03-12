import cron from "node-cron";
import { sendDailyReport } from "./utils/sendDailyReport.js";

// Schedule the report every day at 8 PM
cron.schedule("0 20 * * *", async () => {
    console.log("Running daily sales report job...");
    await sendDailyReport();
});
