import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import type { Context, S3Event } from 'aws-lambda';

const sfn = new SFNClient({});

function buildStateMachineArn(ctx: Context): string {
  const accountId = ctx.invokedFunctionArn.split(':')[4];
  const region = process.env.AWS_REGION;
  const name = process.env.STATE_MACHINE_NAME;
  if (!region || !name) {
    throw new Error('Missing AWS_REGION or STATE_MACHINE_NAME');
  }
  return `arn:aws:states:${region}:${accountId}:stateMachine:${name}`;
}

export const handler = async (event: S3Event, context: Context) => {
  const stateMachineArn = buildStateMachineArn(context);

  for (const record of event.Records ?? []) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    if (!key.toLowerCase().endsWith('.pdf')) {
      continue;
    }

    await sfn.send(
      new StartExecutionCommand({
        stateMachineArn,
        input: JSON.stringify({ bucket, key }),
      }),
    );
  }

  return { started: (event.Records ?? []).length };
};
