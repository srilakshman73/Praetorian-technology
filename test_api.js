const http = require('http');

async function testEndpoint(testName, payload, expectedStatus) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/project-inquiry',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const passed = res.statusCode === expectedStatus;
        console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}: Status ${res.statusCode} (Expected ${expectedStatus})`);
        try {
          console.log('   Response:', JSON.parse(body));
        } catch(e) {
          console.log('   Response text:', body);
        }
        resolve(passed);
      });
    });
    req.on('error', (err) => {
      console.log(`[ERROR] ${testName}: ${err.message}`);
      resolve(false);
    });
    req.write(data);
    req.end();
  });
}

async function runAll() {
  console.log('==================================================');
  console.log('PRAETORIAN TECHNOLOGY — EMAIL API TEST SUITE');
  console.log('==================================================\n');
  
  // 1. Missing Name Check (Expect 400)
  await testEndpoint('1. Validation Check — Missing Name', {
    name: '',
    email: 'teenideas.in@gmail.com',
    phone: '+91 94436 47190',
    detailedRequirements: 'Valid project description'
  }, 400);

  // 2. Invalid Email Format (Expect 400)
  await testEndpoint('2. Validation Check — Invalid Email', {
    name: 'Harishma KV',
    email: 'not-an-email',
    phone: '+91 86088 50397',
    detailedRequirements: 'Valid project description'
  }, 400);

  // 3. Invalid Phone Number (Expect 400)
  await testEndpoint('3. Validation Check — Invalid Phone', {
    name: 'Sriram',
    email: 'teenideas.in@gmail.com',
    phone: '12345',
    detailedRequirements: 'Valid project description'
  }, 400);

  // 4. Honeypot Bot Trap (Expect 200 silent trap)
  await testEndpoint('4. Anti-Spam Check — Honeypot Bot Trap', {
    name: 'Spam Bot',
    email: 'bot@spam.com',
    phone: '9999999999',
    detailedRequirements: 'Spam advertisement',
    website_hp: 'http://spam-link.com'
  }, 200);

  // 5. Submission without configured SMTP password (Expect 500 rejection — NO FALSE SUCCESS)
  await testEndpoint('5. Real Delivery Check — Unconfigured Password Rejection', {
    name: 'Sri Lakshman',
    company: 'Praetorian Test Client',
    email: 'teenideas.in@gmail.com',
    phone: '+91 94436 47190',
    projectType: 'CRM Website',
    budget: '₹1,00,000+',
    projectDescription: 'Real Estate CRM Suite',
    detailedRequirements: 'Testing email dispatch and failure handling.',
    website_hp: ''
  }, 500);

  console.log('\n==================================================');
  console.log('All API tests completed.');
  console.log('==================================================');
}

runAll();
