# Goman Live SDK

The Goman Live SDK is a library for working with prompts, including fetching, testing, and getting results from models. It also supports WebSocket connections for real-time communication and callbacks.

## Installation

To install the SDK, use npm or yarn:

```bash
npm install goman-live
# or
yarn add goman-live
```

## Usage

### Importing the SDK

```typescript
import { PromptSDK } from "goman-live";
import fs from "fs";
```

### Initializing the SDK

```typescript
const applicationId = "appID87b9abb0d07b";
const apiKey =
  "apkdf59b4097d660c2a8e38c9d2947085fb4a66f1234275eeeb0ac572c18bf00427";
const baseUrl = "https://api.goman.live";

const sdk = new PromptSDK({
  applicationId,
  apiKey,
  baseUrl,
});
```

### Fetching a Prompt

```typescript
const promptId = "6755b6fa1ea892fc7e6c846b";

sdk
  .getPromptFromRemote(promptId, { USERNAME: "test" })
  .then((prompt) => {
    console.log("prompt", prompt);
  })
  .catch((error) => {
    console.log("error", error);
  });
```

### Sending Results to the Editor

#### Sending JSON Results

```typescript
sdk
  .sendJsonResultToEditor({ results: "test" }, promptId)
  .then((response) => {
    console.log("Response:", response);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

#### Sending Image Results

```typescript
const image = fs.readFileSync("src/modules/news_bot/controller/test.png");

sdk
  .sendImageResultToEditor(image, promptId)
  .then((response) => {
    console.log("Response:", response);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### Initializing a WebSocket Connection

```typescript
sdk.initSocket("ws://localhost:3006", {
  promptId: promptId,
  apiKey: apiKey,
  applicationId: applicationId,
  closeSocketAfterCallback: false,
  onConnect: () => {
    console.log("WebSocket connected.");
  },
  onCloseConnection: () => {
    console.log("WebSocket closed.");
  },
  onMessage: (data) => {
    console.log("Received message:", data);
  },
  onError: (error) => {
    console.error("WebSocket error:", error);
  },
});
```

### Adding a Callback

```typescript
sdk.addCallback((data) => {
  console.log("Callback data:", data);
});
```

## API Documentation

### `PromptSDK`

#### Constructor

```typescript
constructor({ applicationId, apiKey, baseUrl }: Config)
```

- `applicationId` (string): The unique identifier for the application.
- `apiKey` (string): The API key for authenticating requests.
- `baseUrl` (string): The base URL of the API server.

#### Methods

##### `getPromptFromRemote`

Fetches a prompt from the remote server and processes the template with context.

```typescript
async getPromptFromRemote(promptId: string, context?: Record<string, string>, options?: { url?: string }): Promise<PromptResponse>
```

- `promptId` (string): The ID of the prompt to fetch.
- `context` (Record<string, string>): A dictionary of context variables to replace in the template.
- `options` (object): Additional options such as a custom URL for fetching the prompt.

Returns a promise that resolves to the processed prompt response.

##### `sendJsonResultToEditor`

Sends a JSON result to the editor for a specific prompt.

```typescript
async sendJsonResultToEditor(resultJson: Record<string, any> | string, promptId: string): Promise<any>
```

- `resultJson` (Record<string, any> | string): The JSON object or string to send.
- `promptId` (string): The ID of the prompt associated with the result.

Returns a promise that resolves to the server's response.

##### `sendImageResultToEditor`

Sends an image result to the editor for a specific prompt.

```typescript
async sendImageResultToEditor(resultImage: string | ArrayBuffer, promptId: string): Promise<any>
```

- `resultImage` (string | ArrayBuffer): The image as a base64 string or ArrayBuffer to send.
- `promptId` (string): The ID of the prompt associated with the image.

Returns a promise that resolves to the server's response.

##### `initSocket`

Initializes a WebSocket connection for real-time communication.

```typescript
async initSocket(baseUrl: string, options: { apiKey?: string, applicationId?: string, promptId?: string, closeSocketAfterCallback?: boolean, onConnect?: () => void, onCloseConnection?: () => void, onMessage?: (data: any) => void, onError?: (error: any) => void }): Promise<void>
```

- `baseUrl` (string): The base URL of the WebSocket server.
- `options` (object): Additional options for the WebSocket connection.

##### `closeSocket`

Closes the WebSocket connection if it is open.

```typescript
closeSocket(): void
```

##### `addCallback`

Adds a callback to be executed when a WebSocket message is received.

```typescript
addCallback(callback: (data: any) => any): void
```

- `callback` (function): The callback function to handle WebSocket messages.

## License

This project is licensed under the MIT License.
