import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";
import {
  completeUpload,
  deleteBookingFile,
  listBookingFiles,
  postToStorage,
  startUpload,
  updateBookingFile,
} from "../api/bookingFiles";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_BYTES,
  fileType,
  type BookingFileCategory,
} from "../types/bookingFile";

function useOrgId() {
  const { data } = authClient.useActiveOrganization();
  return data?.id;
}
const filesKey = (orgId: string | undefined, bookingId: string) => [
  "booking-files",
  orgId,
  bookingId,
];

export function useBookingFiles(bookingId: string) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: filesKey(orgId, bookingId),
    queryFn: async () => (await listBookingFiles(bookingId)).data,
    enabled: !!orgId,
  });
}

/** An upload in progress, shown in the list until it's done. */
export interface UploadingFile {
  key: string;
  fileName: string;
  travellerId: string | null;
  progress: number;
  error: string | null;
}

/** Check the file before uploading: same rules as the server. */
export function checkFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(fileType(file)))
    return `${file.name}: upload a PDF or a photo (JPG, PNG, WEBP or HEIC).`;
  if (file.size > MAX_FILE_BYTES) return `${file.name} is over 10 MB.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return null;
}

/** Upload: ask the server for a signed form → send to S3 → tell the server it's done. */
export function useUploadBookingFiles(bookingId: string) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const patch = (key: string, p: Partial<UploadingFile>) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...p } : u)));

  async function uploadOne(
    file: File,
    target: { travellerId: string | null; category: BookingFileCategory },
  ) {
    const key = `${Date.now()}-${Math.random()}`;
    setUploads((list) => [
      ...list,
      {
        key,
        fileName: file.name,
        travellerId: target.travellerId,
        progress: 0,
        error: null,
      },
    ]);
    const problem = checkFile(file);
    if (problem) return patch(key, { error: problem });
    try {
      const { data } = await startUpload(bookingId, {
        fileName: file.name,
        contentType: fileType(file),
        sizeBytes: file.size,
        category: target.category,
        travellerId: target.travellerId,
      });
      await postToStorage(data.upload, file, (progress) =>
        patch(key, { progress }),
      );
      await completeUpload(bookingId, data.file.id);
      await queryClient.invalidateQueries({
        queryKey: filesKey(orgId, bookingId),
      });
      setUploads((list) => list.filter((u) => u.key !== key));
    } catch (error) {
      patch(key, { error: (error as Error).message });
    }
  }

  return {
    uploads,
    upload: (
      files: File[],
      target: { travellerId: string | null; category: BookingFileCategory },
    ) => Promise.all(files.map((f) => uploadOne(f, target))),
    dismiss: (key: string) =>
      setUploads((list) => list.filter((u) => u.key !== key)),
  };
}

export function useUpdateBookingFile(bookingId: string) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      fileId: string;
      category?: BookingFileCategory;
      travellerId?: string | null;
    }) =>
      updateBookingFile(bookingId, v.fileId, {
        category: v.category,
        travellerId: v.travellerId,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: filesKey(orgId, bookingId) }),
  });
}

export function useDeleteBookingFile(bookingId: string) {
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => deleteBookingFile(bookingId, fileId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: filesKey(orgId, bookingId) }),
  });
}
