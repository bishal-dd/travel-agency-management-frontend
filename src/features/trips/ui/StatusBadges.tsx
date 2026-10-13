import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge, type BadgeTone } from "@/src/components/ui";
import {
  passportStatus,
  passportStatusLabel,
  tripStatusLabel,
} from "../passport/passport";
import type { IsoDate, TripStatus } from "../passport/types";

const tripTones: Record<TripStatus, BadgeTone> = {
  planning: "neutral",
  confirmed: "lagoon",
  "in-progress": "marigold",
  completed: "ink",
  cancelled: "neutral",
};

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return <Badge tone={tripTones[status]}>{tripStatusLabel[status]}</Badge>;
}

export function PassportStatusBadge({
  expiryDate,
  tripEndDate,
}: {
  expiryDate: IsoDate;
  tripEndDate: IsoDate;
}) {
  const status = passportStatus(expiryDate, tripEndDate);

  if (status === "valid") {
    return (
      <Badge tone="lagoon">
        <CheckCircle2 size={12} aria-hidden="true" />{" "}
        {passportStatusLabel.valid}
      </Badge>
    );
  }
  if (status === "short-validity") {
    return (
      <Badge tone="marigold">
        <AlertTriangle size={12} aria-hidden="true" />{" "}
        {passportStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-800">
      <XCircle size={12} aria-hidden="true" /> {passportStatusLabel[status]}
    </Badge>
  );
}
