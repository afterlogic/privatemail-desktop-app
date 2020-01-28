1. The entire build process must be running on Windows. The "npm install" command should only be run for the first time.

2. Open the package.json file and make sure that the build:app script looks like this
```
quasar build -m electron -T all
```
or
```
quasar build -m electron
```

3. Open cmd or git bash in the root directory and run the following commands
```
npm install
npm run build:app
```

4. Open cmd or git bash in the installers/win directory and run the following commands
```
npm install
node build.js
```
DMG installer is created using windows-installer. See documentation at https://github.com/electron/windows-installer.
