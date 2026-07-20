# Plan 010: Extract a shared `DataTable` shell from OrdersTable/DownloadsTable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat bb7488e..HEAD -- src/components/Tables/OrdersTable.tsx src/components/Tables/DownloadsTable.tsx`
> If either file changed since this plan was written, compare the "Current
> state" excerpts below against the live files before proceeding; on a
> mismatch, treat it as a STOP condition — this plan gives full target
> file replacements below, and if the starting point has drifted, those
> targets may no longer be correct.
>
> **This is a behavior-preserving refactor, not a bug fix.** The done
> criteria are strict about visual/behavioral parity — if you're unsure
> whether a change preserves behavior, prefer the STOP conditions over
> guessing.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — touches the two largest, most-visited authenticated
  pages in the app (orders, downloads); a subtle JSX mistake could break
  filtering, sorting, pagination, or row expansion without a build/type
  error, since most of the logic here is expressed as JSX structure, not
  business logic a typechecker would catch.
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `bb7488e`, 2026-07-20

## Why this matters

`src/components/Tables/OrdersTable.tsx` (437 lines) and
`src/components/Tables/DownloadsTable.tsx` (389 lines) are the two largest
files in the repository — both grew substantially in the same commit
(`e871120`, the large AI-assisted refactor). Comparing them line by line,
they duplicate near-identical implementations of:

- `PAGE_SIZE_OPTIONS` (byte-for-byte identical constant)
- `getColumnLabel` (byte-for-byte identical function)
- `SortIcon` (byte-for-byte identical component)
- The entire toolbar JSX shape (search input, columns-visibility dropdown,
  clear-filters button, result count)
- The entire pagination footer JSX shape (rows-per-page select, page
  counter, prev/next buttons)
- Most of the `<Table>`/`<TableHeader>`/`<TableBody>` rendering structure

The two genuine differences are: Orders has a status `<Select>` filter and
supports expandable rows (showing order line-items); Downloads has neither.
Everything else is copy-pasted. Any future table in this app (and there's
a natural candidate — a documents/utilities admin view someday) would
almost certainly triple this duplication instead of reusing it, and the
two existing copies will keep silently drifting apart (they already have:
Orders' toolbar order is Input → Columns → Select → Clear; Downloads' is
Input → Clear → Columns).

This plan extracts a shared `DataTable` shell component that both
`OrdersTable` and `DownloadsTable` compose against, using props/render-slots
for the two points of genuine difference (an optional extra toolbar
control, and an optional expanded-row renderer).

## Current state

Both files are large; full current content is in the repo at
`src/components/Tables/OrdersTable.tsx` and
`src/components/Tables/DownloadsTable.tsx` (as of commit `bb7488e`) — read
them directly before starting rather than relying solely on this plan's
summary, to build the mental model this refactor needs. Key facts this
plan's target implementation depends on:

- Both files define `PAGE_SIZE_OPTIONS = [10, 25, 50]`, `getColumnLabel`,
  and `SortIcon` identically.
- `OrdersTable`'s `useReactTable` call includes
  `getExpandedRowModel: getExpandedRowModel()` and
  `getRowCanExpand: (row) => (row.original.items?.length ?? 0) > 0` —
  `DownloadsTable`'s does not use expansion at all.
- `OrdersTable`'s toolbar has an extra `<Select>` for filtering by
  `order.status.code`, built from a `statusOptions` memo derived from
  `data`.
- `OrdersTable`'s `clearFilters` clears both the global filter and the
  status column filter; `DownloadsTable`'s only clears the global filter.
  `table.resetColumnFilters()` (a built-in `@tanstack/react-table` table
  method) is a safe generalization of both — it resets whatever column
  filters exist (one, for Orders; zero, for Downloads) without either
  table needing to know about the other's specific filter.
- `OrdersTable`'s header/cell for the `'expander'` column gets an extra
  `w-8 px-2` className; nothing else does.
