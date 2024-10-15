import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const onrampErrorDataSchema = z.object({
  object: z.literal('error'),
  message: z.string(),
  type: z.string(),
  param: z.string().nullable(),
  code: z.string().nullable(),
});

export type OnRampErrorData = z.infer<typeof onrampErrorDataSchema>;

export const onrampFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: onrampErrorDataSchema,
  errorToMessage: data => data.message,
});