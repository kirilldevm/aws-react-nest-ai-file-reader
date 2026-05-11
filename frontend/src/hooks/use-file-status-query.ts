import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { filesService } from '@/services/files.service';

const POLL_MS = 2000;

export function useFileStatusQuery(email: string | null) {
  return useQuery({
    queryKey: email ? queryKeys.fileStatus(email) : ['file-status', 'disabled'],
    queryFn: () => filesService.getStatus(email!),
    enabled: Boolean(email),
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? POLL_MS : false,
  });
}
