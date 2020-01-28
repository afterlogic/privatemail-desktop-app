1. The entire build process must be running on MacOS. The "npm install" command should only be run for the first time.

2. Open the package.json file and make sure that the build:app script looks like this
```
quasar build -m electron -T all
```

3. Open terminal in the root directory and run the following commands
```
npm install
npm run build:app
```

3. Open terminal in the installers/linux directory and run the following commands
```
npm install
node build.js
```
Debian installer is created using electron-installer-debian. See documentation at https://github.com/electron-userland/electron-installer-debian.
