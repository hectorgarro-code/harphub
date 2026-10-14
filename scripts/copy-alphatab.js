const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'node_modules', '@coderline', 'alphatab', 'dist');
const destDir = path.join(__dirname, '..', 'public', 'assets');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
        if (file.startsWith('alphaTab') && (file.endsWith('.mjs') || file.endsWith('.js'))) {
            const srcFile = path.join(srcDir, file);
            const destFile = path.join(destDir, file);
            fs.copyFileSync(srcFile, destFile);
            console.log(`[copy-alphatab] Copied ${file} to public/assets/`);
        }
    });
} else {
    console.warn('[copy-alphatab] Source directory @coderline/alphatab/dist not found.');
}
