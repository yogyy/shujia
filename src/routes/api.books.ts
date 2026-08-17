import { createFileRoute } from "@tanstack/react-router";
import { db } from "../db";

export const Route = createFileRoute("/api/books")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const books = await db.query.books.findMany();
				return new Response(JSON.stringify(books), { status: 200 });
			},
		},
	},
});
