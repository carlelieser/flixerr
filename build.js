const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

function getInstallerConfig() {
    console.log('Creating Windows Installer')
    const rootPath = path.join('./')
    const outPath = path.join(rootPath, 'build')
    const iconFile = path.join(rootPath, 'assets', 'imgs', 'icon.ico')
    return Promise.resolve({
        appDirectory: path.join(outPath, 'Flixerr-win32-x64/'),
        name: 'Flixerr',
        title: 'Flixerr',
        authors: 'Flixerr, Inc.',
        noMsi: true,
        outputDirectory: path.join(outPath, 'installer'),
        exe: 'Flixerr.exe',
        setupExe: 'flixerr-setup.exe',
        setupIcon: iconFile,
        iconUrl: 'https://dl.dropboxusercontent.com/s/oa8crfmb01sr88m/icon.ico?dl=0'
    })
}

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error)
        process.exit(1)
    })