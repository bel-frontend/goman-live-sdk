import json
import os
from typing import Any, Callable, Dict, List, Optional, Union
import requests
import websocket
import base64

class Config:
    def __init__(self, application_id: str, api_key: str, base_url: str):
        self.application_id = application_id
        self.api_key = api_key
        self.base_url = base_url


class PromptResponse:
    def __init__(self, id: str, value: str, metadata: Dict[str, Any]):
        self.id = id
        self.value = value
        self.metadata = metadata


class PromptSDK:
    def __init__(self, application_id: str, api_key: str, base_url: str):
        self.config = Config(application_id, api_key, base_url)
        self.socket: Optional[WebSocket] = None
        self.callbacks: List[Callable[..., Any]] = []

    def get_prompt_from_remote(
        self,
        prompt_id: str,
        context: Dict[str, str] = {},
        options: Dict[str, str] = {},
    ) -> PromptResponse:
        url = options.get("url", f"{self.config.base_url}/prompts/{prompt_id}")
        headers = {
            "apiKey": self.config.api_key,
            "applicationId": self.config.application_id,
        }

        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            raise Exception(
                f"Failed to fetch template: {response.status_code} {response.reason}"
            )
        json_response = response.json()
        template = json_response.get("value")
        metadata = json_response.get("metadata", {})

        if not template:
            raise Exception(
                f"Failed to fetch template: {response.status_code} {response.reason}"
            )

        # Replace variables in the template with environment or context values
        processed_template = template.format(**{
            key: os.getenv(key, context.get(key, match))
            for key, match in context.items()
        })

        return PromptResponse(prompt_id, processed_template, metadata)

    def send_json_result_to_editor(self, result_json: str, prompt_id: str ):
        if not prompt_id:
            raise Exception("Prompt ID is required")
        
        url = f"{self.config.base_url}/promts-sdk-result/{prompt_id}"
        print(url)
        headers = {
            "apiKey": self.config.api_key,
            "applicationId": self.config.application_id,
            "Content-Type": "application/json",
        }
        if isinstance(result_json, dict):
            result_json = json.dumps(result_json)
        response = requests.post(url, headers=headers, data=result_json)
        if response.status_code != 200:
            raise Exception(
                f"Failed to send result: {response.status_code} {response.reason} {response.text} {response}"
            )
        return response.json()

    def send_image_result_to_editor(self, result_image: Union[str, bytes], prompt_id: str):
        if not prompt_id:
            raise Exception("Prompt ID is required")
        url = f"{self.config.base_url}/promts-sdk-result/{prompt_id}/image"
        headers = {
            "apiKey": self.config.api_key,
            "applicationId": self.config.application_id,
        }
        
        file_data = base64.b64decode(result_image)
        

        files = {
            'file': file_data,
        }   
        response = requests.post(url, files=files , headers=headers)
        if response.status_code != 200:
            raise Exception(
                f"Failed to send result: {response.status_code} {response.reason}"
            )
        return response.json()
    


    def init_socket(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        application_id: Optional[str] = None,
        prompt_id: str = "",
        close_socket_after_callback: bool = False,
    ):
        api_key = api_key or self.config.api_key
        application_id = application_id or self.config.application_id
        uri = f"{base_url}?promptId={prompt_id}&apiKey={api_key}&applicationId={application_id}"
        print(f"Connecting to WebSocket at {uri}")
        def on_message(ws, message):
            results = []
            data = json.loads(message)
            print(f"Parsed message data: {data}")
            for callback in self.callbacks:
                res = callback(data)
                results.append(res)

            print(f"Callback results: {results}")
            self.socket.send(json.dumps({"results": results}))

            if close_socket_after_callback:
                print("Closing WebSocket after callback")
                self.socket.close()

        def on_error(ws, error):
            print(error)

        def on_close(ws, close_status_code, close_msg):
            print("### closed ###")

        def on_open(ws):
            print("Opened connection")

        print("Connected to WebSocket")
        print(f"Prompt ID: {prompt_id}")
        print(f"callbacks: {self.callbacks}")

        ws = websocket.WebSocketApp(uri,
                              on_open=on_open,
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close)
        self.socket = ws
        ws.run_forever()

        # ws.run_forever(dispatcher=rel, reconnect=5) 

        # try:
        #     while True:
        #         print("Waiting for message...")
        #         message = self.socket.recv()
        #         print(f"Received message: {message}")
        #         results = []
        #         data = json.loads(message)
        #         print(f"Parsed message data: {data}")
        #         for callback in self.callbacks:
        #             res = callback(data)
        #             results.append(res)

        #         print(f"Callback results: {results}")
        #         self.socket.send(json.dumps({"results": results}))

        #         if close_socket_after_callback:
        #             print("Closing WebSocket after callback")
        #             self.socket.close()
        #             break
        # except Exception as e:
        #     print(f"Error in WebSocket message handling: {e}")

    def close_socket(self):
        if self.socket:
            self.socket.close()

    def init_callbacks(self, callback: Callable[..., Any]):
        self.callbacks.append(callback)
