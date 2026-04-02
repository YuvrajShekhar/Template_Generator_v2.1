import * as React from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Mail,
    CheckCircle2,
    XCircle,
    CalendarDays,
} from "lucide-react";
import {
    Button,
    Input,
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@shared/components/ui";
import { cn } from "@shared/utils/cn";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DispatchRecord {
    civility: string;  // Already converted to "Herr"/"Frau" by backend
    firstname: string;
    lastname: string;
    email: string;
    Sent: string;      // "Yes" | "No"
    Date: string;
}

interface DispatchTableProps {
    records: DispatchRecord[];
    isLoading?: boolean;
    isError?: boolean;
}

type SortField = keyof DispatchRecord;
type SortDirection = "asc" | "desc" | null;

interface Filters {
    civility: string;
    firstname: string;
    lastname: string;
    email: string;
    sent: string;       // "all" | "Yes" | "No"
    dateFrom: string;
    dateTo: string;
}

const DEFAULT_FILTERS: Filters = {
    civility: "",
    firstname: "",
    lastname: "",
    email: "",
    sent: "all",
    dateFrom: "",
    dateTo: "",
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse date strings like "25-Mar-26" into a comparable Date object */
const MONTH_MAP: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split("-");
    if (parts.length === 3) {
        const day = parseInt(parts[0] ?? "", 10);
        const month = MONTH_MAP[(parts[1] ?? "").toLowerCase()];
        const yearRaw = parts[2] ?? "";
        const year = yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10);

        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/** Format "25-Mar-26" to a nicer display: "25. März 2026" */
function formatDateDisplay(dateStr: string): string {
    const d = parseDate(dateStr);
    if (!d) return dateStr;
    return d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DispatchTable({ records, isLoading, isError }: DispatchTableProps) {
    const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(50);
    const [sortField, setSortField] = React.useState<SortField | null>("Date");
    const [sortDir, setSortDir] = React.useState<SortDirection>("desc");

    // Reset to page 1 whenever filters or pageSize change
    React.useEffect(() => {
        setPage(1);
    }, [filters, pageSize]);

    // ── Filter logic ──────────────────────────────────────────────────────────

    const filtered = React.useMemo(() => {
        return records.filter((r) => {
            if (
                filters.civility &&
                !r.civility.toLowerCase().includes(filters.civility.toLowerCase())
            )
                return false;

            if (
                filters.firstname &&
                !r.firstname.toLowerCase().includes(filters.firstname.toLowerCase())
            )
                return false;

            if (
                filters.lastname &&
                !r.lastname.toLowerCase().includes(filters.lastname.toLowerCase())
            )
                return false;

            if (
                filters.email &&
                !r.email.toLowerCase().includes(filters.email.toLowerCase())
            )
                return false;

            if (filters.sent !== "all" && r.Sent !== filters.sent) return false;

            if (filters.dateFrom) {
                const rowDate = parseDate(r.Date);
                const fromDate = new Date(filters.dateFrom);
                if (!rowDate || rowDate < fromDate) return false;
            }

            if (filters.dateTo) {
                const rowDate = parseDate(r.Date);
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59);
                if (!rowDate || rowDate > toDate) return false;
            }

            return true;
        });
    }, [records, filters]);

    // ── Sort logic ────────────────────────────────────────────────────────────

    const sorted = React.useMemo(() => {
        if (!sortField || !sortDir) return filtered;
        return [...filtered].sort((a, b) => {
            let aVal: string | Date = a[sortField];
            let bVal: string | Date = b[sortField];

            // Date-aware sort for the Date column
            if (sortField === "Date") {
                const aDate = parseDate(a.Date);
                const bDate = parseDate(b.Date);
                if (aDate && bDate) {
                    return sortDir === "asc"
                        ? aDate.getTime() - bDate.getTime()
                        : bDate.getTime() - aDate.getTime();
                }
            }

            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
    }, [filtered, sortField, sortDir]);

    // ── Pagination ────────────────────────────────────────────────────────────

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const pageEnd = Math.min(pageStart + pageSize, sorted.length);
    const paginated = sorted.slice(pageStart, pageEnd);

    // ── Sort handler ──────────────────────────────────────────────────────────

    const handleSort = (field: SortField) => {
        if (sortField !== field) {
            setSortField(field);
            setSortDir("asc");
        } else if (sortDir === "asc") {
            setSortDir("desc");
        } else if (sortDir === "desc") {
            setSortField(null);
            setSortDir(null);
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field)
            return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
        if (sortDir === "asc") return <ArrowUp className="h-3.5 w-3.5 text-primary" />;
        return <ArrowDown className="h-3.5 w-3.5 text-primary" />;
    };

    // ── Active filter count ───────────────────────────────────────────────────

    const activeFilterCount = [
        filters.civility,
        filters.firstname,
        filters.lastname,
        filters.email,
        filters.sent !== "all" ? filters.sent : "",
        filters.dateFrom,
        filters.dateTo,
    ].filter(Boolean).length;

    const clearFilters = () => setFilters(DEFAULT_FILTERS);

    // ── Pagination pages array ────────────────────────────────────────────────

    const pageNumbers = React.useMemo(() => {
        const delta = 2;
        const range: (number | "…")[] = [];
        const left = Math.max(2, safePage - delta);
        const right = Math.min(totalPages - 1, safePage + delta);

        range.push(1);
        if (left > 2) range.push("…");
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages - 1) range.push("…");
        if (totalPages > 1) range.push(totalPages);

        return range;
    }, [safePage, totalPages]);

    // ─── Render ───────────────────────────────────────────────────────────────

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-destructive">
                <XCircle className="h-10 w-10" />
                <p className="font-medium">Failed to load dispatch history.</p>
                <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* ── Header row: title + stats + page size ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                        {isLoading ? (
                            "Lade Daten…"
                        ) : (
                            <>
                                <span className="text-foreground font-semibold">{sorted.length}</span>
                                {" "}
                                {sorted.length !== records.length && (
                                    <span>von {records.length} </span>
                                )}
                                Einträge
                            </>
                        )}
                    </span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="gap-1">
                            {activeFilterCount} Filter aktiv
                            <button onClick={clearFilters} className="hover:text-destructive transition-colors ml-0.5">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Einträge pro Seite:</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => setPageSize(Number(v))}
                    >
                        <SelectTrigger className="h-8 w-20 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Filter bar ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2 p-3 rounded-lg border bg-muted/30">
                {/* Civility */}
                <Input
                    placeholder="Anrede…"
                    value={filters.civility}
                    onChange={(e) => setFilters((f) => ({ ...f, civility: e.target.value }))}
                    leftIcon={<Search className="h-3.5 w-3.5" />}
                    className="h-8 text-xs"
                />

                {/* First name */}
                <Input
                    placeholder="Vorname…"
                    value={filters.firstname}
                    onChange={(e) => setFilters((f) => ({ ...f, firstname: e.target.value }))}
                    leftIcon={<Search className="h-3.5 w-3.5" />}
                    className="h-8 text-xs"
                />

                {/* Last name */}
                <Input
                    placeholder="Nachname…"
                    value={filters.lastname}
                    onChange={(e) => setFilters((f) => ({ ...f, lastname: e.target.value }))}
                    leftIcon={<Search className="h-3.5 w-3.5" />}
                    className="h-8 text-xs"
                />

                {/* Email */}
                <Input
                    placeholder="E-Mail…"
                    value={filters.email}
                    onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
                    leftIcon={<Search className="h-3.5 w-3.5" />}
                    className="h-8 text-xs"
                />

                {/* Sent filter */}
                <Select
                    value={filters.sent}
                    onValueChange={(v) => setFilters((f) => ({ ...f, sent: v }))}
                >
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Gesendet…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Alle</SelectItem>
                        <SelectItem value="Yes">Ja</SelectItem>
                        <SelectItem value="No">Nein</SelectItem>
                    </SelectContent>
                </Select>

                {/* Date from */}
                <div className="relative">
                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                        className={cn(
                            "flex h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-2 py-1 text-xs shadow-sm transition-colors",
                            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        placeholder="Von Datum"
                    />
                </div>

                {/* Date to */}
                <div className="relative">
                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                        className={cn(
                            "flex h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-2 py-1 text-xs shadow-sm transition-colors",
                            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        placeholder="Bis Datum"
                    />
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                {(
                                    [
                                        { field: "civility" as SortField, label: "Anrede" },
                                        { field: "firstname" as SortField, label: "Vorname" },
                                        { field: "lastname" as SortField, label: "Nachname" },
                                        { field: "email" as SortField, label: "E-Mail" },
                                        { field: "Sent" as SortField, label: "Gesendet" },
                                        { field: "Date" as SortField, label: "Datum" },
                                    ] as { field: SortField; label: string }[]
                                ).map(({ field, label }) => (
                                    <th
                                        key={field}
                                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                                        onClick={() => handleSort(field)}
                                    >
                                        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                            {label}
                                            <SortIcon field={field} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                // Loading skeleton
                                Array.from({ length: pageSize > 10 ? 10 : pageSize }).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        {Array.from({ length: 6 }).map((__, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 rounded bg-muted animate-pulse w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="h-8 w-8 opacity-40" />
                                            <p className="font-medium">Keine Einträge gefunden</p>
                                            {activeFilterCount > 0 && (
                                                <button
                                                    onClick={clearFilters}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Filter zurücksetzen
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((row, idx) => (
                                    <tr
                                        key={`${row.email}-${idx}`}
                                        className={cn(
                                            "border-b transition-colors hover:bg-muted/40",
                                            idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                                        )}
                                    >
                                        {/* Civility */}
                                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                                            {row.civility}
                                        </td>

                                        {/* First name */}
                                        <td className="px-4 py-3 text-foreground whitespace-nowrap">
                                            {row.firstname}
                                        </td>

                                        {/* Last name */}
                                        <td className="px-4 py-3 text-foreground whitespace-nowrap">
                                            {row.lastname}
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3">
                                            <a
                                                href={`mailto:${row.email}`}
                                                className="text-primary hover:underline underline-offset-2 text-sm"
                                            >
                                                {row.email}
                                            </a>
                                        </td>

                                        {/* Sent badge */}
                                        <td className="px-4 py-3">
                                            {row.Sent === "Yes" ? (
                                                <Badge
                                                    variant="success"
                                                    className="gap-1 whitespace-nowrap"
                                                    icon={<CheckCircle2 className="h-3 w-3" />}
                                                >
                                                    Ja
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="destructive"
                                                    className="gap-1 whitespace-nowrap"
                                                    icon={<XCircle className="h-3 w-3" />}
                                                >
                                                    Nein
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                                            {formatDateDisplay(row.Date)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Pagination ── */}
            {!isLoading && sorted.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    {/* Showing X–Y of Z */}
                    <p className="text-xs text-muted-foreground">
                        Zeige{" "}
                        <span className="font-medium text-foreground">{pageStart + 1}</span>
                        {" – "}
                        <span className="font-medium text-foreground">{pageEnd}</span>
                        {" von "}
                        <span className="font-medium text-foreground">{sorted.length}</span>
                        {" Einträgen"}
                    </p>

                    {/* Page buttons */}
                    <div className="flex items-center gap-1">
                        {/* First page */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(1)}
                            disabled={safePage === 1}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        {/* Prev */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page numbers */}
                        {pageNumbers.map((p, i) =>
                            p === "…" ? (
                                <span
                                    key={`ellipsis-${i}`}
                                    className="px-1 text-xs text-muted-foreground"
                                >
                                    …
                                </span>
                            ) : (
                                <Button
                                    key={p}
                                    variant={safePage === p ? "default" : "outline"}
                                    size="icon"
                                    className="h-8 w-8 text-xs"
                                    onClick={() => setPage(p as number)}
                                >
                                    {p}
                                </Button>
                            )
                        )}

                        {/* Next */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Last page */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(totalPages)}
                            disabled={safePage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}