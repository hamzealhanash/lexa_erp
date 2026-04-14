import path from 'path'
import { isDev } from "./utils.js"
import { app, BrowserWindow, Menu, dialog } from 'electron'
import { initConnection, initDb } from './services/dataBase/connection.js'
import { SettingsService } from './services/settingsService.js'
import { configuringIPC } from './ipcHandlers.js'

const settingsService = new SettingsService()

function init() {
    initConnection()
    const currentVersion = app.getVersion()
    const storedVersion = settingsService.getAppVersion()
    if (isDev()) {
        initDb()
    } else if (storedVersion !== currentVersion) {
        console.log(`App updated: ${storedVersion} → ${currentVersion}. Running schema migration...`);
        initDb()
        settingsService.setAppVersion(currentVersion);
    }

}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        icon: path.join(app.getAppPath(), 'build/icon.png'),
        webPreferences: {
            preload: path.join(app.getAppPath(), 'dist/electron/preLoad.cjs')
        }
    })
    const menu = Menu.buildFromTemplate([
        {
            label: 'View',
            submenu: [
                {
                    label: 'Full Screen',
                    accelerator: 'F11',
                    click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
                },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => mainWindow.webContents.reload()
                }, {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: () => mainWindow.webContents.toggleDevTools()
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Exit',
                    click: () => app.quit()
                },
            ]
        },
        {
            label: 'Shortcuts',
            submenu: [
                {
                    label: 'Bills Tab',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => mainWindow.webContents.send('on-tab-change', 'bills')
                },
                {
                    label: 'Collection Tab',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => mainWindow.webContents.send('on-tab-change', 'collection')
                },
                {
                    label: 'Records Tab',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => mainWindow.webContents.send('on-tab-change', 'records')
                },
                {
                    label: 'Catalog Tab',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => mainWindow.webContents.send('on-tab-change', 'catalog')
                }
            ]
        }
    ])
    Menu.setApplicationMenu(menu)
    mainWindow.on('close', (event) => {
        let response = dialog.showMessageBoxSync(mainWindow, {
            type: 'question',
            title: 'Exit',
            message: 'Are you sure you want to exit?',
            buttons: ['Yes', 'No'],
            defaultId: 1
        })
        if (response === 1) event.preventDefault()
    })
    if (isDev() && process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        mainWindow.setMenuBarVisibility(false)
        mainWindow.loadFile(path.join(app.getAppPath(), "/dist/frontend/index.html"))
    }
}

app.commandLine.appendSwitch('lang', 'en-US');
app.whenReady().then(() => {
    init()
    createWindow()
    configuringIPC()
})
