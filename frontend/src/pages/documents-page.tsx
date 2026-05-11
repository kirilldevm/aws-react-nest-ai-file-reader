import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Field, FieldGroup, FieldLabel } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/auth.context';
import { useChatMutation } from '../hooks/use-chat-mutation';
import { useDeleteFileMutation } from '../hooks/use-delete-file-mutation';
import { useFilePresignMutation } from '../hooks/use-file-presign-mutation';
import { useFileStatusQuery } from '../hooks/use-file-status-query';
import type { FileProcessingStatus } from '../types/files.types';

type ChatRole = 'user' | 'assistant';

type ChatLine = {
  id: string;
  role: ChatRole;
  content: string;
};

function statusLabel(status: FileProcessingStatus | undefined): string {
  switch (status) {
    case 'pending':
      return 'Processing your PDF…';
    case 'success':
      return 'Ready — you can chat about this document.';
    case 'error':
      return 'Processing failed.';
    case 'not_uploaded':
      return 'No document uploaded yet.';
    default:
      return 'Loading status…';
  }
}

export default function DocumentsPage() {
  const { email } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatInput, setChatInput] = useState('');
  const [lines, setLines] = useState<ChatLine[]>([]);

  const statusQuery = useFileStatusQuery(email);
  const presignMutation = useFilePresignMutation(email);
  const deleteMutation = useDeleteFileMutation(email);
  const chatMutation = useChatMutation();

  const status = statusQuery.data?.status;
  const canChat = status === 'success';
  const isBusy =
    presignMutation.isPending ||
    deleteMutation.isPending ||
    statusQuery.isFetching;

  const resetChat = useCallback(() => {
    setLines([]);
    setChatInput('');
  }, []);

  const onPickFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) {
        return;
      }
      try {
        await presignMutation.mutateAsync(file);
        resetChat();
      } catch {
        // errors surfaced via mutation state
      }
    },
    [presignMutation, resetChat],
  );

  const onDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync();
      resetChat();
    } catch {
      // surfaced on mutation
    }
  }, [deleteMutation, resetChat]);

  const onSendChat = useCallback(async () => {
    const message = chatInput.trim();
    if (!email || !message || !canChat) {
      return;
    }
    const userLine: ChatLine = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
    };
    setLines((prev) => [...prev, userLine]);
    setChatInput('');
    try {
      const { answer } = (await chatMutation.mutateAsync({
        email,
        message,
      })) as { answer: string };
      setLines((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: answer },
      ]);
    } catch {
      setLines((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    }
  }, [canChat, chatInput, chatMutation, email]);

  const uploadError = useMemo(() => {
    const e =
      presignMutation.error ??
      deleteMutation.error ??
      statusQuery.error ??
      null;
    if (!e) {
      return null;
    }
    return e instanceof Error ? e.message : 'Request failed';
  }, [deleteMutation.error, presignMutation.error, statusQuery.error]);

  return (
    <main className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='flex flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Your document</CardTitle>
            <CardDescription>
              Upload one PDF (max 10MB). To replace it, delete the current file
              first.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <Input
                ref={fileInputRef}
                type='file'
                accept='application/pdf,.pdf'
                className='hidden'
                onChange={onFileChange}
              />
              <Button
                type='button'
                variant='secondary'
                onClick={onPickFile}
                disabled={
                  isBusy || statusQuery.isLoading || status !== 'not_uploaded'
                }
              >
                Upload PDF
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={onDelete}
                disabled={
                  deleteMutation.isPending ||
                  statusQuery.isLoading ||
                  status === undefined ||
                  status === 'not_uploaded'
                }
              >
                Delete file
              </Button>
              <span className='text-sm text-muted-foreground'>
                {statusLabel(status)}
              </span>
            </div>
            {status === 'pending' ? (
              <p className='text-xs text-muted-foreground'>
                Status updates every 2s while processing…
              </p>
            ) : null}
            {status === 'error' && statusQuery.data?.error ? (
              <p className='text-sm text-destructive'>
                {statusQuery.data.error}
              </p>
            ) : null}
            {uploadError ? (
              <p className='text-sm text-destructive'>{uploadError}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Ask questions about your PDF once processing has finished.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div
              className='min-h-[200px] max-h-[360px] overflow-y-auto rounded-md border border-border bg-muted/30 p-3 text-sm'
              aria-live='polite'
            >
              {lines.length === 0 ? (
                <p className='text-muted-foreground'>
                  {canChat
                    ? 'No messages yet. Ask a question below.'
                    : 'Chat is available after your document finishes processing.'}
                </p>
              ) : (
                <ul className='flex flex-col gap-3'>
                  {lines.map((line) => (
                    <li key={line.id}>
                      <p className='text-xs font-medium text-muted-foreground'>
                        {line.role === 'user' ? 'You' : 'Assistant'}
                      </p>
                      <p className='whitespace-pre-wrap'>{line.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Separator />
            <FieldGroup>
              <Field data-invalid={false}>
                <FieldLabel htmlFor='chat-message'>Message</FieldLabel>
                <textarea
                  id='chat-message'
                  rows={3}
                  className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  placeholder={
                    canChat
                      ? 'Ask something about your document…'
                      : 'Upload completes first…'
                  }
                  value={chatInput}
                  disabled={!canChat || chatMutation.isPending}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void onSendChat();
                    }
                  }}
                />
              </Field>
              <Button
                type='button'
                onClick={() => void onSendChat()}
                disabled={
                  !canChat || chatMutation.isPending || !chatInput.trim()
                }
              >
                Send
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
