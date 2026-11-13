// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AttendanceStatusDialog } from "./AttendanceStatusDialog";

describe("AttendanceStatusDialog", () => {
  afterEach(() => cleanup());

  it("shows server duplicate errors and clears them when the field changes", () => {
    const onFieldChange = vi.fn();
    render(
      <AttendanceStatusDialog
        open
        isSaving={false}
        serverError={{
          field: "name",
          message: "Nama status sudah dipakai di institusi ini",
        }}
        onFieldChange={onFieldChange}
        onClose={vi.fn()}
        onSave={vi.fn(async () => undefined)}
      />,
    );

    expect(
      screen.getByText("Nama status sudah dipakai di institusi ini"),
    ).not.toBeNull();
    fireEvent.change(screen.getByLabelText(/Nama/), {
      target: { value: "Hadir Baru" },
    });
    expect(onFieldChange).toHaveBeenCalledTimes(1);
  });

  it("submits create and edit forms through the same callback with color and icon", async () => {
    const onSave = vi.fn(async (_data: unknown, _event?: unknown) => undefined);
    render(
      <AttendanceStatusDialog
        open
        attendanceStatus={{
          id: "status-1",
          institution_id: "inst-1",
          name: "Hadir",
          description: null,
          color: "#16A34A",
          icon: "check",
        }}
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nama/), {
      target: { value: "Hadir Baru" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Perubahan" }));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Hadir Baru",
          color: "#16A34A",
          icon: "check",
        }),
        expect.anything(),
      );
    });
  });

  it("allows selecting color presets and letter icons", async () => {
    const onSave = vi.fn(async (_data: unknown, _event?: unknown) => undefined);
    render(
      <AttendanceStatusDialog
        open
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    // Enter name
    fireEvent.change(screen.getByLabelText(/Nama/), {
      target: { value: "Sakit" },
    });

    // Select color preset Merah (#DC2626)
    const redPreset = screen.getByRole("button", { name: /Pilih warna Merah/ });
    fireEvent.click(redPreset);

    // Select letter icon 'S'
    const letterS = screen.getByRole("button", { name: "Pilih huruf S" });
    fireEvent.click(letterS);

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: "Tambah Status" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Sakit",
          color: "#DC2626",
          icon: "letter:S",
        }),
        expect.anything(),
      );
    });
  });

  it("allows entering custom HEX color and selecting standard icon", async () => {
    const onSave = vi.fn(async (_data: unknown, _event?: unknown) => undefined);
    render(
      <AttendanceStatusDialog
        open
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Nama/), {
      target: { value: "Izin Khusus" },
    });

    // Type custom HEX
    const hexInput = screen.getByLabelText("Kode warna HEX");
    fireEvent.change(hexInput, { target: { value: "#7C3AED" } });

    // Select Clock icon
    const clockIcon = screen.getByRole("button", { name: "Pilih ikon Waktu" });
    fireEvent.click(clockIcon);

    fireEvent.click(screen.getByRole("button", { name: "Tambah Status" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Izin Khusus",
          color: "#7C3AED",
          icon: "clock",
        }),
        expect.anything(),
      );
    });
  });
});
