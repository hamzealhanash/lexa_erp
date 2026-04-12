import { ReactNode } from "react"

export type item = {
    item_id?: string
    item_name: string
    company_name?: string
    company_id?: number
    quantity?: number
    price: number
    total_price?: number
    seller?: string
}

export type billRow = {
    item: item;
    onUpdate: (id: number | string, field: keyof item, value: string | number) => void;
    onRemove: (id: number | string) => void;
    canRemove: boolean;
    t: (key: TranslationKey) => string;
    isRTL: boolean;
    availableItems: item[];
}

export type collection = {
    payment_id: number
    payment_date: string
    bill_id: number
    store_id: number
    store_name?: string
    seller?: string
    amount_total: number
    amount_received: number
    amount_remaining: number
    collection_status: boolean
    delivery_status: boolean
}

export type TabsNavProps = {
    activeTab: string
    onTabChange: (tab: string) => void
}
export type bill = {
    bill_id?: number
    issue_date: string
    location?: string
    total_bill: number
    total_quantity: number
    store_id?: number
    store_name?: string
    seller?: string
}

export type Translations = {
    [key: string]: {
        en: string
        ar: string
    }
}
export type TranslationContext = {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: TranslationKey) => string
    isRTL: boolean
}
export type Language = "en" | "ar"

export interface UserSettings {
    username: string
    theme: 'light' | 'dark'
    language: Language;
}

export type SettingsContextType = {
    settings: UserSettings;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    isLoading: boolean;
};

export interface contract {
    contract_id?: number;
    contract_name: string;
    percentage: number;
}

export interface company {
    company_id?: number;
    company_name: string;
    contract_id: number;
    extra_services?: string;
}

export interface itemNote {
    item_id: string;
    start_date: string;
    end_date: string;
    content: string;
}

export interface store {
    store_id?: number;
    store_name: string;
    location?: string;
}

export interface purchase {
    purchase_id?: number;
    bill_id: number;
    item_id: string;
    quantity: number;
    price?: number;
    total_price?: number;
}

// View Interfaces
export interface ViewRecord {
    bill_id: number;
    quantity: number;
    issue_date: string;
    store_name: string;
    total_bill: number;
    delivery_status: boolean | null;
    collection_status: boolean | null;
}


export interface ViewCompanySale {
    item_id: string;
    item: string;
    quantity: number;
    price: number;
    total_price: number;
    bill_id: number;
    company_id: number;
    company_name: string;
    issue_date: string;
}

export interface ViewItemSale {
    item_id: string;
    item: string;
    total_quantity: number;
    price: number;
    total_revenue: number;
    issue_date: string;
    note: string | null;
}

// Repository Interfaces
export interface IBaseRepository<T, ID> {
    create(entity: T): Promise<ID | number | bigint>;
    getById(id: ID): Promise<T | undefined>;
    getAll(): Promise<T[]>;
    update(id: ID, entity: Partial<T>): Promise<boolean>;
    delete(id: ID): Promise<boolean>;
}

export interface IContractRepository extends IBaseRepository<Contract, number> { }
export interface ICompanyRepository extends IBaseRepository<Company, number> { }
export interface IItemRepository extends IBaseRepository<Item, string> { }
export interface IItemNoteRepository extends IBaseRepository<ItemNote, string> { }
export interface IStoreRepository extends IBaseRepository<Store, number> { }
export interface IBillRepository extends IBaseRepository<Bill, number> { }
export interface ICollectionRepository extends IBaseRepository<Collection, number> { }
export interface IPurchaseRepository extends IBaseRepository<Purchase, number> { }

declare global {
    interface Window {
        electron: {
            // Items & records
            getAllItems: () => Promise<item[]>;
            createItem: (item: item) => Promise<string>;
            deleteItem: (id: string) => Promise<boolean>;
            // Records / Sales
            getRecords: () => Promise<ViewRecord[]>;
            getCompanySales: (dateFilterType: string) => Promise<ViewCompanySale[]>;
            getItemSales: (startDate: string, endDate: string) => Promise<ViewItemSale[]>;
            // Bills
            createBill: (bill: bill) => Promise<string>;
            createPurchases: (purchases: purchase[]) => Promise<string>;
            getAllBills: () => Promise<bill[]>;
            // Collections
            addCollection: (collection: collection) => Promise<string>;
            getAllCollections: () => Promise<collection[]>;
            // Companies & Contracts (Catalog)
            createCompany: (company: company) => Promise<string>;
            getAllCompanies: () => Promise<company[]>;
            deleteCompany: (id: number) => Promise<boolean>;
            getAllContracts: () => Promise<contract[]>;
            createContract: (contract: contract) => Promise<string>;
            // Settings
            getSettings: () => Promise<UserSettings>;
            setSetting: (key: string, value: any) => Promise<boolean>;
            // Shortcuts
            onTabChange: (callback: (tab: string) => void) => void;
            // Dev
            injectSampleData: () => Promise<void>;
            // Print
            printBill: (bill: bill) => Promise<{ success: boolean; error?: string }>;
        };
    }
}
