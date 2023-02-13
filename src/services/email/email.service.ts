import sgMail from "@sendgrid/mail";
import logger from "../logger";

const apiKey = process.env.SENDGRID_API_KEY || "SENDGRID_API_KEY";
const apiEmail = process.env.SENDGRID_EMAIL || "SENDGRID_EMAIL";

sgMail.setApiKey(apiKey);

export async function sendTextEmail(
  email: string,
  subject: string,
  description: string
) {
  try {
    await sgMail.send({
      to: email,
      from: apiEmail,
      subject: subject,
      text: description,
    });
  } catch (error) {
    logger.error(error);
    throw new Error("Error sending text email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const subject = "Password Reset";
  const description = "Click this link below to reset your password. \n";
  const passwordResetLink =
    process.env.FRONTEND_URL + `/reset-password/?token=${token}`;

  try {
    await sgMail.send({
      to: email,
      from: apiEmail,
      subject: subject,
      text: description + passwordResetLink,
    });
  } catch (error) {
    throw new Error("Error sending text email");
  }
}
