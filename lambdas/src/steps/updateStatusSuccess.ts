import { patchFileStatus } from '../shared';

type Input = { userEmail: string; bucket?: string; key?: string };

export const handler = async (event: Input) => {
  await patchFileStatus({ email: event.userEmail, status: 'success' });
  return { ok: true };
};
