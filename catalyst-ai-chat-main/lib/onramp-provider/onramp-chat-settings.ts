export type OnRampChatModelId =
  | 'default'
  | (string & {});

export interface OnRampChatSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;
}