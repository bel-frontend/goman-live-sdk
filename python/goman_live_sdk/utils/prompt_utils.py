import json
import re

def normalize_prompt_template(template: str) -> str:
    """
    Замяняе {{{var}}} на {var}, каб сумяшчаць з LangChain.
    """
    return re.sub(r"\{\{\{(\w+)\}\}\}", r"{\1}", template)


def escape_json_for_prompt(obj: dict) -> str:
    """
    Экраніруе JSON для бяспечнага ўстаўлення ў промпт.
    """
    return json.dumps(obj).replace("\\", "\\\\").replace('"', '\\"')
