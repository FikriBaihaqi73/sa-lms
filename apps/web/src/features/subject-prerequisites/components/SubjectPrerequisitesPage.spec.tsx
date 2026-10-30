// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubjectPrerequisitesPage } from "./SubjectPrerequisitesPage";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockApiSubjects = [
  {
    id: "sub-101",
    code: "CS101",
    name: "Pengantar Ilmu Komputer",
    credits: 3,
    description: "Pengantar komputasi",
    department: { id: "dept-1", name: "Teknik Informatika" },
  },
  {
    id: "sub-102",
    code: "CS102",
    name: "Dasar Pemrograman",
    credits: 3,
    description: "Dasar algoritma & sintaks",
    department: { id: "dept-1", name: "Teknik Informatika" },
  },
  {
    id: "sub-103",
    code: "MATH101",
    name: "Kalkulus 1",
    credits: 3,
    description: "Kalkulus diferensial",
    department: { id: "dept-2", name: "Matematika" },
  },
  {
    id: "sub-201",
    code: "CS201",
    name: "Struktur Data & Algoritma",
    credits: 4,
    description: "Array, tree, graph",
    department: { id: "dept-1", name: "Teknik Informatika" },
  },
];

const mockApiPrerequisites = [
  {
    id: "rel-1",
    subjectId: "sub-201",
    prerequisiteSubjectId: "sub-102",
    subject: mockApiSubjects[3],
    prerequisiteSubject: mockApiSubjects[1],
  },
];

// Mock departments API
vi.mock("@/features/departments/api/departments", () => ({
  getDepartmentsApi: vi.fn(async () => ({
    data: [
      { id: "dept-1", name: "Teknik Informatika", code: "TIF" },
      { id: "dept-2", name: "Matematika", code: "MAT" },
    ],
    meta: { totalData: 2, totalPages: 1, currentPage: 1, perPage: 100 },
  })),
}));

// Mock API module
vi.mock("../api/subjectPrerequisites", () => ({
  fetchSubjectsApi: vi.fn(async () => ({
    data: mockApiSubjects,
    total: mockApiSubjects.length,
  })),
  fetchSubjectPrerequisitesApi: vi.fn(async () => ({
    data: mockApiPrerequisites,
    total: mockApiPrerequisites.length,
  })),
  createSubjectPrerequisiteApi: vi.fn(async () => ({
    id: "rel-new",
    subjectId: "sub-101",
    prerequisiteSubjectId: "sub-103",
  })),
  deleteSubjectPrerequisiteApi: vi.fn(async () => ({ id: "rel-1" })),
}));

