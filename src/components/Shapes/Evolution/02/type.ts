import type { HTMLAttributes } from "astro/types";

export interface Evolution02Props extends HTMLAttributes<"svg"> {
	innerShape?: string;
	outerShape?: string;
}