import { ipcMain, BrowserWindow } from 'electron';
import { BillRepository } from './services/dataBase/repositories/BillRepository.js'
import { ItemRepository } from './services/dataBase/repositories/ItemRepository.js'
import { CompanyRepository } from './services/dataBase/repositories/CompanyRepository.js'
import { ContractRepository } from './services/dataBase/repositories/ContractRepository.js'
import { CollectionRepository } from './services/dataBase/repositories/CollectionRepository.js'
import { PurchaseRepository } from './services/dataBase/repositories/PurchaseRepository.js'
import controller from './services/dataBase/DbController.js'
import printBill from './services/printer/printService.js'
import { SettingsService } from './services/settingsService.js'
import { UpdateService } from './services/updaterService.js'
import { isDev } from "./utils.js"
import { getDb } from './services/dataBase/connection.js'

const settingsService = new SettingsService()
const updateService = new UpdateService()

export function configuringIPC() {
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
    ipcMain.handle('printBill', async (_event, bill) => printBill(bill))
    // Settings
    ipcMain.handle('getSettings', () => settingsService.getSettings());
    ipcMain.handle('setSetting', (_event, key, value) => settingsService.setSetting(key, value));
    ipcMain.handle('chooseAndSaveProfilePicture', async () => settingsService.chooseProfilePicture());
    ipcMain.handle('getAppVersion', () => settingsService.getAppVersion());
    // Updates
    ipcMain.handle('checkForUpdates', async () => {
        const currentVersion = settingsService.getAppVersion();
        return updateService.checkForUpdates(currentVersion);
    });
    ipcMain.handle('downloadUpdate', async () => {
        const mainWindow = BrowserWindow.getFocusedWindow();
        return updateService.downloadUpdate(mainWindow);
    });
    ipcMain.handle('installUpdate', () => {
        updateService.installUpdate();
    });

}
