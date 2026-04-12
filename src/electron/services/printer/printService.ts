import electronPosPrinter from "electron-pos-printer";
import type { PosPrintData, PosPrintOptions } from "electron-pos-printer";
import path from "path";
import { app } from "electron";
import { bill } from "@/src/global-types.js"

const { PosPrinter } = electronPosPrinter;

export default async function printBill(data: bill) {


    const testData: PosPrintData[] = [
        // ─── Header ───
        {
            type: 'table',
            style: { width: '100%', borderCollapse: 'collapse' },
            tableBody: [
                [
                    {
                        type: 'image',
                        path: path.join(app.getAppPath(), 'src/electron/services/printer/resources/icon.png'),
                        width: '28px',
                        height: '28px',
                        style: { filter: 'grayscale(100%)' }
                    },
                    {
                        type: 'text',
                        value: 'Lexa ERP',
                        style: { fontWeight: '700', fontSize: '22px', verticalAlign: 'middle' }
                    }
                ]
            ],
            tableBodyStyle: { border: 'none' },
            tableHeaderStyle: { border: 'none' },
            tableFooterStyle: { border: 'none' },
        },
        // ─── Bill Details ───
        {
            type: 'table',
            style: { width: '100%', marginTop: '8px', borderCollapse: 'collapse', fontSize: '12px' },
            tableBody: [
                [String(data.bill_id), '#', 'الفاتورة'],
                [data.issue_date, ':', 'التاريخ'],
                [data.location || 'N/A', ':', 'الموقع'],
                [data.seller || 'N/A', ':', 'البائع'],
                [data.store_name || 'N/A', ':', 'المتجر'],
                [String(data.total_quantity), ':', 'الكمية'],
                [String(data.total_bill), ':', 'المجموع'],
            ],
            tableBodyStyle: { border: 'none', textAlign: 'right' },
            tableHeaderStyle: { border: 'none' },
            tableFooterStyle: { border: 'none' },
        },
        // ─── Items Table ───
        {
            type: 'table',
            style: { width: '100%', marginTop: '6px', border: '1px solid #ddd' },
            tableHeader: ['المجموع', 'الكمية', 'السعر', 'الصنف'],
            tableBody: [
                ['20', '2', '10', 'Cat'],
                ['80', '4', '20', 'Dog'],
                ['360', '12', '30', 'Horse'],
                ['160', '4', '40', 'Pig'],
            ],
            tableHeaderStyle: { backgroundColor: '#000', color: 'white' },
            tableBodyStyle: { border: '0.5px solid #ddd' },
            tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        },
        // ─── Barcode ───
        {
            type: 'barCode',
            value: String(data.bill_id),
            position: 'center',
            height: '40',
            width: '2',
            displayValue: false,
            fontsize: 12,
        }
    ]

    const options: PosPrintOptions = {
        preview: true,
        margin: '0 0 0 0',
        copies: 1,
        printerName: 'XP-80C',
        timeOutPerLine: 400,
        pageSize: '80mm',
        boolean: true
    }

    let result: { success: boolean, error?: string } = { success: false, error: "" }
    await PosPrinter.print(testData, options)
        .then(() => {
            result = { success: true }
        })
        .catch((error: any) => {
            console.error("Print Error", error)
            result = { success: false, error: error }
        })
    return result

}