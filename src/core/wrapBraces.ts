export function wrapBraces(text: string): string {
  const placeholders: string[] = [];

  // 1. Замяняем {{{...}}} на плейсхолдары
  text = text.replace(/{{{(.*?)}}}/g, (_match, p1) => {
    const token = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(`{${p1}}`);
    return token;
  });

  // 2. Абгортваем адзінарныя фігурныя дужкі, **уключаючы пустыя**
  text = text.replace(/(?<!{){([^{}]*)}(?!})/g, (_match, p1) => `{{${p1}}}`);

  // 3. Вяртаем плейсхолдары назад
  placeholders.forEach((value, index) => {
    text = text.replace(`__PLACEHOLDER_${index}__`, value);
  });

  return text;
}
