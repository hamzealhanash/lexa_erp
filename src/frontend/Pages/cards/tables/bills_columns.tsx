import type { ColumnDef } from "@tanstack/react-table"
import type { bill } from "@types"
import { Button } from "@components/ui/button"
import { toast } from "sonner"

export const getBillsColumns = (t: (key: string) => string): ColumnDef<bill>[] => [
    {
        accessorKey: "bill_id",
        header: t("billId"),
    },
    {
        accessorKey: "seller",
        header: t("seller"),
    },
    {
        accessorKey: "store_name",
        header: t("storeName"),
    },
    {
        accessorKey: "total_bill",
        header: t("totalAmount"),
        cell: (info) => (
            <span className="standard-digits">{info.getValue() as number} {t("currency")}</span>
        )
    },
    {
        id: "action",
        header: t("action"),
        cell: (info) => {
            const bill = info.row.original;
            return (
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                        const printPromise = new Promise(async (resolve, reject) => {
                            const result = await window.electron.printBill(bill);
                            result.success ? resolve(result) : reject(result.error)
                        })

                        toast.promise(printPromise, {
                            loading: t("printingBill"),
                            success: t("billPrintedSuccess"),
                            error: t("billPrintedError"),
                        })
                    }}>
                    {t("printTheBill")}
                </Button>
            )
        }
    }
]