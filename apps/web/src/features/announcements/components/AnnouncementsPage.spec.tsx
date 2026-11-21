// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAnnouncementApi,
  deleteAnnouncementApi,
  getAnnouncementStatsApi,
  getAnnouncementsApi,
  updateAnnouncementApi,
} from "../api/announcements";
import type {
  Announcement,
  AnnouncementListResponse,
  AnnouncementStats,
} from "../types";
import { AnnouncementsPage } from "./AnnouncementsPage";

// Mock ResizeObserver for Radix Dialog in JSDOM
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;

vi.mock("../api/announcements", () => ({
  getAnnouncementsApi: vi.fn(),
  getAnnouncementStatsApi: vi.fn(),
  getAnnouncementByIdApi: vi.fn(),
  createAnnouncementApi: vi.fn(),
  updateAnnouncementApi: vi.fn(),
  deleteAnnouncementApi: vi.fn(),
}));

const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "Jadwal Ujian Akhir Semester Ganjil 2026/2027",
    content: "UAS akan diselenggarakan mulai tanggal 15 Desember 2026.",
    contentBody: "UAS akan diselenggarakan mulai tanggal 15 Desember 2026.",
    targetAudience: "ALL",
    category: "ACADEMIC",
    is_published: true,
    published_at: "2026-11-01T08:00:00.000Z",
    expired_at: "2026-12-31T23:59:59.000Z",
    institution_id: "inst-1",
    institution: {
      id: "inst-1",
      name: "SMA Negeri 1 Prestasi",
    },
    created_by: "usr-admin",
    creator: {
      id: "usr-admin",
      email: "admin@sekolah.sch.id",
      profile: {
        id: "prof-1",
        fullName: "Drs. Bambang Sudarsono",
      },
    },
    created_at: "2026-11-01T07:30:00.000Z",
    updated_at: "2026-11-01T07:30:00.000Z",
  },
  {
    id: "ann-2",
    title: "Rapat Koordinasi Dewan Guru",
    content: "Rapat koordinasi guru diadakan hari Sabtu jam 09.00 WIB.",
    contentBody: "Rapat koordinasi guru diadakan hari Sabtu jam 09.00 WIB.",
    targetAudience: "TEACHER",
    category: "IMPORTANT",
    is_published: false,
    published_at: null,
    expired_at: null,
    institution_id: "inst-1",
    institution: {
      id: "inst-1",
      name: "SMA Negeri 1 Prestasi",
    },
    created_by: "usr-admin",
    creator: {
      id: "usr-admin",
      email: "admin@sekolah.sch.id",
      profile: {
        id: "prof-1",
        fullName: "Drs. Bambang Sudarsono",
      },
    },
    created_at: "2026-11-10T09:00:00.000Z",
    updated_at: "2026-11-10T09:00:00.000Z",
  },
];

const mockStats: AnnouncementStats = {
  total: 2,
  published: 1,
  draft: 1,
  active: 1,
};

