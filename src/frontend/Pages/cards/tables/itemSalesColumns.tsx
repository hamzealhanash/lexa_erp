import type { ColumnDef } from "@tanstack/react-table"
import type { ViewItemSale } from "@types"

export const getItemSalesColumns = (t: (key: string) => string): ColumnDef<ViewItemSale>[] => {
    return [
        {
            accessorKey: "item",
            header: t("item"),

        },
        {
            accessorKey: "total_quantity",
            header: t("totalQuantity"),
            cell: (info) => <span className="standard-digits">{String(info.getValue())}</span>
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
            accessorKey: "total_revenue",
            header: t("totalRevenue"),
            cell: (info) => {
                const amount = info.getValue() as number
                return (
                    <span className="standard-digits">{amount.toFixed(2)} {t("currency")}</span>
                )
            }
        },
        {
            accessorKey: "note",
            header: t("note")

        }
    ]
}