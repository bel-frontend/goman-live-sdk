import { PromptBuilder } from "./PromptBuilder";

describe("PromptBuilder", () => {
  it("normalize() should convert triple braces to single braces", () => {
    const builder = new PromptBuilder("Hello, {{{name}}}!");
    builder.normalize();
    expect(builder.get()).toBe("Hello, {name}!");
  });

  it("fill() should replace placeholders with context values", () => {
    const builder = new PromptBuilder("Hi, {user}!");
    builder.fill({ user: "Alex" });
    expect(builder.get()).toBe("Hi, Alex!");
  });

  it("escapeJsonPlaceholders() should insert escaped JSON", () => {
    const builder = new PromptBuilder("Data: {json}");
    builder.escapeJsonPlaceholders({ json: { foo: "bar" } });
    expect(builder.get()).toBe('Data: {\\"foo\\":\\"bar\\"}');
  });

  it("findPlaceholders() should return all unique placeholders", () => {
    const builder = new PromptBuilder("A {x} and {y} and {x}");
    expect(builder.findPlaceholders().sort()).toEqual(["x", "y"]);
  });

  it("validate() should return missing placeholders", () => {
    const builder = new PromptBuilder("Hello, {a} {b}!");
    expect(builder.validate({ a: "1" })).toEqual(["b"]);
  });

  it("get() should return the processed template", () => {
    const builder = new PromptBuilder("Test");
    expect(builder.get()).toBe("Test");
  });

  it("toString() should return the processed template", () => {
    const builder = new PromptBuilder("Test2");
    expect(builder.toString()).toBe("Test2");
  });

  it("getMetadata() should return metadata", () => {
    const builder = new PromptBuilder("T", { foo: 123 });
    expect(builder.getMetadata()).toEqual({ foo: 123 });
  });

  it("should handle prompt containing JSON string", () => {
    const jsonString = '{"foo":"bar","baz":123}';
    const builder = new PromptBuilder(`Here is JSON: {json}`);
    builder.fill({ json: jsonString });
    expect(builder.get()).toBe(`Here is JSON: ${jsonString}`);
  });

  it("should handle prompt containing figured dashes (–, —)", () => {
    const builder = new PromptBuilder("Start – {word} — End");
    builder.fill({ word: "middle" });
    expect(builder.get()).toBe("Start – middle — End");
  });

  it("should handle prompt containing both JSON and plain text placeholders", () => {
    const builder = new PromptBuilder("User: {username}, Data: {json}");
    builder
      .fill({ username: "Alex" })
      .escapeJsonPlaceholders({ json: { foo: "bar", num: 42 } });
    expect(builder.get()).toBe(
      'User: Alex, Data: {\\"foo\\":\\"bar\\",\\"num\\":42}'
    );
  });

  it("should handle a prompt with instructions and embedded JSON example", () => {
    const prompt = `
You are a professional copywriter-translator. Check the users content to ensure it pertains to news about technologies, AI, devices,phones, computers, laptops, gadgets, large companies (MANG, Tesla, Samsung, etc), science, discoveries, computer games, movies, etc.  If the news is not about these topics, return the response JSON: {"title":"error", "content": null}.  Otherwise, make summary-brief (no more 150 words) and translate result to Belarussian language. Return  text only on Belarussian language.
`;

    const builder = new PromptBuilder(prompt);

    // The prompt should remain unchanged, as there are no placeholders to fill or escape
    expect(builder.get()).toContain('{"title":"error", "content": null}');
    expect(builder.get()).toMatch(/Belarussian language/i);
  });
});
