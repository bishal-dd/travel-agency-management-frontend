import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoom } from "../api/deleteRoom";
import { DeleteRoomResponse } from "../types/room";

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  const {
    mutate: remove,
    data,
    isPending,
    error,
    reset,
  } = useMutation<
    DeleteRoomResponse,
    Error,
    { roomId: string; hotelId: string }
  >({
    mutationFn: ({ roomId }) => deleteRoom(roomId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rooms", variables.hotelId],
      });
    },
  });

  return {
    deleteRoom: remove,
    data,
    isPending,
    error,
    reset,
  };
}
