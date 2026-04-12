import { useCallback, useEffect, useState } from "react"
import { Input } from "@components/ui/input"
import { Button } from "@components/ui/button"
import { Checkbox } from "@components/ui/checkbox"
import { useTranslation } from "@lib/language-context"
import { Calendar, Save, User, Store } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Item, ItemContent, ItemDescription, ItemTitle, } from "@components/ui/item"
import type { bill, collection } from "@/src/global-types"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/src/frontend/components/ui/combobox"
import { toast } from "sonner"
import { format } from "date-fns"

export default function CollectionCard() {
    const { t, isRTL } = useTranslation()

    const [availableBills, setAvailableBills] = useState<bill[]>([])
    const [formData, setFormData] = useState<Omit<collection, 'payment_id'>>({
        payment_date: format(new Date(), "yyyy/MM/dd hh:mm aa"),
        bill_id: 0,
        store_id: 0,
        seller: "",
        store_name: "",
        amount_total: 0,
        amount_received: 0,
        amount_remaining: 0,
        collection_status: false,
        delivery_status: false
    })

    const fetchBills = useCallback(async () => {
        try {
            const Bills = await window.electron.getAllBills()
            setAvailableBills(Bills)
        } catch (error) {
            console.error(error)
        }
    }, [])
    useEffect(() => {
        fetchBills()
    }, [fetchBills])

    const updateField = (field: keyof Omit<collection, 'payment_id'>, value: string | number | boolean) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value }
            if (field === "amount_received") {
                updated.amount_remaining = updated.amount_total - Number(value)
            }
            return updated
        })
    }

    const handleBillSelect = (bill: bill | null) => {
        if (bill) {
            setFormData(prev => ({
                ...prev,
                seller: bill.seller,
                store_id: bill.store_id || 0,
                store_name: bill.store_name || "",
                amount_total: bill.total_bill,
                amount_remaining: bill.total_bill - prev.amount_received
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                seller: "",
                store_id: 0,
                store_name: "",
                amount_total: 0,
                amount_remaining: 0
            }))
        }
    }
    const handleChange = (bill: bill | null) => {
        updateField("bill_id", bill?.bill_id || 0)
        handleBillSelect(bill)
    }
    const handleSave = async () => {
        if (!formData.bill_id || !formData.amount_received) {
            toast.warning(t("enterAllInfo"))
            return
        }
        const resetForm: Omit<collection, 'payment_id'> = {
            payment_date: format(new Date(), "yyyy/MM/dd hh:mm aa"),
            bill_id: 0,
            store_id: 0,
            seller: "",
            store_name: "",
            amount_total: 0,
            amount_received: 0,
            amount_remaining: 0,
            collection_status: false,
            delivery_status: false
        }
        const savePromise = (async () => {
            const tempData: any = formData
            tempData.collection_status = tempData.amount_remaining === 0 ? "collected" : "due"
            tempData.delivery_status = formData.delivery_status ? "delivered" : "pending"
            await window.electron.addCollection(tempData)
            setFormData(resetForm)
            fetchBills()
        })()

        toast.promise(savePromise, {
            loading: t("savingCollection"),
            success: t("collectionSavedSuccess"),
            error: t("collectionSavedError")
        })
    }

    const selectedItem = availableBills.find(bill => bill.bill_id === formData.bill_id) || null

    return (<Card>
        <CardHeader>
            <CardTitle className="flex items-center justify-between select-none">
                <span>{t("collectionEntry")}</span>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>
                    <Save className="h-4 w-4 me-2" />
                    {t("saveCollection")}
                </Button>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-6 select-none">{t("enterCollectionInfo")}</p>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <Item>
                        <ItemContent>
                            <ItemTitle className={`mb-1 select-none ${isRTL ? "mr-2" : "ml-2"}`}>{t("billId")}</ItemTitle>
                            <Combobox
                                items={availableBills}
                                itemToStringValue={(bill: bill) => String(bill.bill_id)}
                                itemToStringLabel={(bill: bill) => String(bill.bill_id)}
                                value={selectedItem}
                                onValueChange={handleChange}>
                                <ComboboxInput placeholder={t("billId")} showClear={!!formData.bill_id} />
                                <ComboboxContent>
                                    <ComboboxEmpty>{t("noBillsFound")}</ComboboxEmpty>
                                    <ComboboxList>
                                        {availableBills.map((bill: bill) => (
                                            <ComboboxItem key={String(bill.bill_id)} value={bill}>
                                                <Item size="xs" className="p-0">
                                                    <ItemContent>
                                                        <ItemTitle className="whitespace-nowrap">{bill.bill_id}</ItemTitle>
                                                        <ItemDescription>{bill.seller} - {bill.store_name}</ItemDescription>
                                                    </ItemContent>
                                                </Item>
                                                <span className={`text-sm text-primary font-medium ms-auto flex items-center gap-1 standard-digits ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                                                    <span>{bill.total_bill.toFixed(2)}</span>
                                                    <span>{t("currency")}</span>
                                                </span>
                                            </ComboboxItem>
                                        ))}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </ItemContent>
                    </Item>

                    <Item variant="muted">
                        <Calendar />
                        <ItemContent>
                            <ItemTitle>{t("issueDate")}</ItemTitle>
                            <ItemDescription className={`standard-digits ${isRTL ? "text-end" : "text-start"}`} dir="ltr">{formData.payment_date}</ItemDescription>
                        </ItemContent>
                    </Item>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <Item variant="muted">
                        <User />
                        <ItemContent>
                            <ItemTitle>{t("seller")}</ItemTitle>
                            <ItemDescription>{formData.seller || t("seller")}</ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="muted">
                        <Store />
                        <ItemContent>
                            <ItemTitle>{t("store")}</ItemTitle>
                            <ItemDescription>{formData.store_name || t("store")}</ItemDescription>
                        </ItemContent>
                    </Item>
                    <Item variant="muted">
                        <ItemContent>
                            <ItemTitle>{t("grandTotal")}</ItemTitle>
                            <ItemDescription className="standard-digits">{formData.amount_total} {t("currency")}</ItemDescription>
                        </ItemContent>
                    </Item>
                </div>
                <div className=" m-0 flex items-center">
                    <Item className="w-[90%]">
                        <ItemContent className="gap-2">
                            <ItemTitle className={`${isRTL ? "mr-2" : "ml-2"}`}>{t("collected")}</ItemTitle>
                            <Input
                                type="number"
                                placeholder={`0.00 ${t("currency")}`}
                                value={formData.amount_received || ""}
                                onChange={(event) => {
                                    const val = Math.min(Math.max(0, Number(event.target.value)), formData.amount_total)
                                    updateField("amount_received", val)
                                }}
                                className="bg-input border-border no-spinner"
                            />
                        </ItemContent>
                    </Item>
                    <div className="flex justify-end h-0 p-0 m-0">
                        <span className="text-sm text-muted-foreground standard-digits">
                            {t("totalLeft")}: {formData.amount_total > 0 ? `${formData.amount_remaining.toFixed(2)} ${t("currency")}` : `0.00 ${t("currency")}`}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-8 pt-2">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="collectionStatus"
                            checked={formData.collection_status}
                            onCheckedChange={(checked) => {
                                updateField("collection_status", checked as boolean)
                                checked ? updateField("amount_received", formData.amount_total) : updateField("amount_received", 0)
                            }}
                        />
                        <label
                            htmlFor="collectionStatus"
                            className="text-sm font-medium text-foreground cursor-pointer"
                        >
                            {t("collectionStatus")}
                        </label>
                    </div>

                    {/* Delivery Status Checkbox */}
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="deliveryStatus"
                            checked={formData.delivery_status}
                            onCheckedChange={(checked) => updateField("delivery_status", checked as boolean)}
                        />
                        <label
                            htmlFor="deliveryStatus"
                            className="text-sm font-medium text-foreground cursor-pointer"
                        >
                            {t("deliveryStatus")}
                        </label>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
    )
}
