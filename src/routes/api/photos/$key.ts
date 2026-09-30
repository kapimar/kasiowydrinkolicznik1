import { createFileRoute } from "@tanstack/react-router";
import { getPhoto } from "../../../server/drinks.server.js";

export const Route = createFileRoute("/api/photos/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const photo = await getPhoto(params.key);
        if (!photo) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(photo.data, {
          headers: {
            "Content-Type": photo.contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
