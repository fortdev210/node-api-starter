import * as sgMail from "@sendgrid/mail";
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
  } catch (error) {}
}
