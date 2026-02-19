const fs = require('fs');
const pkg = require('./package.json');

// 1. Get the current time in EST
const date = new Date();
const timestamp = date.toLocaleString('en-US', { 
    timeZone: 'America/New_York', 
    hour12: false,
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
});

// 2. Grab the Git Hash (Vercel provides this automatically in production)
const gitHash = process.env.VERCEL_GIT_COMMIT_SHA 
                ? process.env.VERCEL_GIT_COMMIT_SHA.substring(0, 7) 
                : "DEV-LOCAL";

// Change the 'content' line in your update-version.js to this:
const content = `// This file is auto-generated.
export const FORTIS_VERSION: string = "${pkg.version}"; 
export const LAST_DEPLOYED: string = "${timestamp} EST";
export const GIT_HASH: string = "${gitHash}";
`;

try {
    fs.writeFileSync('./src/version.ts', content);
    console.log(`🛡️ Build Stamped: v${pkg.version} [${gitHash}] at ${timestamp}`);
} catch (err) {
    console.error('❌ Version stamp failed:', err);
}