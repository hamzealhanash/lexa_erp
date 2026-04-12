import { Badge } from "@components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { ViewRecord } from "@types"
import { format } from "date-fns"

export const getRecordsColumns = (t: (key: string) => string, isRTL: boolean): ColumnDef<ViewRecord>[] => [
    {
        accessorKey: "bill_id",
        header: t("billId"),
        cell: (info) => <span className="standard-digits">{String(info.getValue())}</span>
    },
    {
        accessorKey: "quantity",
        header: t("quantity"),
        cell: (info) => <span className="standard-digits">{String(info.getValue())}</span>
    },
    {
        accessorKey: "issue_date",
        header: t("issueDate"),
        cell: (info) => <span className={`standard-digits ${isRTL ? "text-end" : "text-start"}`} dir="ltr">
            {format(new Date(info.getValue() as string), "yyyy/MM/dd hh:mm aa")}
        </span>
    },
    {
        accessorKey: "store_name",
        header: t("store"),
    },
    {
        accessorKey: "total_bill",
        header: t("totalAmount"),
        cell: (info) => {
            const amount = info.getValue() as number
            return (
                <span className="standard-digits">{amount.toFixed(2)} {t("currency")}</span>
            )
        }
    },
    {
        accessorKey: "delivery_status",
        header: t("deliveryStatus"),
        cell: (info) => {
            const status = info.getValue()
            return (
                <Badge className={` ${status === "delivered"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                    }`}>
                    {status === "delivered" ? t("gotDelivery") : t("pending")}
                </Badge>
            )
        }
    },
    {
        accessorKey: "collection_status",
        header: t("collectionStatus"),
        cell: (info) => {
            const status = info.getValue()
            return (
                <Badge className={` ${status === "collected"
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                    }`}>
                    {status === "collected" ? t("gotCollected") : t("due")}
                </Badge>
            )
        }
    },
]
