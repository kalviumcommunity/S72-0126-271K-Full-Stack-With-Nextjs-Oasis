/**
 * Email Service Test Script
 * 
 * This script demonstrates testing the email API endpoint.
 * Run this after starting your Next.js development server.
 * 
 * Usage:
 * 1. Start the dev server: npm run dev
 * 2. In another terminal, run: node test-email-service.js
 */

const testEmailAPI = async () => {
  console.log('🧪 Testing Email Service API\n');
  console.log('='.repeat(50));

  // Test 1: Send a simple test email
  console.log('\n📧 Test 1: Sending test email...');
  try {
    const response = await fetch('http://localhost:3000/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email from OASIS',
        message: '<h2>Hello from OASIS! 🚀</h2><p>This is a test email.</p>'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', result.messageId);
      console.log('   Status Code:', result.statusCode);
    } else {
      console.log('❌ Email send failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('   Make sure your Next.js dev server is running!');
  }

  // Test 2: Test with invalid email
  console.log('\n📧 Test 2: Testing with invalid email format...');
  try {
    const response = await fetch('http://localhost:3000/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'invalid-email',
        subject: 'Test',
        message: '<p>Test</p>'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('❌ Should have failed with invalid email!');
    } else {
      console.log('✅ Correctly rejected invalid email');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test 3: Test with missing fields
  console.log('\n📧 Test 3: Testing with missing fields...');
  try {
    const response = await fetch('http://localhost:3000/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'test@example.com'
        // Missing subject and message
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('❌ Should have failed with missing fields!');
    } else {
      console.log('✅ Correctly rejected missing fields');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Test suite completed!\n');
  console.log('📝 Notes:');
  console.log('   - To actually send emails, configure SENDGRID_API_KEY in .env.local');
  console.log('   - Check your SendGrid dashboard for delivery status');
  console.log('   - Remember to verify your sender email in SendGrid');
};

// Run the tests
testEmailAPI();
