const fs = require('fs');
const path = require('path');

const targetFile = 'CanvaApp.js/OmniScript PRO_os.tsx';
const extractedFile = 'CanvaApp.js/logoBase64.ts';

let content = fs.readFileSync(targetFile, 'utf8');

// Find the base64 image tag
const regex = /<img src="(data:image\/png;base64,[A-Za-z0-9+/=]+?)" alt="Logo"/;
const match = content.match(regex);

if (match) {
    const base64String = match[1];
    console.log(`Found base64 string of length ${base64String.length}`);

    // Write the extracted string to a new file
    const extractedContent = `export const LOGO_BASE64 = "${base64String}";\n`;
    fs.writeFileSync(extractedFile, extractedContent, 'utf8');
    console.log(`Wrote extracted base64 to ${extractedFile}`);

    // Replace the giant string in the original file
    content = content.replace(
        `src="${base64String}"`,
        `src={LOGO_BASE64}`
    );

    // Add import statement at the top if not present
    if (!content.includes('LOGO_BASE64')) {
        // Find the last import statement
        const importRegex = /import .* from '.*';/g;
        let lastImportIndex = 0;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }

        content = content.slice(0, lastImportIndex) + '\nimport { LOGO_BASE64 } from "./logoBase64";' + content.slice(lastImportIndex);
    } else {
        // just add it after the first import if it's already using LOGO_BASE64 but missing import
        if (!content.includes('import { LOGO_BASE64 }')) {
             content = content.replace(/(import React.*?;\n)/, `$1import { LOGO_BASE64 } from './logoBase64';\n`);
        }
    }

    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(`Updated ${targetFile} successfully.`);
} else {
    // If it spans multiple lines, regex might fail. 
    // The base64 in JSX might be broken into multiple lines with literal newlines or just a giant long string.
    console.log("Could not find base64 string using regex. Will try a more lenient search.");
    
    const startPattern = '<img src="data:image/png;base64,';
    const endPattern = '" alt="Logo"';
    
    const startIndex = content.indexOf(startPattern);
    if (startIndex !== -1) {
        const endIndex = content.indexOf(endPattern, startIndex);
        if (endIndex !== -1) {
            const fullSrc = content.slice(startIndex + 10, endIndex); // +10 to skip `<img src="` to get `data:...`
            
            const extractedContent = `export const LOGO_BASE64 = \`${fullSrc}\`;\n`;
            fs.writeFileSync(extractedFile, extractedContent, 'utf8');
            console.log(`Wrote extracted base64 to ${extractedFile} using manual index.`);
            
            content = content.slice(0, startIndex + 9) + '{LOGO_BASE64}' + content.slice(endIndex);
            
            if (!content.includes('import { LOGO_BASE64 }')) {
                content = content.replace(/(import React.*?;\n)/, `$1import { LOGO_BASE64 } from './logoBase64';\n`);
            }
            
            fs.writeFileSync(targetFile, content, 'utf8');
            console.log(`Updated ${targetFile} successfully via manual index replace.`);
        } else {
            console.log("End pattern not found.");
        }
    } else {
        console.log("Start pattern not found.");
    }
}
