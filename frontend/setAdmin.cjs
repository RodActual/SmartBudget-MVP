// setAdmin.js
// Sets custom admin claims for a user
// Run with: node setAdmin.js YOUR_EMAIL@example.com

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Please provide an email address');
  console.log('Usage: node setAdmin.js YOUR_EMAIL@example.com');
  process.exit(1);
}

async function setAdminClaim(userEmail) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(userEmail);
    
    console.log(`\n👤 Found user: ${user.email} (UID: ${user.uid})`);
    
    // Check if already admin
    const currentClaims = user.customClaims || {};
    if (currentClaims.admin === true) {
      console.log('⚠️  User is already an admin!');
      
      // Ask if they want to continue anyway
      console.log('\nContinue anyway? (y/n)');
      process.exit(0);
    }
    
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });
    
    console.log('\n✅ Admin privileges granted successfully!');
    console.log('\n🔑 User must sign out and sign back in for changes to take effect.');
    console.log('\n📋 Admin Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Admin: true`);
    
    // Optionally log to Firestore
    await admin.firestore().collection('admins').doc(user.uid).set({
      email: user.email,
      uid: user.uid,
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      grantedBy: 'CLI Script',
      isActive: true
    });
    
    console.log('\n📝 Admin record created in Firestore /admins collection');
    
    process.exit(0);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: No user found with email: ${userEmail}`);
      console.log('\n💡 The user must create an account first before being granted admin access.');
    } else {
      console.error('\n❌ Error setting admin claim:', error.message);
    }
    process.exit(1);
  }
}

// Run the function
setAdminClaim(email);