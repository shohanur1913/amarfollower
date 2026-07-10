import tls from "tls";
import net from "net";

const HOST = "mail.spacemail.com";
const PORT = 465;
const USER = "noreply@serverfest.com";
const PASS = "5X92-2l9X5";
const TO = "shohanur1913@gmail.com";

let step = 0;
let data = "";

function send(socket, line) {
  console.log(`C: ${line}`);
  socket.write(line + "\r\n");
}

const socket = tls.connect(PORT, HOST, { rejectUnauthorized: false }, () => {
  socket.on("data", (chunk) => {
    data += chunk.toString();
    const lines = data.split("\r\n");
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      console.log(`S: ${line}`);
      if (line.startsWith("220 ") && step === 0) {
        step = 1;
        send(socket, `EHLO amar-follower.local`);
      } else if (line.startsWith("250 ") || line.startsWith("250-")) {
        if (step === 1) {
          step = 2;
          send(socket, `AUTH LOGIN`);
        } else if (step === 5) {
          step = 6;
          send(socket, `DATA`);
        } else if (step === 8) {
          console.log("EMAIL ACCEPTED. Check inbox.");
          send(socket, `QUIT`);
          setTimeout(() => socket.end(), 500);
        }
      } else if (line === "334 VXNlcm5hbWU6") {
        step = 3;
        send(socket, Buffer.from(USER).toString("base64"));
      } else if (line === "334 UGFzc3dvcmQ6") {
        step = 4;
        send(socket, Buffer.from(PASS).toString("base64"));
      } else if (line.startsWith("235 ")) {
        step = 5;
        send(socket, `MAIL FROM:<${USER}>`);
      } else if (line.startsWith("250 ") && step === 2) {
        // after MAIL FROM accepted
        step = 5.1;
        send(socket, `RCPT TO:<${TO}>`);
      } else if (line.startsWith("250 ") && step === 5.1) {
        step = 5;
        send(socket, `MAIL FROM:<${USER}>`);
      } else if (line.startsWith("354 ")) {
        step = 7;
        const msg = [
          `From: "${USER}" <${USER}>`,
          `To: ${TO}`,
          `Subject: Test from SMTP manual`,
          `Date: ${new Date().toUTCString()}`,
          ``,
          `This is a test email sent manually via SMTP.`,
          `.`,
        ].join("\r\n");
        send(socket, msg);
      }
    }
  });
});

socket.on("error", (e) => console.error("ERR:", e.message));
setTimeout(() => {
  console.log("TIMEOUT. Full data received:");
  console.log(data);
  socket.end();
  process.exit(0);
}, 15000);
