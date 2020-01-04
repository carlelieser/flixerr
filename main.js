if (require('electron-squirrel-startup')) 
    return;

const {app, shell, BrowserWindow, Menu} = require('electron');

const windowStateKeeper = require('electron-window-state');

const path = require('path')
const { autoUpdater } = require("electron-updater");

let mainWindow;

process.FLIXERR_DEVELOP = false;

function createWindow() {

    let mainWindowState = windowStateKeeper({defaultWidth: 1165, defaultHeight: 680})

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 1128,
        minHeight: 680,
        maximizable: false,
        title: 'Flixerr',
        icon: __dirname + '/assets/imgs/icon.ico',
        backgroundColor: '#5d16fd',
        titleBarStyle: 'hiddenInset',
        show: false,
        defaultEncoding: 'utf8',
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow
        .webContents
        .session
        .webRequest
        .onHeadersReceived({}, (details, callback) => {
            if (details.responseHeaders['x-frame-options']) {
                delete details.responseHeaders['x-frame-options'];
            }
            callback({cancel: false, responseHeaders: details.responseHeaders});
        });

    mainWindowState.manage(mainWindow);

    var template = [
        {
            label: app.name,
            submenu: [
                {
                    label: 'About Flixerr',
                    role: 'about'
                }, {
                    type: 'separator'
                }, {
                    role: 'services'
                }, {
                    type: 'separator'
                }, {
                    label: 'Hide Flixerr',
                    role: 'hide'
                }, {
                    role: 'hideothers'
                }, {
                    label: 'Unhide Flixerr',
                    role: 'unhide'
                }, {
                    type: 'separator'
                }, {
                    label: 'Quit Flixerr',
                    role: 'quit'
                }
            ]
        }, {
            label: "Edit",
            submenu: [
                {
                    label: "Undo",
                    accelerator: "CmdOrCtrl+Z",
                    selector: "undo:"
                }, {
                    label: "Redo",
                    accelerator: "Shift+CmdOrCtrl+Z",
                    selector: "redo:"
                }, {
                    type: "separator"
                }, {
                    label: "Cut",
                    accelerator: "CmdOrCtrl+X",
                    selector: "cut:"
                }, {
                    label: "Copy",
                    accelerator: "CmdOrCtrl+C",
                    selector: "copy:"
                }, {
                    label: "Paste",
                    accelerator: "CmdOrCtrl+V",
                    selector: "paste:"
                }, {
                    label: "Select All",
                    accelerator: "CmdOrCtrl+A",
                    selector: "selectAll:"
                }
            ]
        }, {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        shell.openExternal('https://www.flixerr.co')
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }

    mainWindow.loadFile(path.join(__dirname, 'index.html'))

	if(process.FLIXERR_DEVELOP){
		mainWindow.webContents.openDevTools();
	}

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    autoUpdater.checkForUpdatesAndNotify();

}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    app.quit()
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});