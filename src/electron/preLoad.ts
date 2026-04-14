import { contextBridge, ipcRenderer } from 'electron';
import { bill, collection, company, contract, item, purchase } from "@types"

contextBridge.exposeInMainWorld('electron', {
    /*
    * ─────────────────────────────────────────────
    *                   @Database
    * ─────────────────────────────────────────────
    */
    // Items & records
    getAllItems: () => ipcRenderer.invoke('getAllItems'),
    createItem: (item: item) => ipcRenderer.invoke('createItem', item),
    deleteItem: (id: string) => ipcRenderer.invoke('deleteItem', id),

    // Records / Sales
    getRecords: () => ipcRenderer.invoke('getRecords'),
    getCompanySales: (dateFilterType: string) => ipcRenderer.invoke('getCompanySales', dateFilterType),
    getItemSales: (startDate: string, endDate: string) => ipcRenderer.invoke('getItemSales', startDate, endDate),

    // Bills
    createBill: (bill: bill) => ipcRenderer.invoke('createBill', bill),
    createPurchases: (purchases: purchase[]) => ipcRenderer.invoke('createPurchases', purchases),
    getAllBills: () => ipcRenderer.invoke('getAllBills'),

    // Collections
    addCollection: (collection: collection) => ipcRenderer.invoke('addCollection', collection),
    getAllCollections: () => ipcRenderer.invoke('getAllCollections'),

    // Companies & Contracts (Catalog)
    createCompany: (company: company) => ipcRenderer.invoke('createCompany', company),
    getAllCompanies: () => ipcRenderer.invoke('getAllCompanies'),
    deleteCompany: (id: number) => ipcRenderer.invoke('deleteCompany', id),
    getAllContracts: () => ipcRenderer.invoke('getAllContracts'),
    createContract: (contract: contract) => ipcRenderer.invoke('createContract', contract),

    /*
    * ─────────────────────────────────────────────
    *                   @Services
    * ─────────────────────────────────────────────
    */
    // Settings
    getSettings: () => ipcRenderer.invoke('getSettings'),
    setSetting: (key: string, value: any) => ipcRenderer.invoke('setSetting', key, value),
    chooseAndSaveProfilePicture: () => ipcRenderer.invoke('chooseAndSaveProfilePicture'),
    getAppVersion: () => ipcRenderer.invoke('getAppVersion'),
    // Updates
    checkForUpdates: () => ipcRenderer.invoke('checkForUpdates'),
    downloadUpdate: () => ipcRenderer.invoke('downloadUpdate'),
    installUpdate: () => ipcRenderer.invoke('installUpdate'),
    onUpdateDownloadProgress: (callback: (progress: { percent: number; transferred: number; total: number }) => void) => {
        ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress));
    },
    // Print
    printBill: (bill: bill) => ipcRenderer.invoke('printBill', bill),

    // Shortcuts
    onTabChange: (callback: (tab: string) => void) => {
        ipcRenderer.on('on-tab-change', (_event, tab) => callback(tab));
    },

    /*
    * ─────────────────────────────────────────────
    *                     @Development
    * ─────────────────────────────────────────────
    */
    injectSampleData: () => ipcRenderer.invoke('injectSampleData'),
});
