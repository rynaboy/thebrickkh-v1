import { notFound } from "next/navigation";
import React from "react";

type Props = {
	params: { projectName: string; id: string };
};

export default function ProductPage({ params }: Props) {
	const { projectName, id } = params || {} as any;

	if (!projectName || !id) return notFound();

	return (
		<main className="p-4 max-w-[575px] mx-auto">
			<h1 className="text-xl font-bold">Product</h1>
			<p className="mt-2">Project: {projectName}</p>
			<p className="mt-1">Product ID: {id}</p>
			<p className="mt-4 text-sm text-gray-600">This is a placeholder product page. Replace with real implementation as needed.</p>
		</main>
	);
}
