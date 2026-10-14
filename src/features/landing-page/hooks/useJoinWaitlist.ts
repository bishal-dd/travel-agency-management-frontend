import { useMutation } from "@tanstack/react-query";
import { joinWaitlist, type WaitlistInput } from "../api/joinWaitlist";

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (input: WaitlistInput) => joinWaitlist(input),
  });
}
