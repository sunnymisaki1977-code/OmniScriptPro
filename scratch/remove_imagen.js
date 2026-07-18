const fs = require('fs');

const file = 'CanvaApp.js/OmniScript PRO_os.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove applyTextOverlayToImageBase64
const funcName = "const applyTextOverlayToImageBase64 =";
const startIdx = content.indexOf(funcName);
if (startIdx !== -1) {
    // Find the comment above it if possible
    const commentIdx = content.lastIndexOf('// 文字疊加渲染引擎', startIdx);
    const actualStart = commentIdx !== -1 ? commentIdx : startIdx;
    
    // Find the end by looking for "img.src = base64Image;" and then "};"
    const endMarker = "img.src = base64Image;\r\n    });\r\n  };";
    const endMarkerAlt = "img.src = base64Image;\n    });\n  };";
    let endIdx = content.indexOf(endMarker, startIdx);
    if (endIdx === -1) endIdx = content.indexOf(endMarkerAlt, startIdx);
    
    if (endIdx !== -1) {
        content = content.slice(0, actualStart) + content.slice(endIdx + endMarker.length);
        console.log("Removed applyTextOverlayToImageBase64");
    } else {
        console.log("Could not find end of applyTextOverlayToImageBase64");
    }
}

// 2. Remove else block for Imagen 4
const elseStartStr = "} else {\r\n        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${activeApiKey}`;";
const elseStartStrAlt = "} else {\n        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${activeApiKey}`;";

let elseIdx = content.indexOf(elseStartStr);
if (elseIdx === -1) elseIdx = content.indexOf(elseStartStrAlt);

if (elseIdx !== -1) {
    const elseEndStr = "      if (base64) {";
    const elseEndIdx = content.indexOf(elseEndStr, elseIdx);
    if (elseEndIdx !== -1) {
        content = content.slice(0, elseIdx) + "\n      }\n" + content.slice(elseEndIdx);
        console.log("Removed Imagen 4 API else block");
    }
} else {
    // maybe it was already removed? Let's check if the code still exists
    console.log("Could not find Imagen 4 API else block");
}

// 3. Remove the isImagen overlay call
const isImagenCallRegex = /\s*let finalImage = originalImage;\s*if \(isImagen\) \{\s*\/\/.*?\s*finalImage = await applyTextOverlayToImageBase64\(originalImage, mainTitle, subTitle, poetry\);\s*\}/s;
content = content.replace(isImagenCallRegex, '\n        let finalImage = originalImage;');

// 4. Remove `const isImagen = imageEngine.includes('imagen');`
content = content.replace(/\s*const isImagen = imageEngine\.includes\('imagen'\);/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log("Cleanup complete.");
