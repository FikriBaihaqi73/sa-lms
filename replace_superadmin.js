const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const dir = path.join(__dirname, 'apps/web/src');
const files = walk(dir);

files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    let newContent = content.replace(/superadmin/g, 'settings');
    newContent = newContent.replace(/Superadmin/g, 'Settings');
    newContent = newContent.replace(/_superadmin/g, '_settings');
    newContent = newContent.replace(/superadminRoute/g, 'settingsRoute');
    newContent = newContent.replace(/SuperadminSettingsPage/g, 'SettingsPage');
    newContent = newContent.replace(/superadminSettingsRoute/g, 'settingsRouteDef');
    newContent = newContent.replace(/Superadmin Portal/g, 'Settings Portal');

    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log(`Updated ${file}`);
    }
});
