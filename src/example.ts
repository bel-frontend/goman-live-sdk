// @ts-ignore
import { PromptSDK } from "goman-live";
import fs from "fs";

(() => {
  const applicationId = "appID87b9abb0d07b";
  const apikey =
    "apkdf59b4097d660c2a8e38c9d2947085fb4a66f1234275eeeb0ac572c18bf00427";
  const baseurl = "https://api.goman.live";

  const sdk = new PromptSDK({
    applicationId,
    apiKey: apikey,
    baseUrl: baseurl,
  });

  const promptId = "6755b6fa1ea892fc7e6c846b";

  sdk.initSocket("ws://localhost:3006", {
    promptId: promptId,
    apiKey: apikey,
    applicationId: applicationId,
    closeSocketAfterCallback: false,
  });
  const image = fs.readFileSync("src/modules/news_bot/controller/test.png");
  sdk.addCallback((data: any) => {
    sdk
      .getPromptFromRemote("6755b6fa1ea892fc7e6c846b", {
        USERNAME: "test",
      })
      .then(
        (prompt: {
          value: string;
          id: string;
          metadata: Record<string, any>;
        }) => {
          console.log("prompt", prompt);
        }
      )
      .catch((error: any) => {
        console.log("error", error);
      });

    setTimeout(() => {
      sdk.sendJsonResultToEditor({ results: "test" }, promptId);
    }, 1000);

    setTimeout(() => {
      sdk.sendJsonResultToEditor({ results: "test2" }, promptId);
    }, 2000);

    setTimeout(async () => {
      await sdk.sendJsonResultToEditor({ results: "test3" }, promptId);

      sdk.sendImageResultToEditor(image, promptId);
      // sdk.closeSocket();
    }, 3000);
  });
})();