- Each file exports its own `<Table>ColumnDef<T>[]` array
  (`OrdersColumns`, `DownloadsColumns`) — these are **consumed by
  `src/pages/orders/index.tsx`
  and `src/pages/downloads.tsx`** respectively (`import { OrdersColumns }
  from '@/components/Tables/OrdersTable'` and similarly for
  `DownloadsColumns`) — these exports and their consumers must keep
  working unchanged; this plan does not touch either page file.

## Commands you will need

| Purpose   | Command                                                                          | Expected on success |
|-----------|-------------------------------------------------------------------------------------|---------------------|
| Typecheck | `npm run check-types`                                                                | exit 0, no errors   |
| Tests     | `npx jest src/components/Tables src/pages/orders.test.tsx src/pages/downloads.test.tsx` (only the ones that exist — see Step 4) | all pass |
| Lint      | `npx eslint src/components/Tables/DataTable.tsx src/components/Tables/OrdersTable.tsx src/components/Tables/DownloadsTable.tsx` | exit 0, no errors |

Do not run `npm run lint` (repo-wide) or `npm test` (full suite, 15%
coverage gate) — use the targeted commands above.

## Scope

**In scope** (the only files you should modify):
- `src/components/Tables/DataTable.tsx` (create)
- `src/components/Tables/OrdersTable.tsx` (rewrite)
- `src/components/Tables/DownloadsTable.tsx` (rewrite)
- `src/components/Tables/DataTable.test.tsx` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/pages/orders/index.tsx`, `src/pages/downloads.tsx` — they import
  `OrdersTable`/`OrdersColumns` and `DownloadsTable`/`DownloadsColumns`;
  those export names and shapes are unchanged by this plan, so these pages
  need no changes. If you find yourself wanting to edit them, that means
  something about the export shape changed and you've drifted from this
  plan — stop and reconsider instead.
- `src/components/OrderCard/index.tsx`, `src/components/DownloadCard/index.tsx`
  — unrelated (and dead — see `plans/015-remove-dead-card-components.md`).
- `src/components/OrderCard/OrderStatusBadge.tsx` — used by
  `OrdersTable.tsx`, read-only reference, not modified.

## Git workflow

- Branch: `advisor/010-dedupe-data-tables`
- Commit message style: Conventional Commits (e.g. `refactor: extract
  shared DataTable shell from OrdersTable and DownloadsTable`)
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the shared `DataTable` component

Create `src/components/Tables/DataTable.tsx`:

```tsx
import type { ColumnDef, Row, Table as TanstackTable } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, Settings2, X } from 'lucide-react';
import React from 'react';

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

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const getColumnLabel = (col: {
  id: string;
  columnDef: { header?: unknown; meta?: unknown };
}): string => {
  const meta = col.columnDef.meta as Record<string, string> | undefined;
  if (meta?.label) return meta.label;
  if (typeof col.columnDef.header === 'string') return col.columnDef.header;
  return col.id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const SortIcon = ({ column }: { column: any }) => {
  if (column.getIsSorted() === 'asc')
    return <ArrowUp className="ml-1 size-3 shrink-0" />;
  if (column.getIsSorted() === 'desc')
    return <ArrowDown className="ml-1 size-3 shrink-0" />;
  return <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-40" />;
};

interface DataTableShellProps<TData> {
  table: TanstackTable<TData>;
  columns: ColumnDef<TData>[];
  searchPlaceholder: string;
  itemLabelSingular: string;
  itemLabelPlural: string;
  noResultsMessage: string;
  toolbarExtra?: React.ReactNode;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  expanderColumnId?: string;
}

export function DataTable<TData>({
  table,
  columns,
  searchPlaceholder,
  itemLabelSingular,
  itemLabelPlural,
  noResultsMessage,
  toolbarExtra,
  renderExpandedRow,
  expanderColumnId,
}: DataTableShellProps<TData>) {
  const globalFilter = (table.getState().globalFilter as string) ?? '';
  const hasActiveFilters =
    !!globalFilter || table.getState().columnFilters.length > 0;

  const clearFilters = () => {
    table.setGlobalFilter('');
    table.resetColumnFilters();
  };

  const totalFiltered = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={searchPlaceholder}
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

        {toolbarExtra}

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
          {totalFiltered}{' '}
          {totalFiltered !== 1 ? itemLabelPlural : itemLabelSingular}
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
                    className={`text-xs uppercase tracking-[0.1em] text-muted-foreground${header.id === expanderColumnId ? ' w-8 px-2' : ''}`}
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
                          cell.column.id === expanderColumnId
                            ? 'w-8 px-2'
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderExpandedRow && row.getIsExpanded() && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={columns.length} className="py-0">
                        {renderExpandedRow(row)}
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
                  {noResultsMessage}
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
```

**Verify**: `npm run check-types` → will still show errors until Steps 2-3
update the two callers — that's expected at this point; re-run after Step
3.

### Step 2: Rewrite `OrdersTable.tsx` to compose `DataTable`

Replace the **entire file** with:

```tsx
import type { ColumnDef } from '@tanstack/react-table';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs from 'dayjs';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import OrderStatusBadge from '@/components/OrderCard/OrderStatusBadge';
import { DataTable, SortIcon } from '@/components/Tables/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type Order from '@/interfaces/Order';
import type OrderItem from '@/interfaces/OrderItem';
import type OrderStatus from '@/interfaces/OrderStatus';

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

  const statusFilter =
    (table.getColumn('status')?.getFilterValue() as string) ?? '';

  return (
    <DataTable
      table={table}
      columns={columns}
      searchPlaceholder="Search orders..."
      itemLabelSingular="order"
      itemLabelPlural="orders"
      noResultsMessage="No orders found."
      expanderColumnId="expander"
      toolbarExtra={
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
      }
      renderExpandedRow={(row) => (
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
      )}
    />
  );
}
```

**Verify**: `npm run check-types` → no errors attributable to
`OrdersTable.tsx` (errors from `DownloadsTable.tsx` are still expected
until Step 3).

### Step 3: Rewrite `DownloadsTable.tsx` to compose `DataTable`

Replace the **entire file** with:

```tsx
import type { ColumnDef } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Download, Eye, EyeOff } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { DataTable, SortIcon } from '@/components/Tables/DataTable';
import type UserProduct from '@/interfaces/UserProduct';
import axios from '@/lib/axios';

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

  return (
    <DataTable
      table={table}
      columns={columns}
      searchPlaceholder="Search products..."
      itemLabelSingular="product"
      itemLabelPlural="products"
      noResultsMessage="No downloads found."
    />
  );
}
```

**Verify**: `npm run check-types` → exit 0, no errors anywhere in
`src/components/Tables/`.

### Step 4: Lint

**Verify**: `npx eslint src/components/Tables/DataTable.tsx src/components/Tables/OrdersTable.tsx src/components/Tables/DownloadsTable.tsx` → exit 0, no errors.

### Step 5: Add tests for the shared `DataTable`

There is no existing test file for either table today. Create
`src/components/Tables/DataTable.test.tsx` covering the shell in
isolation with a minimal fake column/data set — this is more valuable
than page-level tests here because it directly exercises the extracted
logic (filtering, pagination, expansion) once instead of twice.

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from './DataTable';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
];

const data: Row[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];

function TestTable({ rows = data }: { rows?: Row[] }) {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) =>
      row.original.name.toLowerCase().includes(filterValue.toLowerCase()),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  return (
    <DataTable
      table={table}
      columns={columns}
      searchPlaceholder="Search..."
      itemLabelSingular="item"
      itemLabelPlural="items"
      noResultsMessage="No items found."
    />
  );
}

describe('DataTable', () => {
  it('renders all rows with no filter applied', () => {
    render(<TestTable />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('filters rows via the search input', () => {
    render(<TestTable />);

    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'alpha' },
    });

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('shows the no-results message and a clear-filters affordance when a filter matches nothing', () => {
    render(<TestTable />);

    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'nonexistent' },
    });

    expect(screen.getByText('No items found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('shows an empty state message when there is no data at all', () => {
    render(<TestTable rows={[]} />);

    expect(screen.getByText('No items found.')).toBeInTheDocument();
  });
});
```

