import type {
  Traveller,
  TravellerInput,
  Trip,
  TripInput,
  TripStatus,
} from "./types";

/**
 * Everything the trips UI needs from storage. Swap the implementation at the
 * bottom of this file to move from the in-memory store to your API.
 */
export interface TripsRepository {
  listTrips(organizationId: string): Promise<Trip[]>;
  getTrip(organizationId: string, tripId: string): Promise<Trip | null>;
  createTrip(organizationId: string, input: TripInput): Promise<Trip>;
  updateTripStatus(
    organizationId: string,
    tripId: string,
    status: TripStatus,
  ): Promise<Trip>;
  deleteTrip(organizationId: string, tripId: string): Promise<void>;
  addTraveller(
    organizationId: string,
    tripId: string,
    input: TravellerInput,
  ): Promise<Trip>;
  removeTraveller(
    organizationId: string,
    tripId: string,
    travellerId: string,
  ): Promise<Trip>;
}

export class TripNotFoundError extends Error {
  constructor() {
    super("This trip doesn't exist or belongs to another agency.");
  }
}

/* -------------------------------------------------------------------------- */
/* In-memory store: for building the UI before the API exists.                */
/* Data lives only in this browser tab and is cleared on reload, so passport  */
/* details are never written to browser storage.                              */
/* -------------------------------------------------------------------------- */

function createMemoryRepository(): TripsRepository {
  const tripsByAgency = new Map<string, Trip[]>();
  const now = () => new Date().toISOString();
  const clone = <T>(value: T): T => structuredClone(value);

  function agencyTrips(organizationId: string) {
    let trips = tripsByAgency.get(organizationId);
    if (!trips) {
      trips = [];
      tripsByAgency.set(organizationId, trips);
    }
    return trips;
  }

  function findTrip(organizationId: string, tripId: string) {
    const trip = agencyTrips(organizationId).find((t) => t.id === tripId);
    if (!trip) throw new TripNotFoundError();
    return trip;
  }

  const withId = (input: TravellerInput): Traveller => ({
    ...input,
    id: crypto.randomUUID(),
  });

  return {
    async listTrips(organizationId) {
      return clone(
        [...agencyTrips(organizationId)].sort((a, b) =>
          a.startDate.localeCompare(b.startDate),
        ),
      );
    },
    async getTrip(organizationId, tripId) {
      const trip = agencyTrips(organizationId).find((t) => t.id === tripId);
      return trip ? clone(trip) : null;
    },
    async createTrip(organizationId, input) {
      const timestamp = now();
      const trip: Trip = {
        ...input,
        id: crypto.randomUUID(),
        organizationId,
        travellers: input.travellers.map(withId),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      agencyTrips(organizationId).push(trip);
      return clone(trip);
    },
    async updateTripStatus(organizationId, tripId, status) {
      const trip = findTrip(organizationId, tripId);
      trip.status = status;
      trip.updatedAt = now();
      return clone(trip);
    },
    async deleteTrip(organizationId, tripId) {
      findTrip(organizationId, tripId);
      tripsByAgency.set(
        organizationId,
        agencyTrips(organizationId).filter((t) => t.id !== tripId),
      );
    },
    async addTraveller(organizationId, tripId, input) {
      const trip = findTrip(organizationId, tripId);
      trip.travellers.push(withId(input));
      trip.updatedAt = now();
      return clone(trip);
    },
    async removeTraveller(organizationId, tripId, travellerId) {
      const trip = findTrip(organizationId, tripId);
      trip.travellers = trip.travellers.filter((t) => t.id !== travellerId);
      trip.updatedAt = now();
      return clone(trip);
    },
  };
}

/* -------------------------------------------------------------------------- */
/* HTTP implementation: use once you have these route handlers.               */
/* Every endpoint must check the signed-in user is a member of the agency.    */
/*                                                                            */
/*   GET    /api/agencies/:orgId/trips                                        */
/*   POST   /api/agencies/:orgId/trips                     body: TripInput    */
/*   GET    /api/agencies/:orgId/trips/:tripId                                */
/*   PATCH  /api/agencies/:orgId/trips/:tripId             body: { status }   */
/*   DELETE /api/agencies/:orgId/trips/:tripId                                */
/*   POST   /api/agencies/:orgId/trips/:tripId/travellers  body: TravellerInput */
/*   DELETE /api/agencies/:orgId/trips/:tripId/travellers/:travellerId        */
/* -------------------------------------------------------------------------- */

function createHttpRepository(baseUrl = "/api/agencies"): TripsRepository {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (response.status === 404) throw new TripNotFoundError();
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(
        body?.message ?? "Something went wrong. Please try again.",
      );
    }
    return (response.status === 204 ? undefined : await response.json()) as T;
  }

  const trips = (orgId: string) => `/${encodeURIComponent(orgId)}/trips`;
  const trip = (orgId: string, tripId: string) =>
    `${trips(orgId)}/${encodeURIComponent(tripId)}`;

  return {
    listTrips: (orgId) => request(trips(orgId)),
    getTrip: (orgId, tripId) =>
      request<Trip>(trip(orgId, tripId)).catch((error) => {
        if (error instanceof TripNotFoundError) return null;
        throw error;
      }),
    createTrip: (orgId, input) =>
      request(trips(orgId), { method: "POST", body: JSON.stringify(input) }),
    updateTripStatus: (orgId, tripId, status) =>
      request(trip(orgId, tripId), {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    deleteTrip: (orgId, tripId) =>
      request(trip(orgId, tripId), { method: "DELETE" }),
    addTraveller: (orgId, tripId, input) =>
      request(`${trip(orgId, tripId)}/travellers`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    removeTraveller: (orgId, tripId, travellerId) =>
      request(
        `${trip(orgId, tripId)}/travellers/${encodeURIComponent(travellerId)}`,
        {
          method: "DELETE",
        },
      ),
  };
}

/** The one switch: replace with `createHttpRepository()` once your API is ready. */
export const tripsRepository: TripsRepository = createMemoryRepository();

// Exported so it's ready to use; remove once you switch.
export { createHttpRepository };

export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  return error instanceof Error && error.message ? error.message : fallback;
}
