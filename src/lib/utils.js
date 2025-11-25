import { clsx, } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function formatName(full) {
	let parts = full.split(" ");
	const [firstName, ...lastNames] = parts;
	return `${firstName[0]}. ${lastNames.join(" ")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any