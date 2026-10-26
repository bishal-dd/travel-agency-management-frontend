export type WaitlistInput = {
  email: string;
};

export type WaitlistResponse = {
  success: boolean;
  message: string;
};

export async function joinWaitlist(
  input: WaitlistInput,
): Promise<WaitlistResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("Backend URL is not configured");
  }

  const res = await fetch(`${backendUrl}/api/waitlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await res.json()) as WaitlistResponse;

  if (!res.ok) {
    throw new Error(data.message || "Failed to join the waitlist");
  }

  return data;
}
