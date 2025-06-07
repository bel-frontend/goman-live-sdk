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
}
