"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  Users,
} from "lucide-react";
import { Pagination } from "../hotel/ui/Pagination";
import { StatusBadge } from "../hotel/ui/StatusBadge";
import { ConfirmDeleteDialog } from "../shared/components/ConfirmDeleteDialog";
import {
  ListHeader,
  ListMessage,
  ListToolbar,
  RowActions,
  SkeletonRows,
} from "../shared/components/ListPage";
import { useClampPage, useListParams } from "../shared/hooks/useListParams";
import { useCustomers } from "./hooks/useCustomers";
import { useDeleteCustomer } from "./hooks/useDeleteCustomer";
import type { Customer, CustomerType } from "./types/customer";
import { CustomerFormDialog } from "./ui/CustomerFormDialog";

const PAGE_SIZE = 20;

type TypeFilter = "all" | CustomerType;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "individual", label: "Individuals" },
  { value: "company", label: "Companies" },
];

function Avatar({ customer }: { customer: Customer }) {
  if (customer.type === "company") {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-lagoon-deep">
        <Building2 size={18} aria-hidden="true" />
      </span>
    );
  }
  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-marigold text-sm font-bold text-ink">
      {initials || <User size={16} />}
    </span>
  );
}

function ContactLinks({ customer }: { customer: Customer }) {
  if (!customer.email && !customer.phone)
    return <span className="text-sm text-ink-soft">—</span>;
  return (
    <div className="space-y-1">
      {customer.email && (
        <a
          href={`mailto:${customer.email}`}
          className="flex max-w-[16rem] items-center gap-1.5 text-sm text-ink hover:text-lagoon-deep"
        >
          <Mail
            size={13}
            className="shrink-0 text-ink-soft"
            aria-hidden="true"
          />
          <span className="truncate">{customer.email}</span>
        </a>
      )}
      {customer.phone && (
        <a
          href={`tel:${customer.phone}`}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-lagoon-deep"
        >
          <Phone size={13} className="shrink-0" aria-hidden="true" />{" "}
          {customer.phone}
        </a>
      )}
    </div>
  );
}

export function CustomersPage() {
  const {
    query,
    setQuery,
    filter,
    setFilter,
    page,
    setPage,
    params,
    isFiltered,
  } = useListParams(PAGE_SIZE);
  const [type, setType] = useState<TypeFilter>("all");

  const {
    customers,
    pagination,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useCustomers({ ...params, type: type === "all" ? undefined : type });
  const remove = useDeleteCustomer();
  useClampPage(pagination?.totalPages, page, setPage);
  const updating = isFetching && isPlaceholderData;
  const anyFilter = isFiltered || type !== "all";

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  useEffect(() => {
    if (deleting) remove.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleting]);

  function changeType(t: TypeFilter) {
    setType(t);
    setPage(1); // a new filter always starts from page 1
  }

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setFormOpen(true);
  };

  return (
    <>
      <ListHeader
        title="Customers"
        description="Guests and companies who book with you. Travellers are added to each booking."
        addLabel="Add customer"
        onAdd={openAdd}
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          placeholder="Search name, contact, email or phone"
          filter={filter}
          onFilter={setFilter}
          busy={updating}
        >
          <div className="relative">
            <label htmlFor="customer-type" className="sr-only">
              Customer type
            </label>
            <select
              id="customer-type"
              value={type}
              onChange={(e) => changeType(e.target.value as TypeFilter)}
              className="h-10 appearance-none rounded-full bg-mist pl-4 pr-9 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-lagoon-deep/30"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            />
          </div>
        </ListToolbar>

        {isPending ? (
          <SkeletonRows />
        ) : error ? (
          <ListMessage
            title="Couldn't load customers"
            body={error.message}
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold ring-1 ring-inset ring-line hover:ring-ink/40"
              >
                Try again
              </button>
            }
          />
        ) : customers.length === 0 && !anyFilter ? (
          <ListMessage
            icon={<Users size={22} />}
            title="No customers yet"
            body="Add the guests and tour operators who book with you, so you can start bookings for them."
            action={
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-lagoon-deep"
              >
                <Plus size={16} /> Add your first customer
              </button>
            }
          />
        ) : customers.length === 0 ? (
          <ListMessage
            title="No matching customers"
            body="Try a different search or filter."
          />
        ) : (
          <div
            aria-busy={updating}
            className={`transition-opacity ${updating ? "pointer-events-none opacity-60" : ""}`}
          >
            {/* Desktop table */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Country</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="align-middle transition-colors hover:bg-paper"
                  >
                    <td className="max-w-xs px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar customer={c} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {c.name}
                          </p>
                          <p className="truncate text-sm text-ink-soft">
                            {c.type === "company"
                              ? c.contactPerson
                                ? `Company · ${c.contactPerson}`
                                : "Company"
                              : "Individual"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ContactLinks customer={c} />
                    </td>
                    <td className="px-5 py-4 text-sm text-ink">
                      {c.country ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-3 py-3">
                      <RowActions
                        label={c.name}
                        onEdit={() => openEdit(c)}
                        onDelete={() => setDeleting(c)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {customers.map((c) => (
                <li key={c.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar customer={c} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {c.name}
                        </p>
                        <p className="truncate text-sm text-ink-soft">
                          {c.type === "company"
                            ? c.contactPerson || "Company"
                            : "Individual"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <ContactLinks customer={c} />
                      {c.country && (
                        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                          <MapPin size={13} aria-hidden="true" /> {c.country}
                        </p>
                      )}
                    </div>
                    <RowActions
                      label={c.name}
                      onEdit={() => openEdit(c)}
                      onDelete={() => setDeleting(c)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pagination && !error && customers.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            busy={updating}
          />
        )}
      </div>

      <CustomerFormDialog
        open={formOpen}
        customer={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDeleteDialog
        open={!!deleting}
        title="Delete customer?"
        confirmLabel="Delete customer"
        isPending={remove.isPending}
        error={remove.error}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      >
        <p>
          <span className="font-semibold text-ink">{deleting?.name}</span> will
          be removed from your agency. This can&apos;t be undone.
        </p>
        <p>
          Customers with bookings can&apos;t be deleted; set them to{" "}
          <span className="font-semibold text-ink">Inactive</span> instead.
        </p>
      </ConfirmDeleteDialog>
    </>
  );
}
