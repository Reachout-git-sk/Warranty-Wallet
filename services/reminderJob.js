const cron = require("node-cron");
const nodemailer = require("nodemailer");
const connectDB = require("../db/connect");

// Email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Send email function
async function sendWarrantyEmail(toEmail, expiredDocs, soonDocs) {
  const expiredList = expiredDocs
    .map((d) => `<li><strong>${d.productName}</strong> (${d.brand}) — Expired</li>`)
    .join("");

  const soonList = soonDocs
    .map((d) => `<li><strong>${d.productName}</strong> (${d.brand}) — ${d.daysLeft} days left</li>`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
      <h2 style="color: #6c63ff;">🛡️ WarrantyWallet — Warranty Alert</h2>
      ${expiredDocs.length > 0 ? `
        <div style="background: #ffe0e0; border-left: 4px solid #e74c3c; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #e74c3c; margin: 0 0 10px 0;">❌ Expired Warranties</h3>
          <ul style="margin: 0; padding-left: 20px;">${expiredList}</ul>
        </div>
      ` : ""}
      ${soonDocs.length > 0 ? `
        <div style="background: #fff8e0; border-left: 4px solid #f39c12; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #f39c12; margin: 0 0 10px 0;">⚠️ Expiring Within 30 Days</h3>
          <ul style="margin: 0; padding-left: 20px;">${soonList}</ul>
        </div>
      ` : ""}
      <p style="color: #666; font-size: 0.85rem;">
        Visit <a href="http://localhost:3000" style="color: #6c63ff;">WarrantyWallet</a> to manage your warranties.
      </p>
    </div>
  `;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"WarrantyWallet" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🛡️ WarrantyWallet — Warranty Status Alert",
    html,
  });

  console.log(`Reminder email sent to ${toEmail}`);
}

// Main check function
async function checkWarranties() {
  try {
    const db = await connectDB();
    const today = new Date();

    const docs = await db.collection("support_docs").find().toArray();
    const settings = await db
      .collection("settings")
      .findOne({ key: "notificationEmail" });

    if (!settings || !settings.value) {
      console.log("No notification email set — skipping reminder job");
      return;
    }

    const toEmail = settings.value;

    const expiredDocs = docs.filter((d) => new Date(d.warrantyExpiry) <= today);
    const soonDocs = docs.filter((d) => {
      const daysLeft = Math.ceil(
        (new Date(d.warrantyExpiry) - today) / (1000 * 60 * 60 * 24)
      );
      return daysLeft > 0 && daysLeft <= 30;
    });

    if (expiredDocs.length === 0 && soonDocs.length === 0) {
      console.log("No warranty alerts today");
      return;
    }

    await sendWarrantyEmail(toEmail, expiredDocs, soonDocs);
  } catch (err) {
    console.error("Reminder job error:", err.message);
  }
}

// Start cron job — runs every day at 9:00 AM
function startReminderJob() {
  console.log("Warranty reminder job scheduled — runs daily at 9:00 AM");
  cron.schedule("0 9 * * *", () => {
    console.log("Running warranty reminder check...");
    checkWarranties();
  });
}

// EXPORTS — must be at bottom
module.exports = { startReminderJob, checkWarranties };