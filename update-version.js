const fs = require('fs');

const date = new Date();
const timestamp = date.toLocaleString('en-US', { 
    timeZone: 'EST', 
    hour12: false 
});

// You can also increment a version number here if you track it in a separate file
const content = `// This file is auto-generated.
export const FORTIS_VERSION = "1.0.0"; 
export const LAST_DEPLOYED = "${timestamp} EST";
`;

fs.writeFileSync('./src/version.ts', content);
console.log(`🛡️ Fortis Version Updated: ${timestamp}`);
