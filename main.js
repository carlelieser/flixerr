const { app, shell, BrowserWindow, Menu } = require("electron");
const windowStateKeeper = require("electron-window-state");
const path = require("path");

let mainWindow = null;

if (process.argv.indexOf("-dev") > -1) global.dev = true;

app.allowRendererProcessReuse = false;

function createWindow() {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 1200,
        defaultHeight: 700,
    });

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: 1200,
        minHeight: 700,
        maximizable: process.platform === "win32",
        title: "Flixerr",
        icon: __dirname + "/assets/img/icon.ico",
        backgroundColor: "#FFF",
        titleBarStyle: "hiddenInset",
        show: false,
        defaultEncoding: "utf8",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    });

    mainWindow.webContents.session.webRequest.onHeadersReceived(
        (details, callback) => {
            if (details.responseHeaders["x-frame-options"]) {
                delete details.responseHeaders["x-frame-options"];
            }
            callback({
                cancel: false,
                responseHeaders: details.responseHeaders,
            });
        },
    );

    mainWindowState.manage(mainWindow);

    const template = [
        {
            label: app.name,
            submenu: [
                {
                    label: "About Flixerr",
                    role: "about",
                },
                {
                    type: "separator",
                },
                {
                    role: "services",
                },
                {
                    type: "separator",
                },
                {
                    label: "Hide Flixerr",
                    role: "hide",
                },
                {
                    role: "hideothers",
                },
                {
                    label: "Show Flixerr",
                    role: "show",
                },
                {
                    type: "separator",
                },
                {
                    label: "Quit Flixerr",
                    role: "quit",
                },
            ],
        },
        {
            role: "help",
            submenu: [
                {
                    label: "Learn More",
                    click() {
                        shell.openExternal("https://www.flixerr.co");
                    },
                },
            ],
        },
    ];

    if (process.platform === "darwin") {
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
        Menu.setApplicationMenu(null);
    }

    mainWindow.loadFile(path.join(__dirname, "index.html"));

    if (global.dev) mainWindow.webContents.openDevTools();

    mainWindow.webContents.once("dom-ready", () => {
        console.log("ready");
        mainWindow.show();
    });

    mainWindow.on("closed", function() {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
    app.quit();
});

app.on("activate", function() {
    if (mainWindow === null) createWindow();
});
