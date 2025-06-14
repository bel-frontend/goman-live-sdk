import { wrapBraces } from "./wrapBraces";

describe("wrapBraces", () => {
  it("should convert triple braces to single and wrap single braces with double", () => {
    const input = 'test prompt {{{data}}} : bla bla {"data":"dfsdkfhskd"}';
    const expected = 'test prompt {data} : bla bla {{"data":"dfsdkfhskd"}}';
    expect(wrapBraces(input)).toBe(expected);
  });

  it("should wrap single braces and leave double braces as-is", () => {
    const input = "{key} and {{{value}}} and {{ignored}}";
    const expected = "{{key}} and {value} and {{ignored}}";
    expect(wrapBraces(input)).toBe(expected);
  });

  it("should leave strings without braces untouched", () => {
    expect(wrapBraces("Nothing here")).toBe("Nothing here");
  });

  it("should handle multiple mixed brace types", () => {
    const input = "{{{a}}} {b} {{{c}}}";
    const expected = "{a} {{b}} {c}";
    expect(wrapBraces(input)).toBe(expected);
  });

  it("should not double-wrap already double braces", () => {
    const input = "Mixed {one} and {{two}} and {{{three}}}";
    const expected = "Mixed {{one}} and {{two}} and {three}";
    expect(wrapBraces(input)).toBe(expected);
  });

  //   it("should handle nested braces correctly", () => {
  //     const input = "Start {a{b}c} and {{{d}}}";
  //     const expected = "Start {{a{b}c}} and {d}";
  //     expect(wrapBraces(input)).toBe(expected);
  //   });

  it("should not modify already double-wrapped braces", () => {
    const input = "{{already}}";
    const expected = "{{already}}";
    expect(wrapBraces(input)).toBe(expected);
  });

  it("should handle empty braces", () => {
    const input = "{} and {{{}}}";
    const expected = "{{}} and {}";
    expect(wrapBraces(input)).toBe(expected);
  });

  it("should handle user prompt correctly", () => {
    const input = `{{{name}}} You are a professional copywriter-translator. Check the users content to ensure it pertains to news about technologies, AI, devices,phones, computers, laptops, gadgets, large companies (MANG, Tesla, Samsung, etc), science, discoveries, computer games, movies, etc.  If the news is not about these topics, return the response JSON: {"title":"error", "content": null}.  Otherwise, make summary-brief (no more 150 words) and translate result to Belarussian language. Return  text only on Belarussian language.`;
    const expected = `{name} You are a professional copywriter-translator. Check the users content to ensure it pertains to news about technologies, AI, devices,phones, computers, laptops, gadgets, large companies (MANG, Tesla, Samsung, etc), science, discoveries, computer games, movies, etc.  If the news is not about these topics, return the response JSON: {{"title":"error", "content": null}}.  Otherwise, make summary-brief (no more 150 words) and translate result to Belarussian language. Return  text only on Belarussian language.`;
    console.log(`Result: ${wrapBraces(input)}`);

    expect(wrapBraces(input)).toBe(expected);
  });
});
