/**
 * ==============================================================================
 * PRAETORIAN TECHNOLOGY — SERVERLESS / API INQUIRY HANDLER
 * Vercel Serverless Function & Express Route Handler
 * STRATEGY • DATA • INTELLIGENCE • IMPACT
 * ==============================================================================
 */

const nodemailer = require('nodemailer');

// Helper for sanitizing text inputs
function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim();
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function sendResponse(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

/**
 * Core handler to process project inquiries and dispatch emails via SMTP
 */
async function handleProjectInquiry(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || 'unknown';
  console.log(`\n[Project Inquiry] Request received from ${clientIp}`);

  // Only allow POST
  if (req.method !== 'POST') {
    return sendResponse(res, 405, {
      success: false,
      message: 'Method Not Allowed. Use POST.'
    });
  }

  try {
    let body = req.body;
    if (!body && req.on) {
      try {
        body = await new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
          });
        });
      } catch (e) {
        body = {};
      }
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    // 1. Honeypot check for bots
    const honeypot = body.website_hp;
    if (honeypot && honeypot.trim().length > 0) {
      console.warn('[Project Inquiry] Honeypot triggered by bot submission. Ignoring silently.');
      return sendResponse(res, 200, { success: true, message: 'Inquiry received.' });
    }

    // 2. Extract and sanitize fields (supporting both frontend naming conventions)
    const name = sanitizeText(body.name);
    const company = sanitizeText(body.company) || 'Not Specified';
    const email = sanitizeText(body.email);
    const phone = sanitizeText(body.phone);
    const projectType = sanitizeText(body.projectType) || 'Web Design & Development';
    const budget = sanitizeText(body.budget) || 'Custom Quotation';
    const description = sanitizeText(body.projectDescription || body.description) || 'None provided';
    const requirements = sanitizeText(body.detailedRequirements || body.message);

    // Optional surprise experience fields
    const surpriseType = sanitizeText(body.surpriseType);
    const surpriseDate = sanitizeText(body.surpriseDate || body.targetDate);
    const recipientName = sanitizeText(body.recipientName);
    const specialRequirements = sanitizeText(body.specialRequirements);

    // 3. Server-side validation
    if (!name || name.length < 2) {
      console.log('[Project Inquiry] Validation failed: Missing or invalid name.');
      return res.status(400).json({
        success: false,
        message: 'Please enter your name.'
      });
    }

    if (!email || !isValidEmail(email)) {
      console.log('[Project Inquiry] Validation failed: Missing or invalid email.');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!phone || !isValidPhone(phone)) {
      console.log('[Project Inquiry] Validation failed: Missing or invalid phone number.');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.'
      });
    }

    if (!requirements || requirements.length < 5) {
      console.log('[Project Inquiry] Validation failed: Missing or short detailed requirements.');
      return res.status(400).json({
        success: false,
        message: 'Please describe your project requirements.'
      });
    }

    console.log(`[Project Inquiry] Validation passed for ${name} (${email})`);

    // 4. Check SMTP environment variables
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = process.env.SMTP_SECURE !== 'false';
    const user = process.env.SMTP_USER || process.env.EMAIL_USER || 'teenideas.in@gmail.com';
    const pass = (process.env.SMTP_PASSWORD || process.env.EMAIL_APP_PASSWORD || '').trim();
    const emailTo = process.env.EMAIL_TO || 'teenideas.in@gmail.com';

    if (!pass || pass === 'YOUR_16_CHAR_GOOGLE_APP_PASSWORD' || pass === 'YOUR_SECURE_GMAIL_APP_PASSWORD') {
      console.error('[Project Inquiry] Email failed: SMTP_PASSWORD is not configured in server environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Unable to send inquiry. Server email configuration is missing or incomplete.'
      });
    }

    // 5. Initialize Nodemailer Transporter
    console.log(`[Project Inquiry] Initializing SMTP connection to ${host}:${port} as ${user}...`);
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    // 6. Build Text and HTML Email Bodies
    let surpriseSectionText = '';
    let surpriseSectionHtml = '';

    if (surpriseType || recipientName || surpriseDate || specialRequirements) {
      surpriseSectionText = `\nSurprise Experience Details:\n- Occasion / Type: ${surpriseType || 'N/A'}\n- Recipient Name: ${recipientName || 'N/A'}\n- Surprise Date: ${surpriseDate || 'N/A'}\n- Special Requirements: ${specialRequirements || 'N/A'}\n`;
      surpriseSectionHtml = `
        <tr>
          <td colspan="2" style="background:#FAF8F4; font-weight:bold; color:#886524; padding:8px 6px; font-size:12px; letter-spacing:0.08em; text-transform:uppercase;">Surprise Experience Details</td>
        </tr>
        ${surpriseType ? `<tr><td class="data-label">Occasion / Type</td><td class="data-value"><strong>${surpriseType}</strong></td></tr>` : ''}
        ${recipientName ? `<tr><td class="data-label">Recipient Name</td><td class="data-value"><strong>${recipientName}</strong></td></tr>` : ''}
        ${surpriseDate ? `<tr><td class="data-label">Surprise Date</td><td class="data-value">${surpriseDate}</td></tr>` : ''}
        ${specialRequirements ? `<tr><td class="data-label">Special Specs</td><td class="data-value">${specialRequirements}</td></tr>` : ''}
      `;
    }

    const emailSubject = surpriseType 
      ? `New Surprise Experience Inquiry (${surpriseType}) — Praetorian Technology`
      : `New Project Inquiry — Praetorian Technology`;

    const textNotification = `PRAETORIAN TECHNOLOGY

NEW PROJECT INQUIRY

--------------------------------

Customer Name:
${name}

Company / Organization:
${company}

Email:
${email}

Phone:
${phone}

Project Type:
${projectType}
${surpriseSectionText}
Estimated Budget:
${budget}

Project Description:
${description}

Detailed Requirements:
${requirements}

Submitted At:
${timestamp}

--------------------------------

Praetorian Technology
Strategy • Data • Intelligence • Impact

Phone:
+91 94436 47190
+91 86088 50397

Email:
teenideas.in@gmail.com`;

    const htmlNotification = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F4; margin: 0; padding: 24px; color: #141618; }
    .email-container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #C5A059; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    .email-header { background: #151719; padding: 28px; text-align: center; border-bottom: 2px solid #C5A059; }
    .email-header h1 { color: #FFFFFF; font-size: 20px; letter-spacing: 0.12em; margin: 0 0 6px 0; text-transform: uppercase; }
    .email-header p { color: #C5A059; font-size: 11px; letter-spacing: 0.18em; margin: 0; text-transform: uppercase; font-weight: bold; }
    .email-body { padding: 32px 28px; }
    .section-title { font-size: 13px; font-weight: 700; color: #886524; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ECE5D8; padding-bottom: 8px; margin-bottom: 20px; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .data-table td { padding: 10px 6px; font-size: 14px; vertical-align: top; border-bottom: 1px solid #F4EFE6; }
    .data-label { width: 38%; font-weight: 700; color: #585C63; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .data-value { width: 62%; color: #141618; font-weight: 500; }
    .message-box { background: #FAF8F4; border-left: 3px solid #C5A059; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #141618; white-space: pre-wrap; margin-bottom: 24px; }
    .email-footer { background: #151719; padding: 22px; text-align: center; color: #8C9098; font-size: 12px; line-height: 1.6; }
    .email-footer strong { color: #F8F6F0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>PRAETORIAN TECHNOLOGY</h1>
      <p>STRATEGY • DATA • INTELLIGENCE • IMPACT</p>
    </div>
    <div class="email-body">
      <div class="section-title">NEW INQUIRY: ${projectType}</div>
      <table class="data-table">
        <tr>
          <td class="data-label">Customer Name</td>
          <td class="data-value"><strong>${name}</strong></td>
        </tr>
        <tr>
          <td class="data-label">Company / Organization</td>
          <td class="data-value">${company}</td>
        </tr>
        <tr>
          <td class="data-label">Email Address</td>
          <td class="data-value"><a href="mailto:${email}" style="color:#886524; text-decoration:none;">${email}</a></td>
        </tr>
        <tr>
          <td class="data-label">Phone Number</td>
          <td class="data-value"><a href="tel:${phone}" style="color:#886524; text-decoration:none;">${phone}</a></td>
        </tr>
        <tr>
          <td class="data-label">Project Type</td>
          <td class="data-value"><span style="background:rgba(197,160,89,0.15); color:#886524; padding:3px 8px; border-radius:4px; font-weight:700; font-size:12px;">${projectType}</span></td>
        </tr>
        ${surpriseSectionHtml}
        <tr>
          <td class="data-label">Estimated Budget</td>
          <td class="data-value">${budget}</td>
        </tr>
        <tr>
          <td class="data-label">Project Description</td>
          <td class="data-value">${description}</td>
        </tr>
        <tr>
          <td class="data-label">Submitted At</td>
          <td class="data-value">${timestamp}</td>
        </tr>
      </table>

      <div class="section-title">Detailed Requirements</div>
      <div class="message-box">${requirements}</div>
    </div>
    <div class="email-footer">
      <strong>Praetorian Technology</strong> — Official Client Notification System<br>
      Strategy • Data • Intelligence • Impact<br>
      Phone: +91 94436 47190 | +91 86088 50397<br>
      Email: teenideas.in@gmail.com
    </div>
  </div>
</body>
</html>`;

    // 7. Send the email and wait for SMTP acceptance
    console.log(`[Project Inquiry] Sending email to ${emailTo}...`);
    const info = await transporter.sendMail({
      from: `"Praetorian Technology" <${user}>`,
      to: emailTo,
      replyTo: `"${name}" <${email}>`,
      subject: emailSubject,
      text: textNotification,
      html: htmlNotification
    });

    console.log(`[Project Inquiry] Email accepted! Message ID: ${info.messageId}`);

    // 8. Optionally send customer acknowledgement email (after company email is accepted)
    if (process.env.SEND_ACKNOWLEDGEMENT !== 'false') {
      try {
        const textAck = `Hello ${name},

Thank you for contacting Praetorian Technology.

We have received your project inquiry and will review the requirements.

Our team will contact you using the details provided in your enquiry.

Regards,
Praetorian Technology

Strategy • Data • Intelligence • Impact

Contact:
+91 94436 47190
+91 86088 50397
teenideas.in@gmail.com`;

        const htmlAck = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F4; margin: 0; padding: 24px; color: #141618; }
    .email-container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #C5A059; border-radius: 12px; overflow: hidden; }
    .email-header { background: #151719; padding: 26px; text-align: center; border-bottom: 2px solid #C5A059; }
    .email-header h1 { color: #FFFFFF; font-size: 19px; letter-spacing: 0.1em; margin: 0 0 4px 0; text-transform: uppercase; }
    .email-header p { color: #C5A059; font-size: 11px; letter-spacing: 0.16em; margin: 0; text-transform: uppercase; }
    .email-body { padding: 32px 28px; line-height: 1.7; font-size: 14px; color: #2A2D30; }
    .email-footer { background: #FAF8F4; padding: 20px; border-top: 1px solid #ECE5D8; text-align: center; font-size: 12px; color: #585C63; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Praetorian Technology</h1>
      <p>Strategy • Data • Intelligence • Impact</p>
    </div>
    <div class="email-body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for contacting <strong>Praetorian Technology</strong>.</p>
      <p>We have received your project inquiry and will review the requirements.</p>
      <p>Our team will contact you using the details provided in your enquiry.</p>
      <br>
      <p>
        Regards,<br>
        <strong>Praetorian Technology</strong><br>
        <span style="color:#886524; font-size:12px; font-weight:bold;">Strategy • Data • Intelligence • Impact</span>
      </p>
    </div>
    <div class="email-footer">
      <strong>Contact:</strong> +91 94436 47190 | +91 86088 50397 | <a href="mailto:teenideas.in@gmail.com" style="color:#886524;">teenideas.in@gmail.com</a><br>
      Instagram: <a href="https://www.instagram.com/praetorian_technology" style="color:#886524;">@praetorian_technology</a>
    </div>
  </div>
</body>
</html>`;

        await transporter.sendMail({
          from: `"Praetorian Technology" <${user}>`,
          to: email,
          subject: `We Received Your Project Inquiry — Praetorian Technology`,
          text: textAck,
          html: htmlAck
        });
        console.log(`[Project Inquiry] Customer acknowledgement sent to ${email}`);
      } catch (ackError) {
        console.warn(`[Project Inquiry] Customer acknowledgement warning (non-fatal): ${ackError.message}`);
      }
    }

    // 9. Return success ONLY after email is confirmed accepted by SMTP
    return res.status(200).json({
      success: true,
      message: 'Your project inquiry has been received and sent successfully.'
    });

  } catch (error) {
    console.error('[Project Inquiry] Email failed:', error.message || error);
    return res.status(500).json({
      success: false,
      message: "Unable to send inquiry. Please try again or contact us directly."
    });
  }
}

module.exports = handleProjectInquiry;
