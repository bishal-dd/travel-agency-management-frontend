export type WaitlistInput = {
  email: string;
};

export async function joinWaitlist(input: WaitlistInput) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("Backend URL is not configured");
  }

  const res = await fetch(`${backendUrl}/api/waitlist`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to join the waitlist");
  }

  return res.json() as Promise<{
    success: boolean;
    message: string;
  }>;
}
