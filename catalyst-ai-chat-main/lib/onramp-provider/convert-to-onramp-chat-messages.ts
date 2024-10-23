import {
    LanguageModelV1Prompt,
    UnsupportedFunctionalityError,
  } from '@ai-sdk/provider';
  import { convertUint8ArrayToBase64 } from '@ai-sdk/provider-utils';
  import { OnRampChatPrompt } from './onramp-chat-prompt';
  
  export function convertToOnRampChatMessages(
    prompt: LanguageModelV1Prompt,
  ): OnRampChatPrompt {
    const messages: OnRampChatPrompt = [];
  
    for (const { role, content } of prompt) {
      switch (role) {
        case 'system': {
          messages.push({ role: 'system', content });
          break;
        }
  
        case 'user': {
          messages.push({
            role: 'user',
            content: content.map(part => {
              switch (part.type) {
                case 'text': {
                  return part.text;
                }
                case 'image': {
                  throw new UnsupportedFunctionalityError({
                    functionality: 'Images in user messages',
                  });
                }
              }
            }).join(''),
          });
          break;
        }
  
        case 'assistant': {
          let text = '';
          const toolCalls: Array<{
            id: string;
            type: 'function';
            function: { name: string; arguments: string };
          }> = [];
  
          for (const part of content) {
            switch (part.type) {
              case 'text': {
                text += part.text;
                break;
              }
              case 'tool-call': {
                toolCalls.push({
                  id: part.toolCallId,
                  type: 'function',
                  function: {
                    name: part.toolName,
                    arguments: JSON.stringify(part.args),
                  },
                });
                break;
              }
              default: {
                const _exhaustiveCheck: never = part;
                throw new Error(`Unsupported part: ${_exhaustiveCheck}`);
              }
            }
          }
  
          messages.push({
            role: 'assistant',
            content: text,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
          });
  
          break;
        }
        case 'tool': {
          for (const toolResponse of content) {
            messages.push({
              role: 'tool',
              name: toolResponse.toolName,
              content: JSON.stringify(toolResponse.result),
              tool_call_id: toolResponse.toolCallId,
            });
          }
          break;
        }
        default: {
          const _exhaustiveCheck: never = role;
          throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
        }
      }
    }
  
    return messages;
  }