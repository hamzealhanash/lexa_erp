import path from 'path'
import os from "node:os"
import Store from 'electron-store'
import { isDev } from "./utils.js"
import { sampleData } from '../tests/seed.js'
import printBill from './services/printer/printService.js'
import controller from './services/dataBase/DbController.js'
import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import { getDb, initConnection, initDb } from './services/dataBase/connection.js'
import { BillRepository } from './services/dataBase/repositories/BillRepository.js'
import { ItemRepository } from './services/dataBase/repositories/ItemRepository.js'
import { CompanyRepository } from './services/dataBase/repositories/CompanyRepository.js'
import { ContractRepository } from './services/dataBase/repositories/ContractRepository.js'
import { CollectionRepository } from './services/dataBase/repositories/CollectionRepository.js'
import { PurchaseRepository } from './services/dataBase/repositories/PurchaseRepository.js'

const schema = {
    appVersion: {
        type: 'string',
        default: '0.0.0'
    },
    settings: {
        type: 'object',
        default: {
            username: os.userInfo().username,
            theme: 'dark',
            language: 'en'
        }
    }
}
const store = new Store({ schema })

function initializeApp() {
    initConnection();
    const currentVersion = app.getVersion();
    const storedVersion = store.get('appVersion') as string;
    if (isDev()) {
        initDb();
    } else if (storedVersion !== currentVersion) {
        console.log(`App updated: ${storedVersion} → ${currentVersion}. Running schema migration...`);
        initDb();
        store.set('appVersion', currentVersion);
    }

}

function configuringIPC() {
    const dbController = new controller();
    const billRepository = new BillRepository();
    const itemRepository = new ItemRepository();
    const collectionRepository = new CollectionRepository();
    const companyRepository = new CompanyRepository();
    const contractRepository = new ContractRepository();
    const purchaseRepository = new PurchaseRepository();
    const { getRecords, getAllItems, getCompanySales, getItemSales } = dbController;

    // Records & Sales
    ipcMain.handle('getRecords', async () => getRecords());
    ipcMain.handle('getAllItems', async () => getAllItems());
    ipcMain.handle('getCompanySales', async (_event, dateFilterType) => getCompanySales(dateFilterType));
    ipcMain.handle('getItemSales', async (_event, startDate, endDate) => getItemSales(startDate, endDate));
    // Settings
    ipcMain.handle('getSettings', () => store.get('settings'));
    ipcMain.handle('setSetting', (_event, key, value) => store.set(`settings.${key}`, value));
    // Bills
    ipcMain.handle('createBill', async (_event, bill) => billRepository.create(bill));
    ipcMain.handle('getAllBills', async () => billRepository.getAll());
    // Purchases
    ipcMain.handle('createPurchases', async (_event, purchases) => purchaseRepository.createMany(purchases));
    // Items
    ipcMain.handle('createItem', async (_event, item) => itemRepository.create(item));
    ipcMain.handle('deleteItem', async (_event, id) => itemRepository.delete(id));
    // Collections
    ipcMain.handle('addCollection', async (_event, collection) => collectionRepository.create(collection));
    ipcMain.handle('getAllCollections', async () => collectionRepository.getAll());
    // Companies
    ipcMain.handle('createCompany', async (_event, company) => companyRepository.create(company));
    ipcMain.handle('getAllCompanies', async () => companyRepository.getAll());
    ipcMain.handle('deleteCompany', async (_event, id) => companyRepository.delete(id));
    // Contracts
    ipcMain.handle('getAllContracts', async () => contractRepository.getAll());
    ipcMain.handle('createContract', async (_event, contract) => contractRepository.create(contract));
    // Print
    ipcMain.handle('printBill', async (_event, bill) => printBill(bill));

    if (isDev()) {
        ipcMain.handle('injectSampleData', async () => {
            getDb().exec(sampleData)
        })
    }
}
app.commandLine.appendSwitch('lang', 'en-US');
app.whenReady().then(() => {
    initializeApp()
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
    configuringIPC()

    if (isDev()) {
        mainWindow.loadURL("http://localhost:5173")
        mainWindow.webContents.openDevTools()
        mainWindow.setMenuBarVisibility(true)
    } else {
        mainWindow.setMenuBarVisibility(false)
        mainWindow.loadFile(path.join(app.getAppPath(), "/dist/frontend/index.html"))
    }
})
