// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarNavGroup } from "./sidebar-nav-group";

const { locationMock } = vi.hoisted(() => ({
	locationMock: vi.fn(() => ({ pathname: "/dashboard" })),
}));

vi.mock("@tanstack/react-router", () => ({
	useLocation: locationMock,
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

beforeEach(() => {
	locationMock.mockReset();
	locationMock.mockReturnValue({ pathname: "/dashboard" });
});

function renderGroup(paths = ["/users"]) {
	return render(
		<SidebarNavGroup title="Pengguna" paths={paths}>
			<a href="/users">Data Pengguna</a>
		</SidebarNavGroup>,
	);
}

describe("SidebarNavGroup", () => {
	it("starts closed when no child route is active", () => {
		renderGroup();

		expect(
			screen
				.getByRole("button", { name: "Pengguna" })
				.getAttribute("aria-expanded"),
		).toBe("false");
		expect(
			screen.getByText("Data Pengguna").parentElement?.hasAttribute("hidden"),
		).toBe(true);
	});

	it("starts open when a nested child route is active", () => {
		locationMock.mockReturnValue({ pathname: "/users/123" });
		renderGroup();

		expect(
			screen
				.getByRole("button", { name: "Pengguna" })
				.getAttribute("aria-expanded"),
		).toBe("true");
		expect(
			screen.getByText("Data Pengguna").parentElement?.hasAttribute("hidden"),
		).toBe(false);
	});

	it("toggles visibility and aria-expanded when the header is clicked", () => {
		renderGroup();
		const header = screen.getByRole("button", { name: "Pengguna" });

		act(() => fireEvent.click(header));
		expect(header.getAttribute("aria-expanded")).toBe("true");
		expect(
			screen.getByText("Data Pengguna").parentElement?.hasAttribute("hidden"),
		).toBe(false);

		act(() => fireEvent.click(header));
		expect(header.getAttribute("aria-expanded")).toBe("false");
		expect(
			screen.getByText("Data Pengguna").parentElement?.hasAttribute("hidden"),
		).toBe(true);
	});

	it("opens when navigation changes to a child route", () => {
		const view = renderGroup();
		locationMock.mockReturnValue({ pathname: "/users/123" });
		view.rerender(
			<SidebarNavGroup title="Pengguna" paths={["/users"]}>
				<a href="/users">Data Pengguna</a>
			</SidebarNavGroup>,
		);

		expect(
			screen
				.getByRole("button", { name: "Pengguna" })
				.getAttribute("aria-expanded"),
		).toBe("true");
	});

	it("does not render a group without rendered children", () => {
		const { container } = render(
			<SidebarNavGroup title="Kosong" paths={["/empty"]}>
				{false}
			</SidebarNavGroup>,
		);

		expect(container.innerHTML).toBe("");
	});

	it("keeps closed children out of the focus order", () => {
		renderGroup();
		const child = screen.getByText("Data Pengguna") as HTMLAnchorElement;
		child.focus();

		expect(child.closest("[hidden]")).not.toBeNull();
	});
});
