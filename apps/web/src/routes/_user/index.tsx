import { createRoute, redirect } from "@tanstack/react-router";
import { userRoute } from '../userLayout';

export const indexRoute = createRoute({
	getParentRoute: () => userRoute,
	path: "/",
	beforeLoad: () => {
		// Land each role on a page it can actually open: superadmin on the
		// master-data pages, everyone else on Grades (their only menu).
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("access_token") || localStorage.getItem("token")
				: null;
		let isSuperadmin = false;
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split(".")[1])) as Record<
					string,
					unknown
				>;
				isSuperadmin = payload.role === "superadmin";
			} catch {
				// malformed token: fall through to the default landing
			}
		}
		throw redirect({ to: isSuperadmin ? "/nationalities" : "/grades" });
	},
});
