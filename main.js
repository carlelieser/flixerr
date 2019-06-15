if (require('electron-squirrel-startup')) 
    return;

const {app, shell, BrowserWindow, Menu} = require('electron');

const windowStateKeeper = require('electron-window-state');

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {

    let mainWindowState = windowStateKeeper({defaultWidth: 1165, defaultHeight: 680})

    // Create the browser window.
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
        show: false
    });

    mainWindowState.manage(mainWindow);

    var template = [
        ...(process.platform === 'darwin'
            ? [
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
                }
            ]
            : []), {
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

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows in an array if
        // your app supports multi windows, this is the time when you should delete the
        // corresponding element.
        mainWindow = null
    })

}

// This method will be called when Electron has finished initialization and is
// ready to create browser windows. Some APIs can only be used after this event
// occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the dock icon is
    // clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.