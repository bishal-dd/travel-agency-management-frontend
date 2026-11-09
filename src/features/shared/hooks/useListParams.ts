import { useEffect, useMemo, useState } from "react";
import type { Filter } from "../components/ListPage";

/** Waits until the user stops typing before the value changes. */
export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Search box + status filter + page number for a server-paginated list.
 * `params` is ready to pass straight to useDrivers / useVehicles / useHotels.
 */
export function useListParams(pageSize = 20) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const search = useDebounced(query.trim());

  // A new search or filter always starts again from page 1.
  useEffect(() => setPage(1), [search, filter]);

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: filter === "all" ? undefined : filter,
      page,
      limit: pageSize,
    }),
    [search, filter, page, pageSize],
  );

  return {
    query,
    setQuery,
    filter,
    setFilter,
    page,
    setPage,
    params,
    isFiltered: !!search || filter !== "all",
  };
}

/** After deleting the last item on the last page, step back a page instead of showing an empty one. */
export function useClampPage(
  totalPages: number | undefined,
  page: number,
  setPage: (p: number) => void,
) {
  useEffect(() => {
    if (totalPages && totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page, setPage]);
}
