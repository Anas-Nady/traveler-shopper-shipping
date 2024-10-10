import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config({ path: "./../.env" });

const EMAIL_SERVICE = process.env.EMAIL_SERVICE as string; // we use google email.
const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD as string;

console.log(EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD);
export const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error(`Transporter error: ${error}`);
  } else {
    console.log("Transporter is ready to send emails");
  }
});

interface IEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: IEmailOptions) => {
  const mailOptions = {
    from: `"No Reply" <${EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
