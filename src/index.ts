// Dependencies for Node.js (not required in the browser)
import * as base64 from "base64-js";
import { UniversalWebSocket } from "./WebsocketReconnect";
export { UniversalWebSocket } from "./WebsocketReconnect";

interface Config {
  applicationId: string;
  apiKey: string;
  baseUrl?: string;
  promptId?: string;
}

interface PromptResponse {
  id: string;
  value: string;
  metadata: Record<string, any>;
}

type Callback = (data: any) => any;

export class PromptSDK {
  private config: Config;
  private socket: UniversalWebSocket | null = null;
  private callbacks: Callback[] = [];
  private promptId: string = "";

  /**
   * Creates an instance of the PromptSDK.
   * @param applicationId - The unique identifier for the application.
   * @param apiKey - The API key for authenticating requests.
   * @param baseUrl - The base URL of the API server.
   */

  constructor({
    applicationId,
    apiKey,
    baseUrl = "https://api.goman.live",
  }: Config) {
    this.config = { applicationId, apiKey, baseUrl };
  }

  /**
   * Fetches a prompt from the remote server and processes the template with context.
   * @param promptId - The ID of the prompt to fetch.
   * @param context - A dictionary of context variables to replace in the template.
   * @param options - Additional options such as a custom URL for fetching the prompt.
   * @returns A promise that resolves to the processed prompt response.
   */
  async getPromptFromRemote(
    promptId: string,
    context: Record<string, string> = {},
    options: {
      url?: string;
    } = {}
  ): Promise<PromptResponse> {
    const url = options?.url || `${this.config.baseUrl}/prompts/${promptId}`;
    const headers = {
      apiKey: this.config.apiKey,
      applicationId: this.config.applicationId,
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch template: ${response.status} ${response.statusText}`
      );
    }

    const jsonResponse = await response.json();
    const template: string = jsonResponse.value;
    const metadata = jsonResponse.metadata || {};

    if (!template) {
      throw new Error(`Template value is missing in the response.`);
    }

    const processedTemplate = template.replace(
      /\{\{\{(\w+)\}\}\}/g,
      (_, key) => {
        return process.env[key] || context[key] || `{${key}}`;
      }
    );

    return { id: promptId, value: processedTemplate, metadata };
  }

  /**
   * Sends a JSON result to the editor for a specific prompt.
   * @param resultJson - The JSON object or string to send.
   * @param promptId - The ID of the prompt associated with the result.
   * @returns A promise that resolves to the server's response.
   */
  async sendJsonResultToEditor(
    resultJson: Record<string, any> | string,
    promptId: string
  ): Promise<any> {
    if (!promptId) throw new Error("Prompt ID is required");

    const url = `${this.config.baseUrl}/promts-sdk-result/${promptId}`;
    const headers = {
      apiKey: this.config.apiKey,
      applicationId: this.config.applicationId,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(resultJson),
      });
      return response.json();
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to send result: ${error}`);
    }
  }

  /**
   * Sends an image result to the editor for a specific prompt.
   * @param resultImage - The image as a base64 string or ArrayBuffer to send.
   * @param promptId - The ID of the prompt associated with the image.
   * @returns A promise that resolves to the server's response.
   */
  async sendImageResultToEditor(
    resultImage: string | ArrayBuffer,
    promptId: string
  ): Promise<any> {
    if (!promptId) throw new Error("Prompt ID is required");

    const url = `${this.config.baseUrl}/promts-sdk-result/${promptId}/image`;
    const headers = {
      apiKey: this.config.apiKey,
      applicationId: this.config.applicationId,
    };

    const fileData =
      typeof resultImage === "string"
        ? base64.toByteArray(resultImage)
        : resultImage;

    const formData = new FormData();
    formData.append("file", new Blob([fileData]));

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send result: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * Initializes a WebSocket connection for real-time communication.
   * @param baseUrl - The base URL of the WebSocket server.
   * @param apiKey - (Optional) The API key for authentication. Defaults to the configured API key.
   * @param applicationId - (Optional) The application ID for authentication. Defaults to the configured application ID.
   * @param promptId - (Optional) The ID of the prompt associated with the connection.
   * @param closeSocketAfterCallback - Whether to close the WebSocket after processing a callback.
   * @param onConnect - A callback function to execute when the WebSocket connection is opened.
   * @param onCloseConnection - A callback function to execute when the WebSocket connection is closed.
   * @param onMessage - A callback function to execute when a message is received.
   * @param onError - A callback function to execute when an error occurs.
   * @returns A promise that resolves to the WebSocket connection.
   */
  async initSocket({
    baseUrl = "wss://api.goman.live/ws_sdk",
    apiKey = this.config.apiKey,
    applicationId = this.config.applicationId,
    promptId = this.promptId,
    closeSocketAfterCallback = true,
    onConnect = () => {},
    onCloseConnection = () => {},
    onMessage = (data: any) => {},
    onError = (error: any) => {},
  }: {
    baseUrl?: string;
    apiKey?: string;
    applicationId?: string;
    promptId?: string;
    closeSocketAfterCallback?: boolean;
    onConnect?: () => void;
    onCloseConnection?: () => void;
    onMessage?: (data: any) => void;
    onError?: (error: any) => void;
  }) {
    this.promptId = promptId;
    const uri = `${baseUrl}?promptId=${promptId}&apiKey=${apiKey}&applicationId=${applicationId}`;
    console.log(`Connecting to WebSocket at ${uri}`);
    this.socket = new UniversalWebSocket(uri, {
      maxReconnectAttempts: 5,
      reconnectInterval: 3000,
      onOpen: (event) => {
        console.log("WebSocket connection opened.");
        onConnect();
      },
      onMessage: (event) => {
        console.log(`Received message: ${event}`);
        const data = event;
        onMessage(data);

        const results = this.callbacks.map((callback) => callback(data)); // todo: add async support

        if (this.socket) {
          this.socket.send(JSON.stringify({ results }));
        }

        if (closeSocketAfterCallback && this.socket) {
          this.socket.close();
          console.log("WebSocket connection closed after callback.");
        }
      },
      onError: (error) => {
        console.error(`WebSocket error: ${error}`);
        onError(error);
      },
      onClose: (event) => {
        console.log("WebSocket connection closed.");
        onCloseConnection();
      },
    });
  }

  /**
   * Closes the WebSocket connection if it is open.
   */
  closeSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Adds a callback to be executed when a WebSocket message is received.
   * @param callback - The callback function to handle WebSocket messages.
   */
  addCallback(callback: Callback) {
    this.callbacks.push(callback);
  }
}
