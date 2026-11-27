import { useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Children, type ReactNode, useEffect, useId, useState } from "react";

interface SidebarNavGroupProps {
	title: string;
	paths: string[];
	children: ReactNode;
}

function pathMatches(pathname: string, path: string): boolean {
	// Keep the base settings item from claiming nested settings pages owned by
	// another group, such as /settings/classrooms.
	if (path === "/settings") return pathname === path;
	return pathname === path || pathname.startsWith(`${path}/`);
}

export function SidebarNavGroup({
	title,
	paths,
	children,
}: SidebarNavGroupProps) {
	const { pathname } = useLocation();
	const renderedChildren = Children.toArray(children);
	const isActive = paths.some((path) => pathMatches(pathname, path));
	const [isOpen, setIsOpen] = useState(isActive);
	const contentId = useId();

	useEffect(() => {
		// The active route must reopen a manually closed group after navigation.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (isActive) setIsOpen(true);
	}, [isActive]);

	if (renderedChildren.length === 0) return null;

	return (
		<div>
			<button
				type="button"
				aria-expanded={isOpen}
				aria-controls={contentId}
				onClick={() => setIsOpen((open) => !open)}
				className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-500 dark:hover:bg-slate-800/40 dark:hover:text-slate-300"
			>
				<span>{title}</span>
				{isOpen ? (
					<ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
				) : (
					<ChevronRight className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
				)}
			</button>
			<div id={contentId} hidden={!isOpen} className="mt-1 space-y-0.5">
				{renderedChildren}
			</div>
		</div>
	);
}
