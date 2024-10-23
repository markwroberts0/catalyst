import { loadApiKey, withoutTrailingSlash } from '@ai-sdk/provider-utils';
import { OnRampChatLanguageModel } from './onramp-chat-language-model';
import {
  OnRampChatModelId,
  OnRampChatSettings,
} from './onramp-chat-settings';
import { OnRampProviderSettings } from './onramp-provider';

/**
 * @deprecated Use `createOnRamp` instead.
 */
export class OnRamp {
  /**
   * Base URL for the OnRamp API calls.
   */
  readonly baseURL: string;

  readonly apiKey?: string;

  readonly headers?: Record<string, string>;

  /**
   * Creates a new OnRamp provider instance.
   */
  constructor(options: OnRampProviderSettings = {}) {
    this.baseURL =
      withoutTrailingSlash(options.baseURL ?? options.baseUrl) ??
      'https://onramp-api-dev.thankfulbeach-c26bca6d.eastus.azurecontainerapps.io';

    this.apiKey = options.apiKey;
    this.headers = options.headers;
  }

  private get baseConfig() {
    return {
      baseURL: this.baseURL,
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: this.apiKey,
          environmentVariableName: 'ONRAMP_API_KEY',
          description: 'OnRamp',
        })}`,
        ...this.headers,
      }),
    };
  }

  chat(modelId: OnRampChatModelId, settings: OnRampChatSettings = {}) {
    return new OnRampChatLanguageModel(modelId, settings, {
      provider: 'onramp.chat',
      ...this.baseConfig,
    });
  }
}