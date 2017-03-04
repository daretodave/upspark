const ChildProcess = require('child_process');
const path = require('path');

const appFolder = path.resolve(process.execPath, '..');
const rootAtomFolder = path.resolve(appFolder, '..');
const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
const exeName = path.basename(process.execPath);

export class WindowsBootstrap {

    static spawn(command:string, args:string[]) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (error) {}

        return spawnedProcess;
    };

    static spawnUpdate(args:string[]) {
        return WindowsBootstrap.spawn(updateDotExe, args);
    };

    static install(app:any) {
        WindowsBootstrap.spawnUpdate(['--createShortcut', exeName]);
        setTimeout(app.quit, 1000);
    }

    static uninstall(app:any) {
        WindowsBootstrap.spawnUpdate(['--removeShortcut', exeName]);
        setTimeout(app.quit, 1000);
    }

    static init(app:any):boolean {
        if ((process.platform || '').toUpperCase().slice(0, 3) !== "WIN" || !process.argv.length) {
            return false;
        }

        const command:string = process.argv[1];

        if (command === '--squirrel-install' || command === '--squirrel-updated') {
            WindowsBootstrap.install(app);
            return true;
        } else if(command === '--squirrel-uninstall') {
            WindowsBootstrap.uninstall(app);
            return true;
        } else if(command === '--squirrel-obsolete') {
            app.quit();
            return true;
        }

        return false;
    }

}