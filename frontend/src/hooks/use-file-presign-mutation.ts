import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { filesService } from '@/services/files.service';
import type { FilePresignRequest } from '@/types/files.types';

export function useFilePresignMutation(email: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!email) {
        throw new Error('Not signed in');
      }
      const input: FilePresignRequest = {
        email,
        filename: file.name,
        contentType: 'application/pdf',
        fileSize: file.size,
      };
      const presign = await filesService.requestPresign(input);
      await filesService.uploadToPresignedUrl(
        presign.uploadUrl,
        file,
        'application/pdf',
      );
    },
    onSuccess: async () => {
      if (email) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.fileStatus(email) });
      }
    },
  });
}
