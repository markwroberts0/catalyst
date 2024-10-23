import {
    LanguageModelV1,
    LanguageModelV1CallWarning,
    LanguageModelV1FinishReason,
    LanguageModelV1StreamPart,
  } from '@ai-sdk/provider';
  import {
    FetchFunction,
    ParseResult,
    combineHeaders,
    createEventSourceResponseHandler,
    createJsonResponseHandler,
    postJsonToApi,
  } from '@ai-sdk/provider-utils';
  import { z } from 'zod';
  import { convertToOnRampChatMessages } from './convert-to-onramp-chat-messages';
  import { mapOnRampFinishReason } from './map-onramp-finish-reason';
  import {
    OnRampChatModelId,
    OnRampChatSettings,
  } from './onramp-chat-settings';
  import { onrampFailedResponseHandler } from './onramp-error';
  import { getResponseMetadata } from './get-response-metadata';
  
  type OnRampChatConfig = {
    provider: string;
    baseURL: string;
    headers: () => Record<string, string | undefined>;
    fetch?: FetchFunction;
  };
  
  export class OnRampChatLanguageModel implements LanguageModelV1 {
    readonly specificationVersion = 'v1';
    readonly defaultObjectGenerationMode = 'json';
    readonly supportsImageUrls = false;
  
    readonly modelId: OnRampChatModelId;
    readonly settings: OnRampChatSettings;
  
    private readonly config: OnRampChatConfig;
  
    constructor(
      modelId: OnRampChatModelId,
      settings: OnRampChatSettings,
      config: OnRampChatConfig,
    ) {
      this.modelId = modelId;
      this.settings = settings;
      this.config = config;
    }
  
    get provider(): string {
      return this.config.provider;
    }
  
    private getArgs({
      mode,
      prompt,
      maxTokens,
      temperature,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
      stopSequences,
      responseFormat,
      seed,
    }: Parameters<LanguageModelV1['doGenerate']>[0]) {
      const type = mode.type;
  
      const warnings: LanguageModelV1CallWarning[] = [];
  
      if (topP != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'topP',
        });
      }

      if (topK != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'topK',
        });
      }
  
      if (frequencyPenalty != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'frequencyPenalty',
        });
      }
  
      if (presencePenalty != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'presencePenalty',
        });
      }
  
      if (stopSequences != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'stopSequences',
        });
      }

      if (maxTokens != null) { 
        warnings.push({
          type: 'unsupported-setting',
          setting: 'maxTokens',
        });
      }

      if (temperature != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'temperature',
        });
      }

      if (seed != null) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'seed',
        });
      }
  
      if (
        responseFormat != null &&
        responseFormat.type === 'json' &&
        responseFormat.schema != null
      ) {
        warnings.push({
          type: 'unsupported-setting',
          setting: 'responseFormat',
          details: 'JSON response format schema is not supported',
        });
      }
  
      const baseArgs = {
        user: "tester",
        // messages:
        persona: "dod",
        messages: convertToOnRampChatMessages(prompt),
      };

      return {
        args: { ...baseArgs},
        warnings,
      };
  
      switch (type) {
        case 'regular': {
          return {
            args: { ...baseArgs, ...prepareToolsAndToolChoice(mode) },
            warnings,
          };
        }
  
        case 'object-json': {
          return {
            args: {
              ...baseArgs,
              response_format: { type: 'json_object' },
            },
            warnings,
          };
        }
  
        case 'object-tool': {
          return {
            args: {
              ...baseArgs,
              tool_choice: 'any',
              tools: [{ type: 'function', function: mode.tool }],
            },
            warnings,
          };
        }
  
        default: {
          const _exhaustiveCheck: never = type;
          throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
        }
      }
    }
  
    async doGenerate(
      options: Parameters<LanguageModelV1['doGenerate']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
      const { args, warnings } = this.getArgs(options);
  
      const { responseHeaders, value: response } = await postJsonToApi({
        url: `${this.config.baseURL}/chat/completions`,
        headers: combineHeaders(this.config.headers(), options.headers),
        body: args,
        failedResponseHandler: onrampFailedResponseHandler,
        successfulResponseHandler: createJsonResponseHandler(
          onrampChatResponseSchema,
        ),
        abortSignal: options.abortSignal,
        fetch: this.config.fetch,
      });
  
      const { messages: rawPrompt, ...rawSettings } = args;
      const choice = response.choices[0];
  
      return {
        text: choice.message.content ?? undefined,
        toolCalls: choice.message.tool_calls?.map(toolCall => ({
          toolCallType: 'function',
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          args: toolCall.function.arguments!,
        })),
        finishReason: mapOnRampFinishReason(choice.finish_reason),
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
        },
        rawCall: { rawPrompt, rawSettings },
        rawResponse: { headers: responseHeaders },
        response: getResponseMetadata(response),
        warnings,
      };
    }
  
    async doStream(
      options: Parameters<LanguageModelV1['doStream']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {
      const { args, warnings } = this.getArgs(options);

      // Log headers and other request parameters
      console.log('Headers from options:', options.headers);
      console.log('Headers from config:', this.config.headers());
      console.log('Combined headers:', combineHeaders(this.config.headers(), options.headers));
      console.log('Request URL:', `${this.config.baseURL}/chat/completions`);
      console.log('Fetch implementation:', this.config.fetch);

      // Log the request body (args)
      console.log('Request Body:', { ...args, stream: true });

  
      const { responseHeaders, value: response } = await postJsonToApi({
        url: `${this.config.baseURL}/chat/completions`,
        headers: combineHeaders(this.config.headers(), options.headers),
        body: { ...args, stream: true },
        failedResponseHandler: onrampFailedResponseHandler,
        successfulResponseHandler: createEventSourceResponseHandler(
          onrampChatChunkSchema,
        ),
        abortSignal: options.abortSignal,
        fetch: this.config.fetch,
      });

      console.log('Response:', { response});
  
      const { messages: rawPrompt, ...rawSettings } = args;
  
      let finishReason: LanguageModelV1FinishReason = 'unknown';
      let usage: { promptTokens: number; completionTokens: number } = {
        promptTokens: Number.NaN,
        completionTokens: Number.NaN,
      };
      let isFirstChunk = true;
      
      console.log('Initiating streaming response...');
       // Split the stream using tee()
      const [stream1, stream2] = response.tee();

      // Use stream1 to inspect the data via getReader
      const reader = stream1.getReader();
      reader.read().then(function processText({ done, value }) {
        if (done) {
          console.log('Stream is done.');
          return;
        }
        console.log('Stream value:', new TextDecoder().decode(value));
        reader.read().then(processText);
      });
      return {
        stream: stream2.pipeThrough(
          new TransformStream<
            ParseResult<z.infer<typeof onrampChatChunkSchema>>,
            LanguageModelV1StreamPart
          >({
            transform(chunk, controller) {
              if (!chunk.success) {
                controller.enqueue({ type: 'error', error: chunk.error });
                return;
              }
              let value = chunk.value;

              if (typeof value === 'string') {
                try {
                  value = JSON.parse(value);
                } catch (error) {
                  console.error('Failed to parse chunk value:', error);
                  controller.enqueue({ type: 'error', error });
                  return;
                }
              }

              console.error('Parsed Response:', { value });
  
              console.error('Response:', {value});
  
              if (isFirstChunk) {
                isFirstChunk = false;
  
                controller.enqueue({
                  type: 'response-metadata',
                  ...getResponseMetadata(value),
                });
              }
  
              if (value.usage != null) {
                usage = {
                  promptTokens: value.usage.prompt_tokens,
                  completionTokens: value.usage.completion_tokens,
                };
              }
  
              const choice = value.choices[0];
  
              if (choice?.finish_reason != null) {
                finishReason = mapOnRampFinishReason(choice.finish_reason);
              }
  
              if (choice?.delta == null) {
                return;
              }
  
              const delta = choice.delta;
  
              if (delta.content != null) {
                controller.enqueue({
                  type: 'text-delta',
                  textDelta: delta.content,
                });
              }
  
              if (delta.tool_calls != null) {
                for (const toolCall of delta.tool_calls) {
                  // onramp tool calls come in one piece:
                  controller.enqueue({
                    type: 'tool-call-delta',
                    toolCallType: 'function',
                    toolCallId: toolCall.id,
                    toolName: toolCall.function.name,
                    argsTextDelta: toolCall.function.arguments,
                  });
                  controller.enqueue({
                    type: 'tool-call',
                    toolCallType: 'function',
                    toolCallId: toolCall.id,
                    toolName: toolCall.function.name,
                    args: toolCall.function.arguments,
                  });
                }
              }
            },
  
            flush(controller) {
              controller.enqueue({ type: 'finish', finishReason, usage });
            },
          }),
        ),
        rawCall: { rawPrompt, rawSettings },
        rawResponse: { headers: responseHeaders },
        warnings,
      };
    }
  }
  
  // limited version of the schema, focussed on what is needed for the implementation
  // this approach limits breakages when the API changes and increases efficiency
  const onrampChatResponseSchema = z.object({
    id: z.string().nullish(),
    created: z.number().nullish(),
    object: z.literal('chat.completion'),
    choices: z.array(
      z.object({
        index: z.number(),
        message: z.object({
          role: z.literal('assistant'),
          content: z.string().nullable(),
        }),
        finish_reason: z.string().nullish(),
      }),
    ),
    usage: z
      .object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
      })
      .nullish(),
  });
  
  // limited version of the schema, focussed on what is needed for the implementation
  // this approach limits breakages when the API changes and increases efficiency
  const onrampChatChunkSchema = z.object({
    id: z.string().nullish(),
    created: z.number().nullish(),
    choices: z.array(
      z.object({
        index: z.number(),
        delta: z.object({
          role: z.enum(['assistant']).optional(),
          content: z.string().nullish(),
        }),
        finish_reason: z.string().nullish(),
        
      }),
    ),
    usage: z
      .object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
      })
      .nullish(),
  });
  
  function prepareToolsAndToolChoice(
    mode: Parameters<LanguageModelV1['doGenerate']>[0]['mode'] & {
      type: 'regular';
    },
  ) {
    // when the tools array is empty, change it to undefined to prevent errors:
    const tools = mode.tools?.length ? mode.tools : undefined;
  
    if (tools == null) {
      return { tools: undefined, tool_choice: undefined };
    }
  
    const mappedTools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  
    const toolChoice = mode.toolChoice;
  
    if (toolChoice == null) {
      return { tools: mappedTools, tool_choice: undefined };
    }
  
    const type = toolChoice.type;
  
    switch (type) {
      case 'auto':
      case 'none':
        return { tools: mappedTools, tool_choice: type };
      case 'required':
        return { tools: mappedTools, tool_choice: 'any' };
  
      // onramp does not support tool mode directly,
      // so we filter the tools and force the tool choice through 'any'
      case 'tool':
        return {
          tools: mappedTools.filter(
            tool => tool.function.name === toolChoice.toolName,
          ),
          tool_choice: 'any',
        };
      default: {
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported tool choice type: ${_exhaustiveCheck}`);
      }
    }
  }