import type { ColumnDef } from "@tanstack/react-table"
import type { ViewCompanySale } from "@types"


export const getCompanySalesColumns = (t: (key: string) => string): ColumnDef<ViewCompanySale>[] => [
    {
        accessorKey: "period",
        header: t("period"),
        enableGrouping: true,
    },
    {
        accessorKey: "company_name",
        header: t("companyName"),
        enableGrouping: true,
    },
    {
        accessorKey: "item",
        header: t("item"),
    },
    {
        accessorKey: "quantity",
        header: t("quantity"),
        cell: (info) => <span className="standard-digits">{String(info.getValue())}</span>,
    },
    {
        accessorKey: "price",
        header: t("price"),
        cell: (info) => {
            const amount = info.getValue() as number
            return (
                <span className="standard-digits">{amount.toFixed(2)} {t("currency")}</span>
            )
        }
    },
    {
        accessorKey: "total_price",
        header: t("totalAmount"),
        cell: (info) => {
            const amount = info.getValue() as number
            return (
                <span className="standard-digits">{amount.toFixed(2)} {t("currency")}</span>
            )
        }
    },
    {
        accessorKey: "bills",
        header: t("bills"),
        cell: (info) => <span className="standard-digits">{String(info.getValue() || "")}</span>
    },
]