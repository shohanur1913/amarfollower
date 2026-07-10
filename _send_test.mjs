import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "mail.spacemail.com",
  port: 465,
  secure: true,
  auth: { user: "noreply@serverfest.com", pass: "5X92-2l9X5" },
  tls: { rejectUnauthorized: false },
  debug: true,
});

try {
  const info = await transporter.sendMail({
    from: '"Test" <noreply@serverfest.com>',
    to: "shohanur1913@gmail.com",
    subject: "Test from nodemailer direct",
    text: "Hello, this is a test.",
  });
  console.log("OK:", JSON.stringify(info, null, 2));
} catch (e) {
  console.error("ERR:", e.message);
} finally {
  transporter.close();
}
