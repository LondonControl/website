import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type UserProduct from '@/interfaces/UserProduct';
import axios from '@/lib/axios';

const handleDownloadFile = async (event: any, productId: String) => {
  event.preventDefault();

  await axios
    .get(`/api/products/${productId}/download`)
    .then((res) => {
      window.open(res.data.data, '_blank');
    })
    .catch(() => {
      toast.error('Something went wrong');
    });
};

export const DownloadsColumns: ColumnDef<UserProduct>[] = [
  {
    id: 'product_id',
    accessorKey: 'product.id',
    header: 'Product Id',
  },
  {
    id: 'title',
    accessorKey: 'product.title',
    header: 'Product',
    enableSorting: false,
  },
  {
    id: 'current_airac',
    accessorKey: 'product.current_airac',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          AIRAC
          <ArrowUpDown className="ml-1 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="block px-4">{row.getValue('current_airac')}</span>
      );
    },
    enableSorting: true,
  },
  {
    id: 'serial_key',
    accessorKey: 'serial_key',
    header: 'Serial Key',
    cell: ({ row }) => {
      const serialKey = row.getValue('serial_key');

      return <span>{String(serialKey == null ? 'N/A' : serialKey)}</span>;
    },
    enableSorting: false,
  },
  {
    id: 'download',
    header: () => <span className="block px-4">Download</span>,
    cell: ({ row }) => {
      const productId = row.getValue('product_id');

      return (
        <Button
          variant="link"
          onClick={(event) =>
            handleDownloadFile(event, String(productId) || '')
          }
        >
          Download
        </Button>
      );
    },
    enableSorting: false,
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DownloadsTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnVisibility: {
        product_id: false,
      },
    },
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter product..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
