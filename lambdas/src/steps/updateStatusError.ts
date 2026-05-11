import {
  patchFileStatus,
  resolveUserEmailFromS3,
  stringifyStepError,
} from '../shared';

type Input = {
  bucket?: string;
  key?: string;
  userEmail?: string;
  lastError?: unknown;
};

export const handler = async (event: Input) => {
  let email = event.userEmail?.toLowerCase().trim();
  if (!email && event.bucket && event.key) {
    email =
      (await resolveUserEmailFromS3({ bucket: event.bucket, key: event.key })) ??
      undefined;
  }
  if (!email) {
    throw new Error('Cannot resolve user email for error status update');
  }

  const message = stringifyStepError(event.lastError);
  await patchFileStatus({ email, status: 'error', error: message });
  return { ok: true };
};
