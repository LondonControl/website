import type { ColumnDef } from '@tanstack/react-table';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Settings2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import OrderStatusBadge from '@/components/OrderCard/OrderStatusBadge';
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
import type Order from '@/interfaces/Order';
import type OrderItem from '@/interfaces/OrderItem';
import type OrderStatus from '@/interfaces/OrderStatus';

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

const SortIcon = ({ column }: { column: any }) => {
  if (column.getIsSorted() === 'asc')
    return <ArrowUp className="ml-1 size-3 shrink-0" />;
  if (column.getIsSorted() === 'desc')
    return <ArrowDown className="ml-1 size-3 shrink-0" />;
  return <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-40" />;
};

export const OrdersColumns: ColumnDef<Order>[] = [
  {
    id: 'expander',
    header: () => null,
    enableHiding: false,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          type="button"
          onClick={row.getToggleExpandedHandler()}
          className="flex cursor-pointer items-center text-muted-foreground/60 transition-colors hover:text-foreground"
          aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
      ) : null,
    enableSorting: false,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'number',
    header: 'Order #',
  },
  {
    accessorKey: 'created_at',
    meta: { label: 'Date Placed' },
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center gap-0.5 text-xs uppercase tracking-[0.1em] hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date Placed
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <time dateTime={dayjs(row.getValue('created_at')).toISOString()}>
        {dayjs(row.getValue('created_at')).format('DD MMM YYYY, HH:mm')}
      </time>
    ),
    enableSorting: true,
    sortingFn: 'datetime',
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'amount',
    meta: { label: 'Total' },
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center gap-0.5 text-xs uppercase tracking-[0.1em] hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Total
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => (
      <span className="font-jetbrains font-medium">
        £{(row.getValue('amount') as number) / 100}
      </span>
    ),
    enableSorting: true,
    enableGlobalFilter: false,
  },
  {
    accessorKey: 'status',
    meta: { label: 'Status' },
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center gap-0.5 text-xs uppercase tracking-[0.1em] hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <SortIcon column={column} />
      </button>
    ),
    cell: ({ row }) => <OrderStatusBadge status={row.getValue('status')} />,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.status?.code ?? '';
      const b = rowB.original.status?.code ?? '';
      return a.localeCompare(b);
    },
    filterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const status = row.getValue('status') as OrderStatus;
      return status?.code === filterValue;
    },
    enableGlobalFilter: false,
  },
];

interface DataTableProps {
  columns: ColumnDef<Order>[];
  data: Order[];
}

export function OrdersTable({ columns, data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => (row.original.items?.length ?? 0) > 0,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const order = row.original;
      return (
        (order.number?.toLowerCase().includes(search) ?? false) ||
        (order.status?.name?.toLowerCase().includes(search) ?? false) ||
        (order.status?.code?.toLowerCase().includes(search) ?? false)
      );
    },
    initialState: {
      sorting: [{ id: 'created_at', desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  });

  const statusOptions = React.useMemo(() => {
    const seen = new Map<string, string>();
    data.forEach((order) => {
      if (order.status?.code && !seen.has(order.status.code)) {
        seen.set(order.status.code, order.status.name);
      }
    });
    return Array.from(seen.entries()).map(([code, name]) => ({
      value: code,
      label: name,
    }));
  }, [data]);

  const globalFilter = (table.getState().globalFilter as string) ?? '';
  const statusFilter =
    (table.getColumn('status')?.getFilterValue() as string) ?? '';
  const hasActiveFilters = !!statusFilter || !!globalFilter;

  const clearFilters = () => {
    table.setGlobalFilter('');
    table.getColumn('status')?.setFilterValue('');
  };

  const totalFiltered = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search orders..."
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-9 w-48"
        />

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

        <Select
          value={statusFilter || 'all'}
          onValueChange={(val) =>
            table.getColumn('status')?.setFilterValue(val === 'all' ? '' : val)
          }
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}

        <span className="ml-auto text-sm text-muted-foreground">
          {totalFiltered} order{totalFiltered !== 1 ? 's' : ''}
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
                    className={`text-xs uppercase tracking-[0.1em] text-muted-foreground${header.id === 'expander' ? ' w-8 px-2' : ''}`}
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
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === 'expander' ? 'w-8 px-2' : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={columns.length} className="py-0">
                        <ul className="divide-y divide-border py-2">
                          {row.original.items?.map((item: OrderItem) => (
                            <li
                              key={item.id}
                              className="flex items-center justify-between py-2 text-sm"
                            >
                              <Link
                                href={`/products/${item.product?.id}`}
                                className="font-medium hover:underline"
                              >
                                {item.product?.title}
                              </Link>
                              <span className="font-jetbrains text-muted-foreground">
                                £{item.actual_price / 100}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No orders found.
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
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
