export class PromptBuilder {
  private rawTemplate: string;
  private processedTemplate: string;

  constructor(template: string, private metadata: Record<string, any> = {}) {
    this.rawTemplate = template;
    this.processedTemplate = template;
  }

  /**
   * Replaces all triple-brace placeholders (e.g., {{{key}}}) with single-brace ({key}).
   */
  normalize(): this {
    this.processedTemplate = this.processedTemplate.replace(
      /\{\{\{(\w+)\}\}\}/g,
      "{$1}"
    );
    return this;
  }

  /**
   * Replaces {key} in the template with values from context.
   */
  fill(context: Record<string, string>): this {
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      this.processedTemplate = this.processedTemplate.replace(regex, value);
    }
    return this;
  }

  /**
   * Replaces {key} in template with escaped JSON strings.
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
   * Protects inline JSON blocks from LangChain placeholder parsing by replacing braces with safe markers.
   */
  protectJsonBlocks(): this {
    const jsonLikeBlocks = this.processedTemplate.match(/(\{[^{}]+\})/g);
    if (jsonLikeBlocks) {
      for (const block of jsonLikeBlocks) {
        try {
          JSON.parse(block);
          const protectedBlock = block
            .replace(/\{/g, "{{'{'}}")
            .replace(/\}/g, "{{'}'}}");
          this.processedTemplate = this.processedTemplate.replace(
            block,
            protectedBlock
          );
        } catch {
          // skip non-JSON
        }
      }
    }
    return this;
  }

  /**
   * Returns the final built prompt string.
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

  /**
   * Returns the processed template string.
   */
  get(): string {
    return this.processedTemplate;
  }
}
