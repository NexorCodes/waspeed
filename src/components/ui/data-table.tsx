'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface DataTableProps<T> {
  columns: {
    key: string;
    title: string;
    render?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  loading?: boolean;
}

export function DataTable<T>({ columns, data, loading = false }: DataTableProps<T>) {
  return (
    <div className="rounded-md border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="text-gray-400">
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-gray-300">
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-400">
                Nenhum dado encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 