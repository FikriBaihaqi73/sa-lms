// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api/modules";
import type { ClassSubjectOption, LearningModule } from "../types";
import { ModulesPage } from "./ModulesPage";

vi.mock("../api/modules", () => ({
  getModules: vi.fn(),
  getModuleById: vi.fn(),
  createModule: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  getModuleContents: vi.fn(),
  createModuleContent: vi.fn(),
  updateModuleContent: vi.fn(),
  deleteModuleContent: vi.fn(),
  getClassSubjectOptions: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockClassSubjectOptions: ClassSubjectOption[] = [
  {
    id: "cs-1",
    label: "Matematika - X-A",
    className: "X-A",
    subjectName: "Matematika",
  },
  {
    id: "cs-2",
    label: "Fisika - X-B",
    className: "X-B",
    subjectName: "Fisika",
  },
];

const mockModules: LearningModule[] = [
  {
    id: "mod-1",
    title: "Modul 1: Aljabar Dasar",
    class_subject_id: "cs-1",
    description: "Pembahasan konsep dasar aljabar linear dan persamaan",
    display_order: 1,
    is_published: true,
    is_locked: false,
    created_at: "2026-11-01T08:00:00Z",
    updated_at: "2026-11-01T08:00:00Z",
    class_subject: {
      id: "cs-1",
      class: { id: "class-1", name: "X-A" },
      subject: { id: "sub-1", name: "Matematika" },
    },
    moduleContents: [
      {
        id: "mc-1",
        moduleId: "mod-1",
        fileId: null,
        title: "Pengenalan Variabel dan Koefisien",
        contentType: "text",
        content: "Penjelasan lengkap mengenai variabel...",
        sortOrder: 1,
        createdAt: "2026-11-01T09:00:00Z",
        updatedAt: "2026-11-01T09:00:00Z",
      },
    ],
  },
  {
    id: "mod-2",
    title: "Modul 2: Persamaan Kuadrat",
    class_subject_id: "cs-1",
    description: "Lanjutan materi persamaan kuadrat dan grafik fungsi",
    display_order: 2,
    is_published: false,
    is_locked: true,
    created_at: "2026-11-02T08:00:00Z",
    updated_at: "2026-11-02T08:00:00Z",
    class_subject: {
      id: "cs-1",
      class: { id: "class-1", name: "X-A" },
      subject: { id: "sub-1", name: "Matematika" },
    },
    moduleContents: [],
  },
];

function renderModulesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ModulesPage />
    </QueryClientProvider>,
  );
}

describe("ModulesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getClassSubjectOptions).mockResolvedValue(
      mockClassSubjectOptions,
    );
    vi.mocked(api.getModules).mockResolvedValue({
      data: mockModules,
      meta: {
        totalData: mockModules.length,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders page title, statistics cards, and module cards", async () => {
    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    // Check heading
    expect(
      screen.getByRole("heading", { name: "Modul & Konten Pembelajaran" }),
    ).toBeTruthy();

    // Check stats cards
    expect(screen.getByText("Total Modul")).toBeTruthy();
    expect(screen.getByText("Modul Diterbitkan")).toBeTruthy();
    expect(screen.getByText("Modul Terkunci")).toBeTruthy();
    expect(screen.getByText("Total Konten Materi")).toBeTruthy();

    // Check module titles
    expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    expect(screen.getByText("Modul 2: Persamaan Kuadrat")).toBeTruthy();

    // Expand the first module to see its contents
    const expandBtns = screen.getAllByLabelText("Buka detail modul");
    fireEvent.click(expandBtns[0]!);

    expect(
      screen.getByText("Pengenalan Variabel dan Koefisien"),
    ).toBeTruthy();
  });

  it("renders empty state when no modules exist", async () => {
    vi.mocked(api.getModules).mockResolvedValue({
      data: [],
      meta: {
        totalData: 0,
        totalPages: 1,
        currentPage: 1,
        perPage: 10,
      },
    });

    renderModulesPage();

    await waitFor(() => {
      expect(
        screen.getByText("Belum ada modul pembelajaran"),
      ).toBeTruthy();
    });
    expect(screen.getByText("Buat Modul Pertama")).toBeTruthy();
  });

  it("opens create module modal and submits new module", async () => {
    vi.mocked(api.createModule).mockResolvedValue({
      id: "mod-new",
      title: "Modul Baru Teruji",
      class_subject_id: "cs-1",
      description: "Deskripsi modul baru",
      display_order: 3,
      is_published: true,
      is_locked: false,
      created_at: "2026-11-03T08:00:00Z",
      updated_at: "2026-11-03T08:00:00Z",
    });

    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    const addBtn = screen.getByRole("button", { name: /tambah modul/i });
    fireEvent.click(addBtn);

    expect(
      screen.getByRole("heading", { name: "Tambah Modul Pembelajaran" }),
    ).toBeTruthy();

    // Fill form
    const titleInput = screen.getByPlaceholderText(
      /contoh: modul 1: pengantar algoritma/i,
    );
    fireEvent.change(titleInput, { target: { value: "Modul Baru Teruji" } });

    const submitBtn = screen.getByRole("button", { name: /buat modul/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createModule).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Modul Baru Teruji",
          class_subject_id: "cs-1",
        }),
      );
    });
  });

  it("opens edit module dialog and saves changes", async () => {
    vi.mocked(api.updateModule).mockResolvedValue({
      ...mockModules[0]!,
      title: "Modul 1: Aljabar Dasar (Revisi)",
    });

    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    const editBtns = screen.getAllByTitle("Edit Modul");
    fireEvent.click(editBtns[0]!);

    expect(
      screen.getByRole("heading", { name: "Ubah Modul Pembelajaran" }),
    ).toBeTruthy();

    const titleInput = screen.getByPlaceholderText(
      /contoh: modul 1: pengantar algoritma/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "Modul 1: Aljabar Dasar (Revisi)" },
    });

    const saveBtn = screen.getByRole("button", { name: /simpan perubahan/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateModule).toHaveBeenCalledWith(
        "mod-1",
        expect.objectContaining({
          title: "Modul 1: Aljabar Dasar (Revisi)",
        }),
      );
    });
  });

  it("toggles module published status", async () => {
    vi.mocked(api.updateModule).mockResolvedValue({
      ...mockModules[0]!,
      is_published: false,
    });

    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    // mod-1 is published, button title is "Tarik ke Draf"
    const togglePublishBtn = screen.getByTitle("Tarik ke Draf");
    fireEvent.click(togglePublishBtn);

    await waitFor(() => {
      expect(api.updateModule).toHaveBeenCalledWith("mod-1", {
        is_published: false,
      });
    });
  });

  it("toggles module locked status", async () => {
    vi.mocked(api.updateModule).mockResolvedValue({
      ...mockModules[0]!,
      is_locked: true,
    });

    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    // mod-1 is unlocked, button title is "Kunci Modul"
    const lockBtn = screen.getByTitle("Kunci Modul");
    fireEvent.click(lockBtn);

    await waitFor(() => {
      expect(api.updateModule).toHaveBeenCalledWith("mod-1", {
        is_locked: true,
      });
    });
  });

  it("opens add content modal and adds new material to module", async () => {
    vi.mocked(api.createModuleContent).mockResolvedValue({
      id: "mc-new",
      moduleId: "mod-1",
      fileId: null,
      title: "Video Tutorial Aljabar",
      contentType: "video",
      content: "https://youtube.com/watch?v=sample",
      sortOrder: 2,
      createdAt: "2026-11-03T09:00:00Z",
      updatedAt: "2026-11-03T09:00:00Z",
    });

    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    const addContentBtns = screen.getAllByTitle("Tambah Konten Materi");
    fireEvent.click(addContentBtns[0]!);

    expect(
      screen.getByRole("heading", { name: "Tambah Konten Materi" }),
    ).toBeTruthy();

    const titleInput = screen.getByPlaceholderText(
      /contoh: pengantar dan konsep dasar/i,
    );
    fireEvent.change(titleInput, {
      target: { value: "Video Tutorial Aljabar" },
    });

    const submitBtn = screen.getByRole("button", { name: /tambah materi/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createModuleContent).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: "mod-1",
          title: "Video Tutorial Aljabar",
        }),
      );
    });
  });

  it("opens delete module dialog and confirms deletion", async () => {
    vi.mocked(api.deleteModule).mockResolvedValue({
      success: true,
      id: "mod-1",
    });

    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    const deleteBtns = screen.getAllByTitle("Hapus Modul");
    fireEvent.click(deleteBtns[0]!);

    expect(
      screen.getByRole("heading", { name: "Hapus Modul Pembelajaran" }),
    ).toBeTruthy();

    const confirmBtn = screen.getByRole("button", { name: "Ya, Hapus" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteModule).toHaveBeenCalledWith("mod-1");
    });
  });

  it("opens delete content dialog and confirms deletion", async () => {
    vi.mocked(api.deleteModuleContent).mockResolvedValue({
      success: true,
      id: "mc-1",
    });

    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    // Expand module to show content actions
    const expandBtns = screen.getAllByLabelText("Buka detail modul");
    fireEvent.click(expandBtns[0]!);

    const deleteContentBtn = screen.getByTitle("Hapus Konten");
    fireEvent.click(deleteContentBtn);

    expect(
      screen.getByRole("heading", { name: "Hapus Konten Materi" }),
    ).toBeTruthy();

    const confirmBtn = screen.getByRole("button", { name: "Ya, Hapus" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteModuleContent).toHaveBeenCalledWith("mc-1");
    });
  });

  it("handles filter changes and resets filters", async () => {
    renderModulesPage();

    await waitFor(() => {
      expect(screen.getByText("Modul 1: Aljabar Dasar")).toBeTruthy();
    });

    const searchInput = screen.getByLabelText("Cari modul") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "Aljabar" } });

    const statusFilter = screen.getByLabelText("Filter Status Publikasi") as HTMLSelectElement;
    fireEvent.change(statusFilter, { target: { value: "true" } });

    const resetBtn = screen.getByRole("button", { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(searchInput.value).toBe("");
    expect(statusFilter.value).toBe("");
  });
});
