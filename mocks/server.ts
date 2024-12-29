import { setupServer } from "msw/node";

export const server = setupServer(
  // @ts-ignore
  {
    predicate: (req: any) =>
      req.method === "GET" && req.url.pathname === "/prompts/prompt-id",
    resolver: (req: any, res: any, ctx: any) => {
      return res(
        ctx.status(200),
        ctx.json({
          value: "Hello, {{{username}}}! Welcome to our platform.",
          metadata: { type: "greeting" },
        })
      );
    },
  },
  // Mock a POST request
  {
    predicate: (req: any) =>
      req.method === "POST" &&
      req.url.pathname.startsWith("/promts-sdk-result"),
    resolver: (req: any, res: any, ctx: any) => {
      return res(ctx.status(200), ctx.json({ success: true }));
    },
  }
);
