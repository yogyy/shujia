import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => await getBooks(),
});

function Home() {
	const data = Route.useLoaderData();
	return (
		<div className="p-8">
			<h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
			<p className="mt-4 text-lg">
				Edit <code>src/routes/index.tsx</code> to get started.
			</p>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
}

const getBooks = createServerFn({ method: "GET" }).handler(async () => {
	const books = await db.query.books.findMany();
	return books;
});
