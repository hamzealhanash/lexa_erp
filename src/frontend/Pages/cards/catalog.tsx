import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Button } from "@components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table"
import { useTranslation } from "@lib/language-context"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/src/frontend/components/ui/combobox"
import { toast } from "sonner"
import { Plus, Trash2, Building2, Package } from "lucide-react"
import type { company, contract, item } from "@/src/global-types"

// ─────────────────────────────────────────────
// Companies Sub-Tab
// ─────────────────────────────────────────────
function CompaniesTab() {
    const { t } = useTranslation()
    const [companies, setCompanies] = useState<company[]>([])
    const [contracts, setContracts] = useState<contract[]>([])
    const [form, setForm] = useState<{
        company_name: string;
        contract_id: number | "other" | null;
        extra_services: string,
        new_contract_name?: string;
        new_contract_percentage?: number;
    }>({
        company_name: "",
        contract_id: null,
        extra_services: "",
    })

    const selectedContract = useMemo(() => {
        if (form.contract_id === "other") return { contract_id: "other", contract_name: t("other"), percentage: 0 } as any;
        return contracts.find(c => c.contract_id === form.contract_id) ?? null;
    }, [contracts, form.contract_id, t])

    const fetchAll = useCallback(async () => {
        const [comps, conts] = await Promise.all([
            window.electron.getAllCompanies(),
            window.electron.getAllContracts(),
        ])
        setCompanies(comps)
        setContracts(conts)
    }, [])

    const contractsWithOther = useMemo(() => {
        return [...contracts, { contract_id: "other", contract_name: t("other"), percentage: 0 } as any]
    }, [contracts, t])

    useEffect(() => { fetchAll() }, [fetchAll])

    const handleSave = () => {
        if (!form.company_name.trim()) {
            toast.warning(t("enterCompanyName"))
            return
        }

        if (form.contract_id === "other") {
            if (!form.new_contract_name?.trim() || !form.new_contract_percentage) {
                toast.warning(t("enterContractInfo"))
                return
            }
        }

        const savePromise = (async () => {
            let finalContractId = form.contract_id as number;

            // 1. Create new contract if "Other" is selected
            if (form.contract_id === "other") {
                const newContractId = await window.electron.createContract({
                    contract_name: form.new_contract_name!.trim(),
                    percentage: form.new_contract_percentage!
                });
                finalContractId = Number(newContractId);
            }

            // 2. Create the company
            await window.electron.createCompany({
                company_name: form.company_name.trim(),
                contract_id: finalContractId ?? 1,
                extra_services: form.extra_services,
            })

            setForm({ company_name: "", contract_id: null, extra_services: "" })
            await fetchAll()
        })()

        toast.promise(savePromise, {
            loading: t("savingCompany"),
            success: t("companySavedSuccess"),
            error: t("companySavedError"),
        })
    }

    const handleDelete = (id: number) => {
        const deletePromise = (async () => {
            await window.electron.deleteCompany(id)
            await fetchAll()
        })()
        toast.promise(deletePromise, {
            loading: t("deletingCompany"),
            success: t("companyDeletedSuccess"),
            error: t("companyDeletedError"),
        })
    }

    return (
        <div className="space-y-6">
            <div className="bg-muted/40 rounded-xl p-5 border border-border space-y-4">
                <p className="text-sm text-muted-foreground font-medium">{t("addNewCompany")}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label>{t("companyName")}</Label>
                        <Input
                            value={form.company_name}
                            onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))}
                            placeholder={t("companyName")}
                            onKeyDown={e => e.key === "Enter" && handleSave()}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>{t("contract")}</Label>
                        <Combobox
                            items={contractsWithOther}
                            itemToStringLabel={(c: any) => c.contract_id === "other" ? c.contract_name : `${c.contract_name} (${c.percentage}%)`}
                            value={selectedContract}
                            onValueChange={(c: any) => setForm(p => ({ ...p, contract_id: c?.contract_id ?? null }))}
                        >
                            <ComboboxInput placeholder={t("selectContract")} showClear={!!selectedContract} />
                            <ComboboxContent>
                                <ComboboxEmpty>{t("noResults")}</ComboboxEmpty>
                                <ComboboxList>
                                    {contractsWithOther.map(c => (
                                        <ComboboxItem key={c.contract_id} value={c}>
                                            <span>{c.contract_name}</span>
                                            {c.contract_id !== "other" && (
                                                <span className="ms-auto text-xs text-muted-foreground standard-digits">{c.percentage}%</span>
                                            )}
                                        </ComboboxItem>
                                    ))}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    <div className="space-y-1.5">
                        <Label>{t("extraServices")}</Label>
                        <Input
                            value={form.extra_services}
                            onChange={e => setForm(p => ({ ...p, extra_services: e.target.value }))}
                            placeholder={t("extraServices")}
                        />
                    </div>

                    {form.contract_id === "other" && (
                        <>
                            <div className="space-y-1.5">
                                <Label>{t("newContractName")}</Label>
                                <Input
                                    value={form.new_contract_name || ""}
                                    onChange={e => setForm(p => ({ ...p, new_contract_name: e.target.value }))}
                                    placeholder={t("contractName")}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>{t("percentage")}</Label>
                                <Input
                                    type="number"
                                    value={form.new_contract_percentage || ""}
                                    onChange={e => {
                                        const val = Number(e.target.value)
                                        if (val >= 0 && val <= 100) {
                                            setForm(p => ({ ...p, new_contract_percentage: val }))
                                        }
                                    }}
                                    placeholder="0"
                                    className="standard-digits no-spinner"
                                />
                            </div>
                        </>
                    )}
                </div>
                <Button onClick={handleSave} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t("addCompany")}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>{t("companyName")}</TableHead>
                            <TableHead>{t("contract")}</TableHead>
                            <TableHead>{t("extraServices")}</TableHead>
                            <TableHead className="w-16" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-20">
                                    {t("noResults")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            companies.map(c => {
                                const contract = contracts.find(ct => ct.contract_id === c.contract_id)
                                return (
                                    <TableRow key={c.company_id}>
                                        <TableCell className="font-medium">{c.company_name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {contract ? `${contract.contract_name} (${contract.percentage}%)` : "—"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{c.extra_services || "—"}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleDelete(c.company_id!)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Items Sub-Tab
// ─────────────────────────────────────────────
function ItemsTab() {
    const { t } = useTranslation()
    // Items returned from getAllItems already include company_name via SQL JOIN
    const [items, setItems] = useState<(item & { company_name?: string })[]>([])
    const [companies, setCompanies] = useState<company[]>([])
    const [form, setForm] = useState<{ item_name: string; price: string; company_id: number }>({
        item_name: "",
        price: "",
        company_id: 1,
    })

    const selectedCompany = useMemo(
        () => companies.find(c => c.company_id === form.company_id) ?? null,
        [companies, form.company_id]
    )

    const fetchItems = useCallback(async () => {
        // getAllItems already JOINs company name on the backend
        setItems(await window.electron.getAllItems())
    }, [])

    const fetchCompanies = useCallback(async () => {
        setCompanies(await window.electron.getAllCompanies())
    }, [])

    useEffect(() => {
        fetchItems()
        fetchCompanies()
    }, [fetchItems, fetchCompanies])

    const handleSave = () => {
        if (!form.item_name.trim() || !form.company_id) {
            toast.warning(t("enterAllItemInfo"))
            return
        }
        const price = parseFloat(form.price)
        if (isNaN(price) || price < 0) {
            toast.warning(t("invalidPrice"))
            return
        }
        const savePromise = (async () => {
            await window.electron.createItem({
                item_id: crypto.randomUUID(),
                item_name: form.item_name.trim(),
                price,
                company_id: form.company_id,
            })
            setForm({ item_name: "", price: "", company_id: 1 })
            await fetchItems()  // only re-fetch items, companies haven't changed
        })()
        toast.promise(savePromise, {
            loading: t("savingItem"),
            success: t("itemSavedSuccess"),
            error: t("itemSavedError"),
        })
    }

    const handleDelete = (id: string) => {
        const deletePromise = (async () => {
            await window.electron.deleteItem(id)
            await fetchItems()  // only re-fetch items
        })()
        toast.promise(deletePromise, {
            loading: t("deletingItem"),
            success: t("itemDeletedSuccess"),
            error: t("itemDeletedError"),
        })
    }

    return (
        <div className="space-y-6">
            {/* Form */}
            <div className="bg-muted/40 rounded-xl p-5 border border-border space-y-4">
                <p className="text-sm text-muted-foreground font-medium">{t("addNewItem")}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label>{t("item")}</Label>
                        <Input
                            value={form.item_name}
                            onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))}
                            placeholder={t("item")}
                            onKeyDown={e => e.key === "Enter" && handleSave()}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>{t("price")}</Label>
                        <Input
                            value={form.price}
                            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                            placeholder="0.00"
                            type="number"
                            min={0}
                            className="standard-digits"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>{t("companyName")}</Label>
                        <Combobox
                            items={companies}
                            itemToStringLabel={(c: company) => c.company_name}
                            value={selectedCompany}
                            onValueChange={(c: company | null) => setForm(p => ({ ...p, company_id: c?.company_id ?? 1 }))}
                        >
                            <ComboboxInput placeholder={t("selectCompany")} showClear={!!selectedCompany} />
                            <ComboboxContent>
                                <ComboboxEmpty>{t("noResults")}</ComboboxEmpty>
                                <ComboboxList>
                                    {companies.map(c => (
                                        <ComboboxItem key={c.company_id} value={c}>
                                            {c.company_name}
                                        </ComboboxItem>
                                    ))}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>
                </div>
                <Button onClick={handleSave} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t("addItem")}
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>{t("item")}</TableHead>
                            <TableHead>{t("price")}</TableHead>
                            <TableHead>{t("companyName")}</TableHead>
                            <TableHead className="w-16" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-20">
                                    {t("noResults")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.item_id}>
                                    <TableCell className="font-medium">{item.item_name}</TableCell>
                                    <TableCell className="standard-digits">
                                        {item.price.toFixed(2)} {t("currency")}
                                    </TableCell>
                                    {/* company_name comes directly from the SQL JOIN, no frontend lookup needed */}
                                    <TableCell className="text-muted-foreground">{item.company_name ?? "—"}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleDelete(item.item_id!)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Main Catalog Card
// ─────────────────────────────────────────────
export default function CatalogCard() {
    const { t } = useTranslation()
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("catalog")}</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="companies" className="w-full">
                    <TabsList variant="line" className="mb-6">
                        <TabsTrigger value="companies" className="gap-2">
                            <Building2 className="w-4 h-4" />
                            {t("companies")}
                        </TabsTrigger>
                        <TabsTrigger value="items" className="gap-2">
                            <Package className="w-4 h-4" />
                            {t("items")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="companies">
                        <CompaniesTab />
                    </TabsContent>
                    <TabsContent value="items">
                        <ItemsTab />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
