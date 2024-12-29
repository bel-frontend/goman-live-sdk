# Goman LIve

This SDK allows developers to easily fetch and manage prompt templates from a remote server. It supports both local environments and remote contexts, making it versatile for different projects. The package was developed as part of the [Goman.live](https://goman.live) SaaS product, which functions as a prompt management platform.

## Installation

To use this SDK in your Python project, install it via pip:

```bash
pip install goman-live-sdk
```

```python
from goman_live_sdk import PromptSDK
from prompt_sdk import PromptSDK

# Initialize the SDK
application_id = "your_application_id"
api_key = "your_api_key"
base_url = "https://api.example.com"
sdk = PromptSDK(application_id, api_key, base_url)

# Fetch a prompt from the remote server
prompt_id = "example_prompt_id"
context = {"username": "JohnDoe"}
options = {"url": "https://api.example.com/custom_prompts/example_prompt_id"}
try:
    prompt_response = sdk.get_prompt_from_remote(prompt_id, context, options)
    print(f"Prompt: {prompt_response.template}")
except Exception as e:
    print(f"Error fetching prompt: {e}")

# Send JSON result to the editor
result_json = {"result": "This is a test result"}
try:
    response = sdk.send_json_result_to_editor(result_json, prompt_id)
    print(f"Response: {response}")
except Exception as e:
    print(f"Error sending JSON result: {e}")

# Send image result to the editor
result_image = "base64_encoded_image_string"
try:
    response = sdk.send_image_result_to_editor(result_image, prompt_id)
    print(f"Response: {response}")
except Exception as e:
    print(f"Error sending image result: {e}")

# Initialize WebSocket connection
def example_callback(data):
    print(f"Received data: {data}")
    return {"status": "processed"}

sdk.init_callbacks(example_callback)
try:
    sdk.init_socket(base_url, api_key, application_id, prompt_id)
except Exception as e:
    print(f"Error initializing WebSocket: {e}")

# Close the WebSocket connection
sdk.close_socket()
```
