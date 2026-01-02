"use client"

import type { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => ReactNode)
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <div className="border border-blue-100 rounded-lg overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50/50 hover:bg-blue-50/50">
            {columns.map((column, index) => (
              <TableHead key={index} className="font-semibold text-foreground">
                {column.header}
              </TableHead>
            ))}
            {(onEdit || onDelete) && (
              <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="text-center text-muted-foreground py-8"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-blue-50/30">
                {columns.map((column, index) => (
                  <TableCell key={index} className={column.className}>
                    {typeof column.accessor === "function" ? column.accessor(item) : String(item[column.accessor])}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="hover:bg-blue-100 hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item)}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
