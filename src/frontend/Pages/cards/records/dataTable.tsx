import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getGroupedRowModel,
    getExpandedRowModel,
    type GroupingState,
    type ExpandedState
} from "@tanstack/react-table"
import { useTranslation } from "@/lib/language-context"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"

interface DataTableProps<TData, TValue> { columns: ColumnDef<TData, TValue>[]; data: TData[]; groupBy?: string[] }

export default function DataTable<TData, TValue>({ data, columns, groupBy = [] }: DataTableProps<TData, TValue>) {

    const { t } = useTranslation()

    // Manage grouping and expanded states
    const [grouping, setGrouping] = useState<GroupingState>(groupBy)
    const [expanded, setExpanded] = useState<ExpandedState>(true)
    const tableRef = useRef<HTMLDivElement>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const table = useReactTable({
        data,
        columns,
        state: {
            grouping,
            expanded,
        },
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })
    const rowVirtualizer = useVirtualizer({
        count: isMounted ? table.getRowModel().rows.length : 0,
        getScrollElement: () => tableRef.current,
        estimateSize: () => 48,
        initialRect: { width: 0, height: 540 },
    })

    return (
        <div className="overflow-auto bg-background rounded-xl p-5 max-h-135" ref={tableRef}>
            <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm shadow-sm">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {rowVirtualizer.getVirtualItems().length > 0 ? (
                        <>
                            {rowVirtualizer.getVirtualItems()[0].start > 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getVisibleLeafColumns().length}
                                        style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }}
                                    />
                                </TableRow>
                            )}
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const row = table.getRowModel().rows[virtualRow.index]
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={`${row.getIsGrouped() ? "bg-muted/50 font-medium" : ""} h-12 w-full`}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                                {cell.getIsGrouped() ? (
                                                    <div className="flex items-center gap-2 cursor-pointer" onClick={row.getToggleExpandedHandler()}>
                                                        {row.getIsExpanded() ? (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        <span className="text-muted-foreground text-xs font-normal bg-primary/10 px-2 py-0.5 rounded-full ml-1">
                                                            {row.subRows.length} Items
                                                        </span>
                                                    </div>
                                                ) : cell.getIsAggregated() ? (
                                                    flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                                                ) : cell.getIsPlaceholder() ? null : (
                                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })}
                            {rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end > 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getVisibleLeafColumns().length}
                                        style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }}
                                    />
                                </TableRow>
                            )}
                        </>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                {t("noResults")}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
