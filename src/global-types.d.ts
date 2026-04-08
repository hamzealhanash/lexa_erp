import { ReactNode } from "react"

// bills table types
export type itemList = {
    item_id?: number | string
    item_name: string
    company_name?: string
    quantity: number
    price: number
    total_price: number
    seller: string
}
export type item = {
    item_id: string
    item_name: string
    company_name?: string
    company_id?: number
    price: number
}
export type billRow = {
    item: itemList;
    onUpdate: (id: number | string, field: keyof itemList, value: string | number) => void;
    onRemove: (id: number | string) => void;
    canRemove: boolean;
    t: (key: string) => string;
    isRTL: boolean;
    availableItems: item[];
}

// collection table types
export type CollectionEntryType = {
    payment_id: number
    payment_date: string
    bill_id: number
    store_id: number
    seller?: string
    store_name: string
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
    bill_id: number
    seller: string
    store_name?: string
    store_id?: number
    total_bill: number
}

// language types
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



// Settings
export interface UserSettings {
    username: string;
    theme: 'light' | 'dark' | 'system';
    language: Language;
}

export type SettingsContextType = {
    settings: UserSettings;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    isLoading: boolean;
};

// Database Models
export interface Contract {
    contract_id?: number;
    contract_name: string;
    percentage: number;
}

export interface Company {
    company_id?: number;
    company_name: string;
    contract_id: number;
    extra_services?: string;
}

export interface Item {
    item_id?: string;
    item_name: string;
    price: number;
    company_id: number;
}

export interface ItemNote {
    item_id: string;
    start_date: string;
    end_date: string;
    content: string;
}



export interface Bill {
    bill_id?: number;
    issue_date: string;
    location?: string;
    total_bill: number;
    total_quantity: number;
    store_id?: number;
    store_name?: string;
    seller?: string;
}

export interface Collection {
    payment_id?: number;
    payment_date: string;
    bill_id: number;
    store_id: number;
    amount_total: number;
    amount_received: number;
    readonly amount_remaining?: number; // Generated
    delivery_status: boolean;
    collection_status: boolean;
}


export interface Store {
    store_id?: number;
    store_name: string;
    location?: string;
}

export interface Purchase {
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
        electron: { [key: string]: any };
    }
}
