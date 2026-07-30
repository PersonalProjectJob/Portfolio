const fs = require('fs');
const path = require('path');

const files = [
    "src/pages/ProjectCryptomap.tsx",
    "src/pages/ProjectNailhub.tsx",
    "src/pages/ProjectNexora.tsx",
    "src/pages/ProjectVlinkpay.tsx",
    "src/pages/ProjectDispatch.tsx",
    "src/pages/ProjectAgentRules.tsx",
    "src/pages/ProjectAIProcess.tsx",
    "src/pages/ProjectHandoff.tsx",
    "src/pages/ProjectFintechFit.tsx",
    "src/components/DesktopWorkspace.tsx",
    "src/components/GameCharacterSelect.tsx",
    "src/components/GameWorldMap.tsx",
    "src/components/GameQuestLog.tsx"
];

let modifiedFiles = [];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        let changed = false;
        // Find <img tags that don't have loading="lazy"
        // DesktopWorkspace.tsx specifically needs to modify cantho-floating-market.png and workspace-transparent.png.
        
        if (file === "src/components/DesktopWorkspace.tsx") {
            // Need to match <img ... src={cantho-floating-market} or similar.
            // Let's just blindly add to all <img> tags that don't have it, since that's generally safe.
        }

        const newContent = content.replace(/<img\s([^>]+)>/g, (match, p1) => {
            if (p1.includes('loading=')) {
                return match;
            }
            changed = true;
            return `<img loading="lazy" decoding="async" ${p1}>`;
        });
        
        if (changed) {
            fs.writeFileSync(fullPath, newContent, 'utf8');
            modifiedFiles.push(file);
        }
    }
});

console.log("Modified files:");
modifiedFiles.forEach(f => console.log(f));
