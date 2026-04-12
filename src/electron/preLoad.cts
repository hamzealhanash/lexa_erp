import { contextBridge, ipcRenderer } from 'electron';
import type { bill, collection, company, contract, item, purchase } from "@/src/global-types.d.ts"

contextBridge.exposeInMainWorld('electron', {
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
    // Settings
    getSettings: () => ipcRenderer.invoke('getSettings'),
    setSetting: (key: string, value: any) => ipcRenderer.invoke('setSetting', key, value),
    // Shortcuts
    onTabChange: (callback: (tab: string) => void) => {
        ipcRenderer.on('on-tab-change', (_event, tab) => callback(tab));
    },
    // Dev
    injectSampleData: () => ipcRenderer.invoke('injectSampleData'),
    // Print
    printBill: (bill: bill) => ipcRenderer.invoke('printBill', bill),
});
