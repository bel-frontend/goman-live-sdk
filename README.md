# goman-live

`goman-live` is a lightweight library for interacting with remote templates, metadata, and real-time communication. This SDK provides powerful tools for fetching, processing, and sending data to remote servers, all while maintaining a simple and flexible API.

---

## Features

- Fetch templates from a remote server with dynamic context injection.
- Replace placeholders in templates with values from environment variables or provided context.
- **PromptBuilder**: Advanced prompt processing and normalization.
- Send JSON and image results to a remote editor.
- Real-time communication with WebSocket support for callbacks and prompt interactions.
- Includes metadata handling for additional customization.

---

## Installation

Install the SDK using npm or yarn:

```
npm install goman-live
```

or

```
yarn add goman-live
```

---

## Usage

### Import and Initialize the SDK

```
import { PromptSDK } from 'goman-live';

const applicationId = 'appID87b9abb0d07b';
const apikey =
    'apkdf59b4097d660c2a8e38c9d2947085fb4a66f1234275eeeb0ac572c18bf00427';

const baseurl = 'https://api.goman.live';
const sdk = new PromptSDK({
    applicationId,
    apiKey: apikey,
    baseUrl: baseurl,
});
```

---

### Fetch a Template

Use `getPromptFromRemote` to fetch and process a template from the remote server.

```
try {
    sdk.getPromptFromRemote('6755b6fa1ea892fc7e6c846b')
    .then((prompt) => {
        console.log('prompt', prompt);
    })
    .catch((error) => {
        console.log('error', error);
    });
} catch (error) {
    console.error('Error fetching prompt:', error);
}
```

---

### Example Template Processing

Given a template like:

`Hello, {{{username}}}! Welcome to our platform.`

When fetched with the context `{ username: 'JaneDoe' }`, the processed template will be:

`Hello, JaneDoe! Welcome to our platform.`

---

### Variable Support

Placeholders can also be replaced with environment variables if no matching key is found in the provided context.

- **Template**: `Welcome, {{{USERNAME}}}`
- **Variable**: `{USERNAME:SystemUser}`
- **Output**: `Welcome, SystemUser`

```
try {
    sdk.getPromptFromRemote('prompt_id',{USERNAME:'test'})
    .then((prompt) => {
        console.log('prompt', prompt);
    })
    .catch((error) => {
        console.log('error', error);
    });
} catch (error) {
    console.error('Error fetching prompt:', error);
}
```

---

## 🆕 Advanced Prompt Processing with `getPromptBuilder`

The new `getPromptBuilder` method returns a `PromptBuilder` instance for advanced prompt manipulation, normalization, and integration with tools like LangChain.

### Example

```
const builder = await sdk.getPromptBuilder("6755b6fa1ea892fc7e6c846b", { username: "Alex" });

const promptText = builder
  .normalize()
  .fill({ username: "Alex" })
  .escapeJsonPlaceholders({ errorJson: { title: "error", content: null } })
  .get();

console.log("Final prompt:", promptText);

// Integration with LangChain
// import { PromptTemplate } from "@langchain/core/prompts";
// const prompt = PromptTemplate.fromTemplate(promptText);
```

---

### Send JSON Results to Editor

Use `sendJsonResultToEditor` to send JSON data to the remote editor.

```
try {
    const result = await sdk.sendJsonResultToEditor(
        { key: 'value' }, // JSON data
        'prompt-id', // Associated prompt ID
    );
    console.log('Result sent successfully:', result);
} catch (error) {
    console.error('Error sending result:', error);
}
```

---

### Send Image Results to Editor

Use `sendImageResultToEditor` to send image data (as base64 or ArrayBuffer) to the remote editor.

```
try {
    const result = await sdk.sendImageResultToEditor(
        'base64-image-data', // Image as base64 string
        'prompt-id', // Associated prompt ID
    );
    console.log('Image sent successfully:', result);
} catch (error) {
    console.error('Error sending image:', error);
}
```

or file

```
const image = fs.readFileSync("src/modules/news_bot/controller/test.png");
sdk.sendImageResultToEditor(image, promptId);
```

---

### Real-Time Communication with WebSocket

Use `initSocket` to establish a WebSocket connection and process real-time messages with callbacks.

```
// Add a callback to handle incoming WebSocket messages
sdk.initSocket({
  promptId: promptId,
  apiKey: apikey,
  applicationId: applicationId,
  closeSocketAfterCallback: false,
});

// Example response to the server
sdk.addCallback((data: any) => {
    sdk
      .getPromptFromRemote("6755b6fa1ea892fc7e6c846b", {
        USERNAME: "test",
      })
      .then(
        (prompt: {
          value: string;
          id: string;
          metadata: Record<string, any>;
        }) => {
          console.log("prompt", prompt);
        }
      )
      .catch((error: any) => {
        console.log("error", error);
      });

    setTimeout(() => {
      sdk.sendJsonResultToEditor({ results: "test" }, promptId);
    }, 1000);

    setTimeout(() => {
      sdk.sendJsonResultToEditor({ results: "test2" }, promptId);
    }, 2000);

    setTimeout(async () => {
      await sdk.sendJsonResultToEditor({ results: "test3" }, promptId);

      sdk.sendImageResultToEditor(image, promptId);
      // sdk.closeSocket();
    }, 3000);
});
```

---

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
