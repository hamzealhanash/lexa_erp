import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/language-context"
import DataTable from "./records/dataTable"
import { getRecordsColumns } from "./records/records_columns"
import { getCompanySalesColumns } from "./records/company_sales_columns"
import { getItemSalesColumns } from "./records/item_sales_columns"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ViewRecord, ViewItemSale } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/custom/date-picker"



export default function RecordsCard() {
    const firstOfToday = new Date()
    firstOfToday.setDate(1)
    const firstOfMonth = firstOfToday.toISOString().split('T')[0]

    const [recordData, setRecordData] = useState<ViewRecord[]>([])
    const [companySalesData, setCompanySalesData] = useState<any[]>([])
    const [itemSalesData, setItemSalesData] = useState<ViewItemSale[]>([])
    const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({
        start: firstOfMonth,
        end: new Date().toISOString().split('T')[0]
    })

    const { t, isRTL } = useTranslation()
    const recordColumns = useMemo(() => getRecordsColumns(t, isRTL), [t, isRTL])
    const companySalesColumns = useMemo(() => getCompanySalesColumns(t), [t])
    const itemSalesColumns = useMemo(() => getItemSalesColumns(t), [t])


    const fetchRecords = useCallback(async () => {
        try {
            const response = await window.electron.getRecords()
            setRecordData(response)
        } catch (error) {
            console.error("Error fetching records:", error)
        }
    }, [])
    const fetchCompanySales = useCallback(async () => {
        try {
            const history = await window.electron.getCompanySales(periodType)
            const flattened: any[] = []
            history.forEach((p: any) => {
                Object.values(p.companies).forEach((c: any) => {
                    flattened.push(...c.items)
                })
            })
            setCompanySalesData(flattened)
        } catch (error) {
            console.error("Error fetching sales:", error)
        }
    }, [periodType])
    const fetchItemSales = useCallback(async () => {
        try {
            const response = await window.electron.getItemSales(dateRange.start, dateRange.end)
            setItemSalesData(response)
        } catch (error) {
            console.error("Error fetching item sales:", error)
        }
    }, [dateRange])

    useEffect(() => { fetchRecords() }, [fetchRecords])
    useEffect(() => { fetchCompanySales() }, [fetchCompanySales])
    useEffect(() => { fetchItemSales() }, [fetchItemSales])


    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("recordsViewOnly")}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t("completeRecord")}</p>
                <Tabs defaultValue="records" className="w-full">
                    <TabsList variant="line">
                        <TabsTrigger value="records">{t("records")}</TabsTrigger>
                        <TabsTrigger value="companySales">{t("companySales")}</TabsTrigger>
                        <TabsTrigger value="itemSales">{t("itemSales")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="records">
                        <DataTable columns={recordColumns} data={recordData} />
                    </TabsContent>
                    <TabsContent value="companySales">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-muted-foreground">{t("companySalesSummary")}</p>
                            <Tabs value={periodType} onValueChange={(period: "daily" | "weekly" | "monthly") => setPeriodType(period)}>
                                <TabsList variant="line">
                                    <TabsTrigger value="daily">{t("daily")}</TabsTrigger>
                                    <TabsTrigger value="weekly">{t("weekly")}</TabsTrigger>
                                    <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <DataTable columns={companySalesColumns} data={companySalesData} groupBy={["period", "company_name"]} />
                    </TabsContent>
                    <TabsContent value="itemSales">
                        <div className="flex justify-between items-center mb-4 gap-4">
                            <p className="text-sm text-muted-foreground">{t("itemSalesPerformance")}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{t("startDate")}</span>
                                    <DatePicker
                                        date={dateRange.start}
                                        setDate={(val) => setDateRange(prev => ({ ...prev, start: val }))}
                                        className="w-36 h-8 text-xs standard-digits"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{t("endDate")}</span>
                                    <DatePicker
                                        date={dateRange.end}
                                        setDate={(val) => setDateRange(prev => ({ ...prev, end: val }))}
                                        className="w-36 h-8 text-xs standard-digits"
                                    />
                                </div>
                            </div>
                        </div>
                        <DataTable columns={itemSalesColumns} data={itemSalesData} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}