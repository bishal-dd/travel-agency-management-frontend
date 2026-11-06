import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRoom } from "../api/updateRoom";
import { UpdateRoomResponse, UpdateRoomPayload } from "../types/room";

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  const {
    mutate: update,
    data,
    isPending,
    error,
    reset,
  } = useMutation<
    UpdateRoomResponse,
    Error,
    { roomId: string; hotelId: string; data: UpdateRoomPayload }
  >({
    mutationFn: ({ roomId, data }) => updateRoom(roomId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rooms", variables.hotelId],
      });
    },
  });

  return {
    updateRoom: update,
    data,
    isPending,
    error,
    reset,
  };
}
