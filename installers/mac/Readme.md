1. The entire build process must be running on MacOS. The "npm install" command should only be run for the first time.

2. Open terminal in the root directory and run the following commands
```
npm install
npm run build:app
```

3. Open terminal in the installers/mac directory and run the following commands
```
npm install
node build.js
```
DMG installer is created using electron-installer-dmg. See documentation at https://github.com/electron-userland/electron-installer-dmg.
