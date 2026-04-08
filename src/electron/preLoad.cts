import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    // Items & records
    getAllItems: () => ipcRenderer.invoke('getAllItems'),
    createItem: (item: any) => ipcRenderer.invoke('createItem', item),
    deleteItem: (id: string) => ipcRenderer.invoke('deleteItem', id),
    // Records / Sales
    getRecords: () => ipcRenderer.invoke('getRecords'),
    getCompanySales: (dateFilterType: string) => ipcRenderer.invoke('getCompanySales', dateFilterType),
    getItemSales: (startDate: string, endDate: string) => ipcRenderer.invoke('getItemSales', startDate, endDate),
    // Bills
    createBill: (bill: any) => ipcRenderer.invoke('createBill', bill),
    getAllBills: () => ipcRenderer.invoke('getAllBills'),
    // Collections
    addCollection: (collection: any) => ipcRenderer.invoke('addCollection', collection),
    getAllCollections: () => ipcRenderer.invoke('getAllCollections'),
    // Companies & Contracts (Catalog)
    createCompany: (company: any) => ipcRenderer.invoke('createCompany', company),
    getAllCompanies: () => ipcRenderer.invoke('getAllCompanies'),
    deleteCompany: (id: number) => ipcRenderer.invoke('deleteCompany', id),
    getAllContracts: () => ipcRenderer.invoke('getAllContracts'),
    createContract: (contract: any) => ipcRenderer.invoke('createContract', contract),
    // Settings
    getSettings: () => ipcRenderer.invoke('getSettings'),
    setSetting: (key: string, value: any) => ipcRenderer.invoke('setSetting', key, value),
    // Shortcuts
    onTabChange: (callback: (tab: string) => void) => {
        ipcRenderer.on('on-tab-change', (_event, tab) => callback(tab));
    },
});
