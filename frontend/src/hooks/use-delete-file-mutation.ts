import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { filesService } from '@/services/files.service';

export function useDeleteFileMutation(email: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error('Not signed in');
      }
      return filesService.delete(email);
    },
    onSuccess: async () => {
      if (email) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.fileStatus(email) });
      }
    },
  });
}
