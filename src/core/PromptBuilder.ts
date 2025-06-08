export class PromptBuilder {
  private rawTemplate: string;
  private processedTemplate: string;
  private metadata: Record<string, any>;

  constructor(template: string, metadata: Record<string, any> = {}) {
    this.rawTemplate = template;
    this.processedTemplate = template;
    this.metadata = metadata;
  }

  /**
   * Replaces all triple-brace placeholders (e.g., {{{key}}}) with single-brace placeholders ({key}).
   * Useful for normalizing templates before further processing.
   * @returns The current PromptBuilder instance for chaining.
   */
  normalize(): this {
    this.processedTemplate = this.processedTemplate.replace(
      /\{\{\{(\w+)\}\}\}/g,
      "{$1}"
    );
    return this;
  }

  /**
   * Fills all single-brace placeholders ({key}) in the template with values from the provided context.
   * @param context - An object containing key-value pairs for replacement.
   * @returns The current PromptBuilder instance for chaining.
   */
  fill(context: Record<string, string>): this {
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      this.processedTemplate = this.processedTemplate.replace(regex, value);
    }
    return this;
  }

  /**
   * Escapes and inserts JSON objects into placeholders in the template.
   * Each placeholder {key} will be replaced with the escaped JSON string of the corresponding object.
   * @param placeholders - An object where each key is a placeholder and the value is the object to insert.
   * @returns The current PromptBuilder instance for chaining.
   */
  escapeJsonPlaceholders(placeholders: Record<string, object>): this {
    for (const [key, obj] of Object.entries(placeholders)) {
      const escaped = JSON.stringify(obj)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');
      const regex = new RegExp(`\\{${key}\\}`, "g");
      this.processedTemplate = this.processedTemplate.replace(regex, escaped);
    }
    return this;
  }

  /**
   * Finds all unique single-brace placeholders ({key}) in the current template.
   * @returns An array of unique placeholder keys found in the template.
   */
  findPlaceholders(): string[] {
    const matches = this.processedTemplate.match(/\{(\w+)\}/g);
    return matches
      ? Array.from(new Set(matches.map((m) => m.slice(1, -1))))
      : [];
  }

  /**
   * Returns a list of placeholders that are present in the template but missing from the provided context.
   * @param context - An object containing key-value pairs for validation.
   * @returns An array of missing placeholder keys.
   */
  validate(context: Record<string, string>): string[] {
    return this.findPlaceholders().filter((key) => !(key in context));
  }

  /**
   * Returns the final processed template string after all modifications.
   * @returns The processed template string.
   */
  get(): string {
    return this.processedTemplate;
  }

  /**
   * Returns the processed template string for logging or string conversion.
   * @returns The processed template string.
   */
  toString(): string {
    return this.get();
  }

  /**
   * Returns the metadata associated with the template.
   * @returns The metadata object.
   */
  getMetadata(): Record<string, any> {
    return this.metadata;
  }

  /**
   * Scans the processed template for JSON-like blocks (e.g., { "key": "value" }) and escapes them for safe use with LangChain or similar tools.
   *
   * For each detected JSON block, if it is valid JSON, it will be stringified and escaped (backslashes and quotes) and wrapped in double quotes,
   * making it suitable for embedding in other JSON or prompt templates.
   *
   * This is useful when your prompt contains example JSON or expects to output JSON as part of the template, and you want to avoid parsing issues.
   *
   * @returns The current PromptBuilder instance for chaining.
   *
   * @example
   * const builder = new PromptBuilder('Return: { "foo": "bar" }');
   * builder.sanitizeForLangChain();
   * // builder.get() will now contain: Return: "{\"foo\":\"bar\"}"
   */
  protectJsonBlocks(): this {
    const jsonLikeBlocks = this.processedTemplate.match(/(\{[^{}]+\})/g);
    if (jsonLikeBlocks) {
      for (const block of jsonLikeBlocks) {
        try {
          JSON.parse(block); // калі гэта сапраўдны JSON
          const protectedBlock = block
            .replace(/\{/g, "{{'{'}}")
            .replace(/\}/g, "{{'}'}}");
          this.processedTemplate = this.processedTemplate.replace(
            block,
            protectedBlock
          );
        } catch {
          // не JSON — прапускаем
        }
      }
    }
    return this;
  }

  /**
   * Builds and returns a final prompt string with optional context substitution,
   * JSON escaping, and full sanitation for use with LangChain or similar systems.
   *
   * @param context - Optional map of simple key-value substitutions.
   * @param jsonPlaceholders - Optional map of key -> JSON object to escape and inject.
   * @returns Final processed prompt string.
   */
  build(
    context: Record<string, string> = {},
    jsonPlaceholders: Record<string, object> = {}
  ): string {
    return this.normalize()
      .fill(context)
      .escapeJsonPlaceholders(jsonPlaceholders)
      .protectJsonBlocks()
      .get();
  }
}
