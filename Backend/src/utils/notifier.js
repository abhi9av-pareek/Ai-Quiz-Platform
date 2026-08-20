import nodemailer from "nodemailer";

/**
 * Creates Nodemailer Transporter for Gmail/SMTP
 */
const getTransporter = () => {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send Gmail / Email Notification when feedback is submitted
 */
export const sendEmailNotification = async (feedbackData) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  
  if (!adminEmail) {
    console.log("[Notifier] ADMIN_EMAIL or GMAIL_USER not configured. Skipping email notification.");
    return { success: false, reason: "Email credentials not configured" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.log("[Notifier] Nodemailer credentials missing in .env. Skipping email notification.");
    return { success: false, reason: "Nodemailer credentials missing" };
  }

  const starRating = "⭐".repeat(feedbackData.rating || 5);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #7C5CFC, #00E5C0); padding: 16px 20px; border-radius: 8px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 20px;">💡 New Feedback Received - Gyantra</h2>
      </div>

      <div style="padding: 20px 0; color: #333333;">
        <p style="font-size: 16px; margin-bottom: 15px;">You have received a new user feedback submission on <strong>Gyantra</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold; width: 30%;">Category:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;"><span style="background-color: #f0eff8; padding: 4px 10px; border-radius: 12px; font-weight: 600; color: #7C5CFC;">${feedbackData.category}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Rating:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-size: 16px;">${starRating} (${feedbackData.rating}/5)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Submitted By:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${feedbackData.name} &lt;${feedbackData.email}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Context:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${feedbackData.context || "General"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Submitted At:</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <div style="background-color: #f9f9fc; border-left: 4px solid #7C5CFC; padding: 15px; border-radius: 4px; margin-top: 10px;">
          <h4 style="margin: 0 0 8px 0; color: #555;">Feedback Message:</h4>
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #222; line-height: 1.5;">${feedbackData.message}</p>
        </div>
      </div>

      <div style="border-top: 1px solid #eeeeee; padding-top: 15px; text-align: center; font-size: 12px; color: #888888;">
        Sent automatically by Gyantra Feedback System
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Gyantra Feedback" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `[Gyantra Feedback] ${feedbackData.category} from ${feedbackData.name} (${feedbackData.rating}/5 Stars)`,
      html: htmlContent,
    });
    console.log("[Notifier] Email notification sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Notifier] Error sending email notification:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Format and send WhatsApp notification (via CallMeBot API or construct wa.me URL)
 */
export const sendWhatsAppNotification = async (feedbackData) => {
  const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER; // Format: country code + number, e.g. 919876543210
  const apiKey = process.env.CALLMEBOT_API_KEY;

  const starRating = "⭐".repeat(feedbackData.rating || 5);
  const messageText = 
    `*💡 New Gyantra Feedback Notification*\n\n` +
    `*Category:* ${feedbackData.category}\n` +
    `*Rating:* ${starRating} (${feedbackData.rating}/5)\n` +
    `*From:* ${feedbackData.name} (${feedbackData.email})\n` +
    `*Context:* ${feedbackData.context || "General"}\n\n` +
    `*Message:*\n"${feedbackData.message}"\n\n` +
    `_Sent via Gyantra Feedback System_`;

  const encodedText = encodeURIComponent(messageText);

  // Generate direct wa.me link for immediate client fallback or admin direct click
  const whatsappUrl = adminWhatsApp 
    ? `https://wa.me/${adminWhatsApp.replace(/[^0-9]/g, "")}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  // Call API server-side if CallMeBot key is configured
  if (adminWhatsApp && apiKey) {
    try {
      const cleanPhone = adminWhatsApp.replace(/[^0-9]/g, "");
      const callMeBotApiUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${apiKey}`;
      
      const response = await fetch(callMeBotApiUrl);
      if (response.ok) {
        console.log("[Notifier] WhatsApp notification sent via CallMeBot API successfully.");
      } else {
        console.warn("[Notifier] CallMeBot API responded with status:", response.status);
      }
    } catch (err) {
      console.error("[Notifier] Error calling CallMeBot API:", err.message);
    }
  } else {
    console.log("[Notifier] CallMeBot API credentials not set in .env. Formatted wa.me URL generated for client redirection.");
  }

  return { whatsappUrl };
};
