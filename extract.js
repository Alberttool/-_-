const fs = require('fs');
const path = require('path');

const srcDir = path.join('c:', 'Users', 'User', 'OneDrive', '桌面', 'wee', 'back');
const destDir = path.join('c:', 'Users', 'User', 'OneDrive', '桌面', 'wee', 'public', 'assets');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

[1, 2, 3].forEach(num => {
    const filePath = path.join(srcDir, `iPhone 16 - ${num}.html`);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/src="data:image\/png;base64,([^"]+)"/);
        if (match && match[1]) {
            const base64Data = match[1];
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(path.join(destDir, `bg${num}.png`), buffer);
            console.log(`Extracted bg${num}.png`);
        } else {
            console.log(`Could not extract image from iPhone 16 - ${num}.html`);
        }
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
