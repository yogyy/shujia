import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { nanoid } from "nanoid";

const MAX_SIZE = 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const formData = await request.formData();
          const file = formData.get("file");

          if (!(file instanceof File)) {
            return Response.json({ error: "No file provided" }, { status: 400 });
          }
          if (!ALLOWED_TYPES.has(file.type)) {
            return Response.json(
              { error: "Unsupported format. Use JPEG, PNG, WebP, GIF or AVIF." },
              { status: 415 },
            );
          }
          if (file.size > MAX_SIZE) {
            return Response.json({ error: "File exceeds the 1MB limit." }, { status: 413 });
          }

          const ext = EXTENSIONS[file.type];
          const key = `shujia/cover/${Date.now().toString(36)}-${nanoid(8)}.${ext}`;
          console.log(key);
          const object = await env.R2.put(key, file, {
            httpMetadata: { contentType: file.type },
          });

          if (object === null) {
            return new Response("Precondition failed or upload returned null", { status: 412 });
          }

          const url = `${env.R2_PUBLIC_URL}/${key}`;
          return Response.json({ url, key }, { status: 201 });
        } catch (err) {
          return new Response(`Internal server error: ${err}`, { status: 500 });
        }
      },
    },
  },
});
