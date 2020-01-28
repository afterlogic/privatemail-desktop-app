1. The entire build process must be running on Windows. The "npm install" command should only be run for the first time.

2. Open cmd or git bash in the root directory and run the following commands
```
npm install
npm run build:app
```

3. Open cmd or git bash in the installers/win directory and run the following commands
```
npm install
node build.js
```
DMG installer is created using windows-installer. See documentation at https://github.com/electron/windows-installer.
