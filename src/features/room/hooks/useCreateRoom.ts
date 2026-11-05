import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom } from "../api/createRoom";
import { CreateRoomResponse, CreateRoomPayload } from "../types/room";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  const {
    mutate: create,
    data,
    isPending,
    error,
    reset,
  } = useMutation<CreateRoomResponse, Error, CreateRoomPayload>({
    mutationFn: (data) => createRoom(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rooms", variables.hotelId],
      });
    },
  });

  return {
    createRoom: create,
    data,
    isPending,
    error,
    reset,
  };
}
