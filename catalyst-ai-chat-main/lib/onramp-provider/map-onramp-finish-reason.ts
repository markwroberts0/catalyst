import { LanguageModelV1FinishReason } from '@ai-sdk/provider';

export function mapOnRampFinishReason(
  finishReason: string | null | undefined,
): LanguageModelV1FinishReason {
  switch (finishReason) {
    case 'stop':
      return 'stop';
    case 'length':
      return 'length';
    case 'tool_calls':
      return 'tool-calls';
    case 'content_filter':
      return 'content-filter';
    default:
      return 'unknown';
  }
}