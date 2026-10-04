/**
 * ==============================================================================
 * PRAETORIAN TECHNOLOGY — LOCAL BACKEND SERVER
 * STRATEGY • DATA • INTELLIGENCE • IMPACT
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Load environment variables from .env.local if present, else .env
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

const handleProjectInquiry = require('./api/project-inquiry');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Mount Secure Project Inquiry API Route
app.post('/api/project-inquiry', (req, res) => {
  return handleProjectInquiry(req, res);
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`PRAETORIAN TECHNOLOGY BACKEND SERVER ACTIVE`);
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`API Route: http://localhost:${PORT}/api/project-inquiry`);
  console.log(`SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || '465'}`);
  console.log(`SMTP User: ${process.env.SMTP_USER || process.env.EMAIL_USER || 'teenideas.in@gmail.com'}`);
  console.log(`SMTP Pass: ${process.env.SMTP_PASSWORD ? 'Configured (Hidden)' : 'NOT CONFIGURED'}`);
  console.log(`==================================================\n`);
});

module.exports = { app, server };
