import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClassroomDialog } from "./ClassroomDialog";

describe("ClassroomDialog", () => {
	const baseProps = {
		open: true,
		classroom: null,
		isSaving: false,
		onClose: vi.fn(),
		onSave: vi.fn(async () => undefined),
	};

	it("renders server errors under the matching fields in add and edit modes", async () => {
		const serverErrors = [
			{ field: "floor", message: "Pesan lantai dari server" },
			{ field: "capacity", message: "Pesan kapasitas dari server" },
		];
		const { rerender } = render(
			<ClassroomDialog {...baseProps} serverErrors={serverErrors} />,
		);

		await waitFor(() => {
			expect(screen.getByText("Pesan lantai dari server")).toBeTruthy();
			expect(screen.getByText("Pesan kapasitas dari server")).toBeTruthy();
		});

		rerender(
			<ClassroomDialog
				{...baseProps}
				classroom={{ id: "room-1", roomCode: "R-101", roomName: "Ruang A" }}
				serverErrors={serverErrors}
			/>,
		);
		expect(screen.getByText("Ubah Ruang Kelas")).toBeTruthy();
		await waitFor(() => {
			expect(screen.getByText("Pesan lantai dari server")).toBeTruthy();
		});
	});

});