describe("SubjectPrerequisitesPage", () => {
  let queryClient: QueryClient;

  function renderPage(ui: ReactNode = <SubjectPrerequisitesPage />) {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders page header and split-screen layout with 60/40 panels", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Manajemen Prasyarat Mata Kuliah" }),
    ).toBeDefined();

    expect(
      screen.getByRole("region", { name: "Daftar Mata Kuliah" }),
    ).toBeDefined();
    expect(
      screen.getByRole("region", { name: "Detail Prasyarat Mata Kuliah" }),
    ).toBeDefined();

    expect(screen.getByPlaceholderText(/Cari kode matkul/i)).toBeDefined();
  });

  it("renders subjects with code, name, and prerequisite count badge on left panel", async () => {
    renderPage();

    const leftPanel = screen.getByRole("region", { name: "Daftar Mata Kuliah" });

    await waitFor(() => {
      expect(within(leftPanel).getByText("CS101")).toBeDefined();
      expect(within(leftPanel).getByText("Pengantar Ilmu Komputer")).toBeDefined();
      expect(within(leftPanel).getByText("CS201")).toBeDefined();
      expect(within(leftPanel).getByText("Struktur Data & Algoritma")).toBeDefined();
    });
  });

  it("updates right panel detail when a subject on the left panel is clicked", async () => {
    renderPage();

    const leftPanel = screen.getByRole("region", { name: "Daftar Mata Kuliah" });
    const rightPanel = screen.getByRole("region", {
      name: "Detail Prasyarat Mata Kuliah",
    });

    await waitFor(() => {
      expect(within(leftPanel).getByText("CS201")).toBeDefined();
    });

    // Click on CS201 (Struktur Data & Algoritma)
    const cs201Card = within(leftPanel).getByText("CS201").closest('[role="button"]');
    expect(cs201Card).toBeDefined();
    if (cs201Card) {
      fireEvent.click(cs201Card);
    }

    // Right panel should now show CS201 details and its prerequisite CS102
    await waitFor(() => {
      expect(within(rightPanel).getByText("CS201")).toBeDefined();
      expect(within(rightPanel).getByText("Struktur Data & Algoritma")).toBeDefined();
      expect(within(rightPanel).getByText("CS102")).toBeDefined();
      expect(within(rightPanel).getByText("Dasar Pemrograman")).toBeDefined();
    });
  });

  it("filters subjects on the left panel when user types in search input", async () => {
    renderPage();

    const leftPanel = screen.getByRole("region", { name: "Daftar Mata Kuliah" });

    await waitFor(() => {
      expect(within(leftPanel).getByText("MATH101")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Cari kode matkul/i);
    fireEvent.change(searchInput, { target: { value: "Kalkulus" } });

    // Should display MATH101 Kalkulus 1 on the left panel
    expect(within(leftPanel).getByText("MATH101")).toBeDefined();
    expect(within(leftPanel).getByText("Kalkulus 1")).toBeDefined();

    // Should NOT display CS101 on the left panel
    expect(within(leftPanel).queryByText("Pengantar Ilmu Komputer")).toBeNull();
  });

  it("filters subjects when clicking 'Ada Prasyarat' and 'Tanpa Prasyarat'", async () => {
    renderPage();

    const leftPanel = screen.getByRole("region", { name: "Daftar Mata Kuliah" });

    await waitFor(() => {
      expect(within(leftPanel).getByText("CS101")).toBeDefined();
      expect(within(leftPanel).getByText("CS201")).toBeDefined();
    });

    const noPrereqBtn = screen.getByRole("button", { name: "Tanpa Prasyarat" });
    fireEvent.click(noPrereqBtn);

    // CS101 has 0 prerequisites, should be in left list
    expect(within(leftPanel).getByText("CS101")).toBeDefined();
    // CS201 has prerequisites, should NOT be in left list
    expect(within(leftPanel).queryByText("CS201")).toBeNull();

    const hasPrereqBtn = screen.getByRole("button", { name: "Ada Prasyarat" });
    fireEvent.click(hasPrereqBtn);

    // CS201 has prerequisites, should be in left list
    expect(within(leftPanel).getByText("CS201")).toBeDefined();
    // CS101 has 0 prerequisites, should NOT be in left list
    expect(within(leftPanel).queryByText("CS101")).toBeNull();
  });

  it("removes a prerequisite when clicking the 'X' button and enables 'Simpan Perubahan'", async () => {
    renderPage();

    const leftPanel = screen.getByRole("region", { name: "Daftar Mata Kuliah" });
    const rightPanel = screen.getByRole("region", {
      name: "Detail Prasyarat Mata Kuliah",
    });

    await waitFor(() => {
      expect(within(leftPanel).getByText("CS201")).toBeDefined();
    });

    // Click on CS201 which has CS102 as prerequisite
    const cs201Card = within(leftPanel).getByText("CS201").closest('[role="button"]');
    if (cs201Card) {
      fireEvent.click(cs201Card);
    }

    // Right panel should have remove button for CS102
    await waitFor(() => {
      expect(within(rightPanel).getByTitle("Hapus prasyarat CS102")).toBeDefined();
    });

    const removeBtn = within(rightPanel).getByTitle("Hapus prasyarat CS102");
    const saveBtn = within(rightPanel).getByRole("button", { name: /Simpan Perubahan/i });
    expect(saveBtn).toHaveProperty("disabled", true);

    // Click remove
    fireEvent.click(removeBtn);

    // Now unsaved warning should appear and save button should be enabled
    expect(within(rightPanel).getByText("Perubahan belum tersimpan")).toBeDefined();
    expect(saveBtn).toHaveProperty("disabled", false);

    // Click 'Batal' to restore
    const cancelBtn = within(rightPanel).getByRole("button", { name: /Batal/i });
    fireEvent.click(cancelBtn);

    // Prerequisite should be restored
    expect(within(rightPanel).getByText("CS102")).toBeDefined();
  });

  it("opens 'Tambah Prasyarat' dialog, adds candidate, and saves changes", async () => {
    renderPage();

    const leftPanel = screen.getByRole("region", { name: "Daftar Mata Kuliah" });
    const rightPanel = screen.getByRole("region", {
      name: "Detail Prasyarat Mata Kuliah",
    });

    await waitFor(() => {
      expect(within(leftPanel).getByText("CS101")).toBeDefined();
    });

    // Click on CS101 (has 0 prerequisites)
    const cs101Card = within(leftPanel).getByText("CS101").closest('[role="button"]');
    if (cs101Card) {
      fireEvent.click(cs101Card);
    }

    // Click 'Tambah Prasyarat' dashed button
    const addBtn = within(rightPanel).getByRole("button", { name: /Tambah Prasyarat/i });
    fireEvent.click(addBtn);

    // Dialog should open
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Tambah Prasyarat Mata Kuliah")).toBeDefined();

    // Select candidate from dialog
    const selectBtns = within(dialog).getAllByRole("button", { name: "Pilih" });
    expect(selectBtns.length).toBeGreaterThan(0);
    fireEvent.click(selectBtns[0]);

    // Now right panel should display unsaved changes
    expect(within(rightPanel).getByText("Perubahan belum tersimpan")).toBeDefined();

    // Click 'Simpan Perubahan'
    const saveBtn = within(rightPanel).getByRole("button", { name: /Simpan Perubahan/i });
    expect(saveBtn).toHaveProperty("disabled", false);
    fireEvent.click(saveBtn);

    // Changes should now be saved
    await waitFor(() => {
      expect(within(rightPanel).getByText("Semua perubahan tersimpan di database")).toBeDefined();
    });
  });
});
