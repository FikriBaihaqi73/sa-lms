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

const superadminDir = path.join(__dirname, 'apps/web/src/routes/_superadmin');
const files = walk(superadminDir);

files.forEach(file => {
    if (!file.endsWith('.tsx')) return;
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace import of rootRoute with superadminRoute
    content = content.replace(/import\s+\{\s*rootRoute\s*\}\s+from\s+['"](?:\.\.\/)+__root['"];?/, "import { superadminRoute } from '../../superadminLayout';");
    content = content.replace(/import\s+\{\s*rootRoute\s*\}\s+from\s+['"]\.\/__root['"];?/, "import { superadminRoute } from '../superadminLayout';");

    content = content.replace(/getParentRoute:\s*\(\)\s*=>\s*rootRoute/g, "getParentRoute: () => superadminRoute");

    fs.writeFileSync(file, content);
});

const userFile = path.join(__dirname, 'apps/web/src/routes/_user/index.tsx');
if (fs.existsSync(userFile)) {
    let content = fs.readFileSync(userFile, 'utf-8');
    content = content.replace(/import\s+\{\s*rootRoute\s*\}\s+from\s+['"]\.\/__root['"];?/, "import { userRoute } from '../userLayout';");
    content = content.replace(/getParentRoute:\s*\(\)\s*=>\s*rootRoute/g, "getParentRoute: () => userRoute");
    fs.writeFileSync(userFile, content);
}
