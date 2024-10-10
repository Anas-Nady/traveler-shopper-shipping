import { emailVerificationTemplate } from "../templates/emailVerification";
import { IUser } from "../types/types";
import { sendEmail } from "../utils/email";

export const sendVerificationEmail = async (user: IUser): Promise<void> => {
  const code = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  const mailOptions = {
    to: user.email,
    subject: "Verification email",
    html: emailVerificationTemplate(user.name, code),
  };

  await sendEmail(mailOptions);
};
