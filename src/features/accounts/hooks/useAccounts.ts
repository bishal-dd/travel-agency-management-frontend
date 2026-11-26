import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import {
  getAccountsSummary,
  listBookingOptions,
  listPayees,
  listTransactions,
  recordSupplierPayment,
  voidSupplierPayment,
  type TransactionsParams,
} from "../api/accounts";
import type {
  ListedSupplierType,
  Period,
  RecordSupplierPaymentInput,
} from "../types/accounts";

/** Keys start with the agency id, so switching agency never shows the old agency's numbers. */
function useOrgId() {
  const { data } = authClient.useActiveOrganization();
  return data?.id;
}

const noRetryOn4xx = (count: number, error: Error) => {
  const status = (error as Error & { status?: number }).status ?? 0;
  return !(status >= 400 && status < 500) && count < 2;
};

/** period null = not known yet (waiting for today's date in the browser). */
export function useAccountsSummary(period: Period | null) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["accounts", orgId, "summary", period],
    queryFn: async () => (await getAccountsSummary(period!)).data,
    enabled: !!orgId && !!period,
    placeholderData: keepPreviousData,
    retry: noRetryOn4xx,
  });
}

export function useTransactions(params: TransactionsParams) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["accounts", orgId, "transactions", params],
    queryFn: () => listTransactions(params),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
    retry: noRetryOn4xx,
  });
}

/** Search hotels / guides / vehicles / services to pay. */
export function usePayees(type: ListedSupplierType | null, q: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["accounts", orgId, "payees", type, q],
    queryFn: async () => (await listPayees(type!, q || undefined)).data,
    enabled: !!orgId && !!type,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useBookingOptions(q: string, enabled: boolean) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["accounts", orgId, "booking-options", q],
    queryFn: async () => (await listBookingOptions(q || undefined)).data,
    enabled: !!orgId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

function useAccountsMutation<V>(run: (v: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: run,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["accounts", orgId] }),
  });
}

export const useRecordSupplierPayment = () =>
  useAccountsMutation((input: RecordSupplierPaymentInput) =>
    recordSupplierPayment(input),
  );
export const useVoidSupplierPayment = () =>
  useAccountsMutation((v: { paymentId: string; reason: string }) =>
    voidSupplierPayment(v.paymentId, v.reason),
  );