const mockListResponse: AnnouncementListResponse = {
  data: mockAnnouncements,
  meta: {
    totalData: 2,
    totalPages: 1,
    currentPage: 1,
    perPage: 10,
  },
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("AnnouncementsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAnnouncementsApi).mockResolvedValue(mockListResponse);
    vi.mocked(getAnnouncementStatsApi).mockResolvedValue(mockStats);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and stats cards correctly", async () => {
    renderWithClient(<AnnouncementsPage />);

    // Header checks
    expect(screen.getByText("Pengumuman Institusi")).toBeTruthy();
    expect(
      screen.getByText(
        "Kelola pengumuman resmi, target penerima (Semua, Guru, Siswa), dan status publikasi institusi.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Tambah Pengumuman")).toBeTruthy();

    // Stats cards
    await waitFor(() => {
      expect(screen.getByText("Total Pengumuman")).toBeTruthy();
      expect(screen.getByText("Diterbitkan")).toBeTruthy();
      expect(screen.getByText("Draf")).toBeTruthy();
      expect(screen.getByText("Pengumuman Aktif")).toBeTruthy();
    });
  });

  it("renders table data with correct titles, badges, and author info", async () => {
    renderWithClient(<AnnouncementsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Jadwal Ujian Akhir Semester Ganjil 2026/2027"),
      ).toBeTruthy();
      expect(
        screen.getByText("Rapat Koordinasi Dewan Guru"),
      ).toBeTruthy();
    });

    // Check badges in table
    expect(screen.getAllByText("Semua Pengguna").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Khusus Guru").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Akademik").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Penting").length).toBeGreaterThanOrEqual(1);

    // Check creator name
    expect(
      screen.getAllByText("Drs. Bambang Sudarsono").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when no announcements match query", async () => {
    vi.mocked(getAnnouncementsApi).mockResolvedValueOnce({
      data: [],
      meta: {
        totalData: 0,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });

    renderWithClient(<AnnouncementsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Belum ada data pengumuman"),
      ).toBeTruthy();
    });
  });

  it("handles filter changes and reset button properly", async () => {
    renderWithClient(<AnnouncementsPage />);

    // Search input
    const searchInput = screen.getByPlaceholderText(
      "Cari judul atau isi pengumuman...",
    );
    fireEvent.change(searchInput, { target: { value: "UAS" } });
    expect((searchInput as HTMLInputElement).value).toBe("UAS");

    // Status filter
    const statusSelect = screen.getByLabelText("Filter Status Publikasi");
    fireEvent.change(statusSelect, { target: { value: "true" } });
    expect((statusSelect as HTMLSelectElement).value).toBe("true");

    // Audience filter
    const audienceSelect = screen.getByLabelText("Filter Target Audiens");
    fireEvent.change(audienceSelect, { target: { value: "TEACHER" } });
    expect((audienceSelect as HTMLSelectElement).value).toBe("TEACHER");

    // Category filter
    const categorySelect = screen.getByLabelText("Filter Kategori");
    fireEvent.change(categorySelect, { target: { value: "ACADEMIC" } });
    expect((categorySelect as HTMLSelectElement).value).toBe("ACADEMIC");

    // Reset button should now be enabled and clear all filters
    const resetButton = screen.getByRole("button", { name: /Reset filter/i });
    fireEvent.click(resetButton);

    expect((searchInput as HTMLInputElement).value).toBe("");
    expect((statusSelect as HTMLSelectElement).value).toBe("");
    expect((audienceSelect as HTMLSelectElement).value).toBe("");
    expect((categorySelect as HTMLSelectElement).value).toBe("");
  });

  it("opens create announcement dialog and submits data", async () => {
    vi.mocked(createAnnouncementApi).mockResolvedValueOnce({
      id: "ann-new",
      title: "Pengumuman Baru",
      content: "Isi konten baru",
      targetAudience: "STUDENT",
      category: "EVENT",
      is_published: true,
      institution_id: "inst-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    renderWithClient(<AnnouncementsPage />);

    const addButton = screen.getByRole("button", {
      name: /Tambah Pengumuman/i,
    });
    fireEvent.click(addButton);

    // Dialog should be open
    await waitFor(() => {
      expect(screen.getByText("Buat Pengumuman Baru")).toBeTruthy();
    });

    // Fill form
    const titleInput = screen.getByPlaceholderText(
      "Contoh: Jadwal Ujian Akhir Semester Ganjil 2026/2027",
    );
    fireEvent.change(titleInput, { target: { value: "Pengumuman Baru" } });

    const contentInput = screen.getByPlaceholderText(
      "Tuliskan isi lengkap pengumuman di sini...",
    );
    fireEvent.change(contentInput, { target: { value: "Isi konten baru" } });

    const submitButton = screen.getByRole("button", {
      name: /Terbitkan Pengumuman/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createAnnouncementApi).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Pengumuman Baru",
          content: "Isi konten baru",
        }),
      );
    });
  });

  it("opens detail modal when clicking view button", async () => {
    renderWithClient(<AnnouncementsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Jadwal Ujian Akhir Semester Ganjil 2026/2027"),
      ).toBeTruthy();
    });

    const viewButtons = screen.getAllByLabelText("Lihat Detail");
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("ID Pengumuman: ann-1")).toBeTruthy();
      expect(screen.getByText("Isi Lengkap Pengumuman")).toBeTruthy();
      expect(
        screen.getAllByText(
          "UAS akan diselenggarakan mulai tanggal 15 Desember 2026.",
        ).length,
      ).toBeGreaterThanOrEqual(1);
    });

    // Close detail modal
    const closeButtons = screen.getAllByRole("button", { name: /Tutup/i });
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("ID Pengumuman: ann-1")).toBeNull();
    });
  });

  it("opens edit modal and saves changes", async () => {
    vi.mocked(updateAnnouncementApi).mockResolvedValueOnce({
      ...mockAnnouncements[0],
      title: "Jadwal UAS Diperbarui",
    });

    renderWithClient(<AnnouncementsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Jadwal Ujian Akhir Semester Ganjil 2026/2027"),
      ).toBeTruthy();
    });

    const editButtons = screen.getAllByLabelText("Ubah Pengumuman");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Ubah Pengumuman")).toBeTruthy();
    });

    const titleInput = screen.getByPlaceholderText(
      "Contoh: Jadwal Ujian Akhir Semester Ganjil 2026/2027",
    );
    fireEvent.change(titleInput, { target: { value: "Jadwal UAS Diperbarui" } });

    const saveButton = screen.getByRole("button", {
      name: /Simpan Perubahan/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateAnnouncementApi).toHaveBeenCalledWith(
        "ann-1",
        expect.objectContaining({
          title: "Jadwal UAS Diperbarui",
        }),
      );
    });
  });

  it("opens delete confirmation modal and executes deletion", async () => {
    vi.mocked(deleteAnnouncementApi).mockResolvedValueOnce({
      success: true,
      id: "ann-1",
    });

    renderWithClient(<AnnouncementsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Jadwal Ujian Akhir Semester Ganjil 2026/2027"),
      ).toBeTruthy();
    });

    const deleteButtons = screen.getAllByLabelText("Hapus Pengumuman");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Hapus Pengumuman?")).toBeTruthy();
    });

    const confirmButton = screen.getByRole("button", {
      name: /Hapus Pengumuman/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteAnnouncementApi).toHaveBeenCalledWith("ann-1");
    });
  });
});