**Verify**: `npx jest src/components/Tables/DataTable.test.tsx` → all pass (4 tests).

### Step 6: Manual visual comparison (no automated test can catch layout regressions)

Since neither `OrdersTable` nor `DownloadsTable` had any test coverage
before this plan (confirmed by the audit — `TEST-01`), there's no
automated regression guard for their actual rendered output beyond what
Step 5 adds for the shared shell in isolation. Start the dev server (`npm
run dev`) and manually compare `/orders/` and `/downloads/` against your
memory of (or a `git stash`-based side-by-side with) the pre-refactor
version:

- Search filtering still works on both pages.
- The Columns-visibility dropdown still toggles columns on both pages.
- Orders: the status filter `<Select>` still filters; row expansion
  (chevron click) still shows/hides line items; the "Clear" button clears
  both the search and status filter together.
- Downloads: the serial-key reveal/hide toggle and the per-row Download
  button still work.
- Pagination (rows-per-page, prev/next, page counter) works identically
  on both pages.

Stop the dev server when done. There's no scripted "expected output" for
this step beyond "behaves the same as before" — use your judgment, and if
anything looks different, treat it as this plan's problem to fix (if the
cause is clear) or a STOP condition (if it's not).

## Test plan

- New file: `src/components/Tables/DataTable.test.tsx`, covering: renders
  all rows unfiltered; filters via the search input and updates the count
  label; shows the no-results message with a working "Clear filters"
  button when a filter matches nothing; shows the same empty state when
  there's no data at all.
- No test files existed for either table before this plan (a
  `TEST-01`-flagged gap) — this plan's `DataTable.test.tsx` is a net new
  addition, not a replacement for something that existed.
- Verification: `npx jest src/components/Tables/DataTable.test.tsx` → all pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check-types` exits 0
- [ ] `npx jest src/components/Tables/DataTable.test.tsx` exits 0, 4 tests pass
- [ ] `npx eslint src/components/Tables/DataTable.tsx src/components/Tables/OrdersTable.tsx src/components/Tables/DownloadsTable.tsx` exits 0
- [ ] `OrdersColumns` and `DownloadsColumns` are still exported with their
      original names from their original file paths (`grep -n "export const OrdersColumns" src/components/Tables/OrdersTable.tsx` and the equivalent for Downloads both match)
- [ ] `OrdersTable` and `DownloadsTable` are still exported with their
      original names from their original file paths
- [ ] Manual visual comparison (Step 6) completed with no observed
      behavioral differences
- [ ] No files outside the in-scope list are modified (`git status`) —
      in particular, confirm `src/pages/orders/index.tsx` and
      `src/pages/downloads.tsx` are untouched
- [ ] `plans/README.md` status row for plan 010 updated

## STOP conditions

Stop and report back (do not improvise) if:

- The live files don't match the "Current state" section's description of
  their structure (the codebase has drifted since this plan was written).
- `OrdersColumns`/`DownloadsColumns`/`OrdersTable`/`DownloadsTable` are
  imported anywhere in the codebase beyond `src/pages/orders/index.tsx`
  and `src/pages/downloads.tsx` — grep for `from '@/components/Tables/OrdersTable'` and `from '@/components/Tables/DownloadsTable'` across `src/` before starting to confirm this; if there are other importers, the "out of scope" list above may be incomplete.
- The manual visual comparison in Step 6 reveals a behavioral difference
  you can't confidently attribute to a specific line in your rewrite.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Any future table in this app should compose `DataTable` from the start
  rather than copy-pasting `OrdersTable.tsx`/`DownloadsTable.tsx` again —
  that's the entire point of this refactor.
- If a future table needs a toolbar shape `DataTable`'s current
  `toolbarExtra` slot can't express (e.g. two extra controls instead of
  one), extend the slot to accept an array or multiple named slots rather
  than reintroducing per-page toolbar duplication.
- `plans/020-expand-critical-path-test-coverage.md` (if executed) should
  add page-level tests for `orders/index.tsx` and `downloads.tsx`
  specifically — this plan's `DataTable.test.tsx` covers the shared shell
  in isolation, not the full page integration (auth gating, SWR loading
  states, etc.).
