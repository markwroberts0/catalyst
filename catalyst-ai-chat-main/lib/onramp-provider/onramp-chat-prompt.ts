export type OnRampChatPrompt = Array<OnRampChatMessage>;

export type OnRampChatMessage =
  | OnRampSystemMessage
  | OnRampUserMessage
  | OnRampAssistantMessage
  | OnRampToolMessage;

export interface OnRampSystemMessage {
  role: 'system';
  content: string;
}

export interface OnRampUserMessage {
  role: 'user';
  content: Array<OnRampUserMessageContent>;
}

export type OnRampUserMessageContent =
  | OnRampUserMessageTextContent
  | OnRampUserMessageImageContent;

export interface OnRampUserMessageImageContent {
  type: 'image_url';
  image_url: string;
}

export interface OnRampUserMessageTextContent {
  type: 'text';
  text: string;
}

export interface OnRampAssistantMessage {
  role: 'assistant';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface OnRampToolMessage {
  role: 'tool';
  name: string;
  content: string;
  tool_call_id: string;
}