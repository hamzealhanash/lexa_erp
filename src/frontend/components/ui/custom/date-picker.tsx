import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { buttonVariants } from "@components/ui/button"
import { Calendar } from "@components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
    date: string
    setDate: (date: string) => void
    className?: string
    placeholder?: string
}

export function DatePicker({ date, setDate, className, placeholder }: DatePickerProps) {
    const selectedDate = date ? new Date(date) : undefined

    return (
        <Popover>
            <PopoverTrigger
                className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    className
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate && !isNaN(selectedDate.getTime()) 
                    ? format(selectedDate, "P") 
                    : <span>{placeholder || "Pick a date"}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setDate(format(d, "yyyy-MM-dd"))}
                />
            </PopoverContent>
        </Popover>
    )
}