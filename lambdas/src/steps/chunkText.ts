import { chunkPlainText } from '../shared';

type Input = {
  bucket: string;
  key: string;
  userEmail: string;
  text: string;
};

export const handler = async (event: Input) => {
  const parts = chunkPlainText(event.text);
  const chunks = parts.map((text, index) => ({ index, text }));
  return {
    bucket: event.bucket,
    key: event.key,
    userEmail: event.userEmail,
    chunks,
  };
};
