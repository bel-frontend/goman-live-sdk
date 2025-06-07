import re
from typing import Dict, List
from utils.prompt_utils import normalize_prompt_template, escape_json_for_prompt


class PromptBuilder:
    def __init__(self, template: str, metadata: Dict = None):
        self.raw_template = template
        self.processed_template = template
        self.metadata = metadata or {}

    def normalize(self):
        self.processed_template = normalize_prompt_template(self.processed_template)
        return self

    def find_placeholders(self) -> List[str]:
        return list(set(re.findall(r"\{(\w+)\}", self.processed_template)))

    def fill(self, context: Dict[str, str]):
        for key, value in context.items():
            self.processed_template = self.processed_template.replace(f"{{{key}}}", value)
        return self

    def escape_json_placeholders(self, placeholders: Dict[str, dict]):
        for key, obj in placeholders.items():
            escaped = escape_json_for_prompt(obj)
            self.processed_template = self.processed_template.replace(f"{{{key}}}", escaped)
        return self

    def validate(self, context: Dict[str, str]) -> List[str]:
        return [key for key in self.find_placeholders() if key not in context]

    def get(self) -> str:
        return self.processed_template

    def get_metadata(self) -> Dict:
        return self.metadata

    def __str__(self):
        return self.get()
