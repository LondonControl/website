import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  Eye,
  EyeOff,
  Settings2,
  X,
} from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const getColumnLabel = (col: {
  id: string;
  columnDef: { header?: unknown; meta?: unknown };
}): string => {
  const meta = col.columnDef.meta as Record<string, string> | undefined;
  if (meta?.label) return meta.label;
  if (typeof col.columnDef.header === 'string') return col.columnDef.header;
  return col.id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const downloadFile = async (productId: string) => {
  await axios
    .get(`/api/products/${productId}/download`)
    .then((res) => {
      window.open(res.data.data, '_blank');
    })
    .catch(() => {
      toast.error('Something went wrong');
    });
};

const DownloadCell = ({ productId }: { productId: string }) => {
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    setLoading(true);
    await downloadFile(productId);
    setLoading(false);
  };

  return (
    <button
      type="button"
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? 'Preparing...' : 'Download'}
      <Download className={`size-3.5 ${loading ? 'animate-bounce' : ''}`} />
    </button>
  );
};

const SerialKeyCell = ({ value }: { value: string | null }) => {
  const [revealed, setRevealed] = React.useState(false);
  if (value == null)
    return (
      <span className="font-jetbrains text-sm text-muted-foreground">N/A</span>
    );
  return (
    <div className="flex items-center gap-2">
      <span className="font-jetbrains text-sm text-muted-foreground">
        {revealed ? value : '•'.repeat(Math.min(value.length, 24))}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="cursor-pointer text-muted-foreground/60 transition-colors hover:text-foreground"
        aria-label={revealed ? 'Hide serial key' : 'Reveal serial key'}
      >
        {revealed ? (
          <EyeOff className="size-3.5" />
        ) : (
          <Eye className="size-3.5" />
        )}
      </button>
    </div>
  );
};

const SortIcon = ({ column }: { column: any }) => {
  if (column.getIsSorted() === 'asc')
    return <ArrowUp className="ml-1 size-3 shrink-0" />;
  if (column.getIsSorted() === 'desc')
    return <ArrowDown className="ml-1 size-3 shrink-0" />;
  return <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-40" />;
};

export const DownloadsColumns: ColumnDef<UserProduct>[] = [
  {
    id: 'product_id',
    accessorKey: 'product.id',
    header: 'Product Id',
    enableHiding: false,
    enableGlobalFilter: false,
  },
  {
    id: 'title',
    accessorKey: 'product.title',
    meta: { label: 'Product' },
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center gap-0.5 text-xs uppercase tracking-[0.1em] hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Product
        <SortIcon column={column} />
      </button>
    ),
    enableSorting: true,
  },
  {
    id: 'current_airac',
    accessorKey: 'product.current_airac',
    meta: { label: 'AIRAC' },
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center gap-0.5 text-xs uppercase tracking-[0.1em] hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        AIRAC
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-jetbrains text-sm">
        {row.getValue('current_airac')}
      </span>
    ),
    enableSorting: true,
  },
  {
    id: 'serial_key',
    accessorKey: 'serial_key.key',
    header: 'Serial Key',
    cell: ({ row }) => (
      <SerialKeyCell value={row.getValue('serial_key') as string | null} />
    ),
    enableSorting: false,
  },
  {
    id: 'download',
    meta: { label: 'Download' },
    header: 'Download',
    cell: ({ row }) => {
      const productId = row.getValue('product_id');
      return <DownloadCell productId={String(productId) || ''} />;
    },
    enableSorting: false,
    enableGlobalFilter: false,
  },
];

interface DataTableProps {
  columns: ColumnDef<UserProduct>[];
  data: UserProduct[];
}

export function DownloadsTable({ columns, data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const up = row.original;
      return (
        (up.product?.title?.toLowerCase().includes(search) ?? false) ||
        (up.product?.current_airac?.toLowerCase().includes(search) ?? false)
      );
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      columnVisibility: { product_id: false },
    },
  });

  const globalFilter = (table.getState().globalFilter as string) ?? '';
  const hasActiveFilters = !!globalFilter;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search products..."
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-9 w-48"
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-muted-foreground"
            onClick={() => table.setGlobalFilter('')}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Settings2 className="size-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(val)}
                >
                  {getColumnLabel(col)}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="ml-auto text-sm text-muted-foreground">
          {totalFiltered} product{totalFiltered !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
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
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No downloads found.
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => table.setGlobalFilter('')}
                      className="ml-1 cursor-pointer underline underline-offset-2 hover:text-foreground"
                    >
                      Clear filters
                    </button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {Math.max(pageCount, 1)}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
