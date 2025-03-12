import { sendDailyReport } from "./sendDailyReport";

const testEmail = async () => {
    console.log("Testing daily report email...");
    await sendDailyReport();
};

testEmail();
