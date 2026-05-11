import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { extractText, getDocumentProxy } from 'unpdf';
import { readUserEmailFromMetadata } from '../shared';

const s3 = new S3Client({});

type Input = { bucket: string; key: string };

export const handler = async (event: Input) => {
  const { bucket, key } = event;
  const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const userEmail = readUserEmailFromMetadata(
    obj.Metadata as Record<string, string> | undefined,
  );
  if (!userEmail) {
    throw new Error(
      'Missing user email in S3 object metadata (expected x-amz-meta-useremail from presign upload)',
    );
  }

  const bytes = await obj.Body!.transformToByteArray();
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const { text } = await extractText(pdf, { mergePages: true });

  return {
    bucket,
    key,
    userEmail,
    text: text ?? '',
  };
};
