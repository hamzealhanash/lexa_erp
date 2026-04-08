import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/language-context"
import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react"
import { Plus, Trash2, Save, Receipt, Calendar, Tag } from "lucide-react"
import type { itemList, item, billRow } from "@/src/global-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, } from "@/src/frontend/components/ui/combobox"
import { toast } from "sonner"
import { format } from "date-fns"
import { useVirtualizer } from "@tanstack/react-virtual"

const BillRow = memo(({ item, onUpdate, onRemove, canRemove, t, isRTL, availableItems }: billRow) => {
    const selectedItem = availableItems.find(i => i.item_name === item.item_name) || null

    const handleValueChange = (i: item | null) => {
        if (i) {
            onUpdate(item.item_id!, "item_name", i.item_name)
            onUpdate(item.item_id!, "price", i.price)
            onUpdate(item.item_id!, "company_name", i.company_name || "")
        } else {
            onUpdate(item.item_id!, "item_name", "")
            onUpdate(item.item_id!, "price", 0)
            onUpdate(item.item_id!, "company_name", "")
        }
    }
    return (
        <TableRow className="border-b border-border">
            <TableCell className="py-3 px-4 min-w-50">
                <Combobox
                    items={availableItems}
                    itemToStringLabel={(i: item) => i.item_name}
                    value={selectedItem}
                    onValueChange={handleValueChange}>
                    <ComboboxInput placeholder={t("item")} showClear={!!item.item_name} />
                    <ComboboxContent className={`${isRTL ? "ml-100" : ""}`}>
                        <ComboboxEmpty>{t("noItemsFound")}</ComboboxEmpty>
                        <ComboboxList>
                            {availableItems.map((i: item) => (
                                <ComboboxItem key={i.item_id} value={i} >
                                    <Item size="xs" className="p-0" >
                                        <ItemContent>
                                            <ItemTitle className="whitespace-nowrap">{i.item_name}</ItemTitle>
                                            <ItemDescription>{i.company_name}</ItemDescription>
                                        </ItemContent>
                                    </Item>
                                    <span className={`text-sm text-primary font-medium ms-auto flex items-center gap-1 standard-digits ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                                        <span>{i.price.toFixed(2)}</span>
                                        <span>{t("currency")}</span>
                                    </span>
                                </ComboboxItem>
                            ))}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </TableCell>
            <TableCell className="py-3 px-4">
                <Input
                    placeholder={t("companyName")}
                    value={item.company_name || ""}
                    onChange={event => onUpdate(item.item_id!, "company_name", event.target.value)}
                    className="bg-input border-border"
                />
            </TableCell>
            <TableCell className="py-3 px-4">
                <Input
                    placeholder={t("seller")}
                    value={item.seller}
                    onChange={event => onUpdate(item.item_id!, "seller", event.target.value)}
                    className="bg-input border-border"
                />
            </TableCell>
            <TableCell className="py-3 px-4">
                <Input
                    type="number"
                    placeholder="0"
                    value={item.quantity || ""}
                    onChange={event => onUpdate(item.item_id!, "quantity", Number(event.target.value))}
                    className="bg-input border-border w-24 no-spinner"
                />
            </TableCell>
            <TableCell className="py-3 px-4">
                <Input
                    type="number"
                    placeholder={`0.00 ${t("currency")}`}
                    value={item.price || ""}
                    onChange={event => onUpdate(item.item_id!, "price", Number(event.target.value))}
                    className="bg-input border-border w-24 no-spinner"
                />
            </TableCell>
            <TableCell className="py-3 px-4">
                <Input
                    value={` ${item.total_price.toFixed(2)} ${t("currency")}`}
                    disabled
                    className="bg-muted border-border w-24"
                />
            </TableCell>
            <TableCell className="py-3 px-4 text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(item.item_id!)}
                    disabled={!canRemove}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    )
})

const populateItemsList = () => {
    const itemList: itemList[] = []
    for (let i = 1; i <= 100; i++) {
        itemList.push({ item_id: crypto.randomUUID(), item_name: "", seller: "", company_name: "", quantity: 0, price: 0, total_price: 0 })
    }
    return itemList
}
function useLatestBillId() {
    const [billId, setBillId] = useState(1)

    const getLatestBillId = useCallback(async () => {
        try {
            const bills = await window.electron.getAllBills()
            if (bills && bills.length > 0) {
                setBillId(bills[bills.length - 1].bill_id)
            } else {
                setBillId(1)
            }
        } catch (error) {
            console.error("Failed to fetch bills:", error)
        }
    }, [])

    useEffect(() => {
        getLatestBillId()
    }, [getLatestBillId])

    return { billId, getLatestBillId }
}

export default function BillsCard() {
    const { t, isRTL } = useTranslation()
    const [itemsList, setItemsList] = useState<itemList[]>(populateItemsList())

    const scrollRef = useRef<HTMLDivElement>(null)
    const { billId, getLatestBillId } = useLatestBillId()
    const [store, setStore] = useState("")
    const [location, setLocation] = useState("")
    const [availableItems, setAvailableItems] = useState<item[]>([])

    const virtualizer = useVirtualizer({
        count: itemsList.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 50,
    })

    const fetchItems = useCallback(async () => {
        try {
            const items = await window.electron.getAllItems()
            setAvailableItems(items)
        } catch (error) {
            console.error("Failed to fetch items:", error)
        }
    }, [])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    const addItem = useCallback(() => setItemsList(prev => [...prev, {
        item_id: crypto.randomUUID(),
        item_name: "",
        company_name: "",
        quantity: 0,
        price: 0,
        total_price: 0,
        seller: ""
    }]), [])


    const updateItem = useCallback((id: number | string, field: keyof itemList, value: string | number) => {
        setItemsList(prev => prev.map(item => {
            if (item.item_id === id) {
                const updated = { ...item, [field]: value }
                if (field === "quantity" || field === "price") {
                    updated.total_price = Number(updated.quantity) * Number(updated.price)
                }
                return updated
            }
            return item
        }))
    }, [])

    const removeItem = useCallback((id: number | string) => {
        setItemsList(prev => prev.length > 1 ? prev.filter(i => i.item_id !== id) : prev)
    }, [])

    const totalQuantity = useMemo(() => itemsList.reduce((sum, item) => sum + Number(item.quantity), 0), [itemsList])
    const grandTotal = useMemo(() => itemsList.reduce((sum, item) => sum + item.total_price, 0), [itemsList])

    const handleSaveBill = async () => {
        const validItems = itemsList.filter(item => item.item_name !== "")
        if (validItems.length === 0) {
            toast.warning(t("noItems"))
            return
        }

        const billData = {
            issue_date: format(new Date(), "yyyy/MM/dd hh:mm aa"),
            location: location,
            total_bill: grandTotal,
            total_quantity: totalQuantity,
            store_name: store || "Unknown Store",
            seller: validItems[0]?.seller || "Unknown"
        }

        const savePromise = (async () => {
            await window.electron.createBill(billData)
            await getLatestBillId()
            setStore("")
            setLocation("")
            setItemsList(populateItemsList())
        })()

        toast.promise(savePromise, {
            loading: t("savingBill"),
            success: t("billSavedSuccess"),
            error: t("billSavedError"),
        })
    }
    return (<Card>
        <CardHeader>
            <CardTitle className="flex items-center justify-between select-none">
                <span>{t("billsEntry")}</span>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleSaveBill}>
                    <Save className="h-4 w-4 me-2" />
                    {t("saveBill")}
                </Button>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-8">
                <p className="select-none text-sm text-muted-foreground mb-4">{t("enterMainBillInfo")}</p>
                <div className="grid grid-cols-4 gap-4">
                    <Item variant="muted">
                        <Receipt />
                        <ItemContent>
                            <ItemTitle className="select-none">{t("billId")}</ItemTitle>
                            <ItemDescription className="standard-digits">{billId}</ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="muted">
                        <Calendar />
                        <ItemContent>
                            <ItemTitle className="select-none">{t("issueDate")}</ItemTitle>
                            <ItemDescription className={`standard-digits ${isRTL ? "text-end" : "text-start"}`} dir="ltr">{format(new Date(), "yyyy/MM/dd hh:mm aa")}</ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="muted">
                        <Tag />
                        <ItemContent>
                            <ItemTitle className="select-none">{t("totalQuantity")}</ItemTitle>
                            <ItemDescription className="standard-digits">{totalQuantity}</ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="muted">
                        <Tag />
                        <ItemContent>
                            <ItemTitle className="select-none">{t("grandTotal")}</ItemTitle>
                            <ItemDescription className="standard-digits">{grandTotal} {t("currency")} </ItemDescription>
                        </ItemContent>
                    </Item>

                    <div className="space-y-2">
                        <Label className={`text-sm pl-1 font-medium text-foreground select-none`}>{t("store")}</Label>
                        <Input
                            placeholder={t("store")}
                            value={store}
                            onChange={(e) => setStore(e.target.value)}
                            className="bg-input border-border "
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm pl-1 font-medium text-foreground select-none">{t("location")}</Label>
                        <Input
                            placeholder={t("location")}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-input border-border"
                        />
                    </div>
                </div>
                <div className="space-y-10 bg-background dark:bg-background rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground select-none">{t("addMultipleItems")}</p>
                        <Button onClick={addItem} variant="outline" size="sm">
                            <Plus className="h-4 w-4 me-2" />
                            {t("addItem")}
                        </Button>
                    </div>
                    <div ref={scrollRef} className="max-h-100 overflow-auto relative">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                <TableRow>
                                    <TableHead className="py-3 px-4 text-sm font-medium text-muted-foreground select-none text-start">
                                        {t("item")}
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-sm font-medium text-muted-foreground select-none text-start">
                                        {t("companyName")}
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-sm font-medium text-muted-foreground select-none text-start">
                                        {t("seller")}
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-sm font-medium text-muted-foreground select-none text-start">
                                        {t("quantity")}
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-sm font-medium text-muted-foreground select-none text-start">
                                        {t("price")}
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-sm font-medium text-muted-foreground select-none text-start">
                                        {t("totalPrice")}
                                    </TableHead>
                                    <TableHead className="py-3 px-4 text-sm font-medium text-muted-foreground select-none text-center">
                                        {t("action")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {virtualizer.getVirtualItems().length > 0 && (
                                    <TableRow style={{ height: `${virtualizer.getVirtualItems()[0].start}px` }} className="hover:bg-transparent" />
                                )}
                                {virtualizer.getVirtualItems().map((virtualRow) => (
                                    <BillRow
                                        key={virtualRow.key}
                                        item={itemsList[virtualRow.index]}
                                        onUpdate={updateItem}
                                        onRemove={removeItem}
                                        canRemove={itemsList.length > 1}
                                        t={t}
                                        isRTL={isRTL}
                                        availableItems={availableItems}
                                    />
                                ))}
                                {virtualizer.getVirtualItems().length > 0 && (
                                    <TableRow
                                        style={{
                                            height: `${virtualizer.getTotalSize() - virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].end}px`,
                                        }}
                                        className="hover:bg-transparent"
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
    )
}