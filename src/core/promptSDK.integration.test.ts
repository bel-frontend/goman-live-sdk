import { PromptSDK } from "../index";
import { PromptBuilder } from "./PromptBuilder";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

// Mock fetch for Node.js environment
global.fetch = require("jest-fetch-mock");

describe("PromptSDK Integration", () => {
  const applicationId = "test-app";
  const apiKey = "test-key";
  const baseUrl = "https://api.goman.live";
  const promptId = "test-prompt-id";

  let sdk: PromptSDK;

  beforeEach(() => {
    sdk = new PromptSDK({ applicationId, apiKey, baseUrl });
    fetchMock.resetMocks();
  });

  it("should fetch and process a prompt with context", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        value: "Hello, {{{username}}}! Your code: {{{code}}}",
        metadata: { lang: "en" },
      })
    );

    const response = await sdk.getPromptFromRemote(promptId, {
      username: "Adam",
      code: "1234",
    });

    expect(response.value).toBe("Hello, Adam! Your code: 1234");
    expect(response.metadata).toEqual({ lang: "en" });
  });

  it("should return a PromptBuilder instance with processed template", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        value: "User: {{{user}}}, Data: {json}",
        metadata: { type: "test" },
      })
    );

    const builder = await sdk.getPromptBuilder(promptId, { user: "Alex" });
    expect(builder).toBeInstanceOf(PromptBuilder);

    builder.escapeJsonPlaceholders({ json: { foo: "bar" } });
    expect(builder.get()).toBe('User: Alex, Data: {\\"foo\\":\\"bar\\"}');
  });

  it("should handle prompts with no placeholders", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        value: "Static prompt with no variables.",
        metadata: {},
      })
    );

    const response = await sdk.getPromptFromRemote(promptId);
    expect(response.value).toBe("Static prompt with no variables.");
  });

  it("should handle complex instruction prompt with embedded JSON", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        value: `You are a professional copywriter-translator. If the news is not about these topics, return the response JSON: {errorJson}.`,
        metadata: {},
      })
    );

    const builder = await sdk.getPromptBuilder(promptId);
    builder.escapeJsonPlaceholders({
      errorJson: { title: "error", content: null },
    });

    expect(builder.get()).toContain(
      '{\\"title\\":\\"error\\",\\"content\\":null}'
    );
  });

  it("should throw error if promptId is missing for sendJsonResultToEditor", async () => {
    await expect(
      sdk.sendJsonResultToEditor({ foo: "bar" }, "")
    ).rejects.toThrow("Prompt ID is required");
  });

  it("should handle a real-world instruction prompt with embedded JSON example", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        value: `You are a professional copywriter-translator. Check the users content to ensure it pertains to news about technologies, AI, devices,phones, computers, laptops, gadgets, large companies (MANG, Tesla, Samsung, etc), science, discoveries, computer games, movies, etc.  If the news is not about these topics, return the response JSON: {errorJson}.  Otherwise, make summary-brief (no more 150 words) and translate result to Belarussian language. Return  text only on Belarussian language.`,
        metadata: {},
      })
    );

    const builder = await sdk.getPromptBuilder(promptId);
    builder.escapeJsonPlaceholders({
      errorJson: { title: "error", content: null },
    });

    expect(builder.get()).toContain(
      '{\\"title\\":\\"error\\",\\"content\\":null}'
    );
    expect(builder.get()).toMatch(/Belarussian language/i);
  });

  // You can add more integration tests for sendJsonResultToEditor, sendImageResultToEditor, and WebSocket logic as needed.
});
