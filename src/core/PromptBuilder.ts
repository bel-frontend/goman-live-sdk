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
   * Замяняе {{{key}}} на {key}
   */
  normalize(): this {
    this.processedTemplate = this.processedTemplate.replace(
      /\{\{\{(\w+)\}\}\}/g,
      "{$1}"
    );
    return this;
  }

  /**
   * Падстаўляе з context усе {key} значэнні
   */
  fill(context: Record<string, string>): this {
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      this.processedTemplate = this.processedTemplate.replace(regex, value);
    }
    return this;
  }

  /**
   * Экраніруе значэнні JSON-плэйсхолдараў
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
   * Вяртае спіс усіх {key} у шаблоне
   */
  findPlaceholders(): string[] {
    const matches = this.processedTemplate.match(/\{(\w+)\}/g);
    return matches
      ? Array.from(new Set(matches.map((m) => m.slice(1, -1))))
      : [];
  }

  /**
   * Вяртае незапоўненыя ключы
   */
  validate(context: Record<string, string>): string[] {
    return this.findPlaceholders().filter((key) => !(key in context));
  }

  /**
   * Вяртае фінальны радок промпта
   */
  get(): string {
    return this.processedTemplate;
  }

  /**
   * Версія для console.log / String(builder)
   */
  toString(): string {
    return this.get();
  }

  /**
   * Доступ да metadata
   */
  getMetadata(): Record<string, any> {
    return this.metadata;
  }
}
