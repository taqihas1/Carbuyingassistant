const fs = require('fs');
const path = process.argv[2] || 'android/app/build.gradle';
let content = fs.readFileSync(path, 'utf8');

// 1. Add release signing config after debug signing config
const debugSigningBlock = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const releaseSigningBlock = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release.keystore')
            storePassword System.getenv('CM_KEYSTORE_PASSWORD') ?: 'carbuyingassistant'
            keyAlias 'carbuyingassistant'
            keyPassword System.getenv('CM_KEY_PASSWORD') ?: 'carbuyingassistant'
        }
    }`;

content = content.replace(debugSigningBlock, releaseSigningBlock);

// 2. Only change release build type signingConfig (not debug build type)
const releaseBuildTypePattern = /(buildTypes \{[\s\S]*?release \{[\s\S]*?)(signingConfig signingConfigs\.debug)([\s\S]*?\n        \})/;
content = content.replace(releaseBuildTypePattern, '$1signingConfig signingConfigs.release$3');

fs.writeFileSync(path, content);
console.log('✅ Release signing config patched successfully');

// Verify
const verify = fs.readFileSync(path, 'utf8');
const hasReleaseSigning = verify.includes('signingConfigs.release');
const hasReleaseConfig = verify.includes('release.keystore');
console.log('Has release signingConfig:', hasReleaseSigning);
console.log('Has release keystore:', hasReleaseConfig);
