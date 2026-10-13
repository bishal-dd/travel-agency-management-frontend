import Link from "next/link";
import { ChevronsUpDown } from "lucide-react";
import type { AgencyDashboard } from "./useAgencyDashboard";
import { Loading, controlClass } from "./parts";

type Props = Pick<
  AgencyDashboard,
  | "organizations"
  | "activeOrganization"
  | "isLoadingOrganizations"
  | "isSwitching"
  | "handleOrganizationChange"
>;

export function AgencySwitcher({
  organizations,
  activeOrganization,
  isLoadingOrganizations,
  isSwitching,
  handleOrganizationChange,
}: Props) {
  if (isLoadingOrganizations) {
    return <Loading>Loading agencies...</Loading>;
  }

  if (!organizations?.length) {
    return (
      <div className="space-y-1 text-sm">
        <p className="text-ink-soft">You don&apos;t belong to any agencies yet.</p>
        <Link href="/onboarding" className="font-semibold text-lagoon hover:text-lagoon-deep">
          Create an agency
        </Link>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="agency" className="text-xs font-semibold text-ink-soft">
        Active agency
      </label>
      <div className="relative mt-1.5">
        <select
          id="agency"
          value={activeOrganization?.id ?? ""}
          onChange={(event) => handleOrganizationChange(event.target.value)}
          disabled={isSwitching}
          className={`${controlClass} appearance-none pr-9 font-semibold`}
        >
          {!activeOrganization && <option value="">Select an agency</option>}
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
        <ChevronsUpDown
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft"
        />
      </div>
      {isSwitching && (
        <div className="mt-2">
          <Loading>Switching agency...</Loading>
        </div>
      )}
    </div>
  );
}
