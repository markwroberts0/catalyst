import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { OnRampChatLanguageModel } from './onramp-chat-language-model';
import { OnRampChatModelId, OnRampChatSettings } from './onramp-chat-settings';

// model factory function with additional methods and properties
export interface OnRampProvider {
  (
    modelId: OnRampChatModelId,
    settings?: OnRampChatSettings,
  ): OnRampChatLanguageModel;

  // explicit method for targeting a specific API in case there are several
  chat(
    modelId: OnRampChatModelId,
    settings?: OnRampChatSettings,
  ): OnRampChatLanguageModel;
}

// optional settings for the provider
export interface OnRampProviderSettings {
  /**
Use a different URL prefix for API calls, e.g. to use proxy servers.
   */
  baseURL?: string;

  /**
API key.
   */
  apiKey?: string;

  /**
Custom headers to include in the requests.
     */
  headers?: Record<string, string>;
}

// provider factory function
export function createOnRamp(
  options: OnRampProviderSettings = {},
): OnRampProvider {
  const createModel = (
    modelId: OnRampChatModelId,
    settings: OnRampChatSettings = {},
  ) =>
    new OnRampChatLanguageModel(modelId, settings, {
      provider: 'onramp.chat',
      baseURL:
        withoutTrailingSlash(options.baseURL) ?? 'https://onramp-api-dev.thankfulbeach-c26bca6d.eastus.azurecontainerapps.io',
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: 'ONRAMP_API_KEY',
          description: 'OnRamp Provider',
        })}`,
        ...options.headers,
      }),
      generateId: options.generateId ?? generateId,
    });

  const provider = function (
    modelId: OnRampChatModelId,
    settings?: OnRampChatSettings,
  ) {
    if (new.target) {
      throw new Error(
        'The model factory function cannot be called with the new keyword.',
      );
    }

    return createModel(modelId, settings);
  };

  provider.chat = createModel;

  return provider as OnRampProvider;
}

/**
 * Default custom provider instance.
 */
export const onramp = createOnRamp();
