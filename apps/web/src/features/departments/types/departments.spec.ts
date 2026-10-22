import { describe, expect, it, vi } from "vitest";
import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentByIdApi,
  getDepartmentsApi,
  updateDepartmentApi,
} from "../api/departments";
import { departmentFormSchema } from "../schemas/departmentSchema";
import type { Department } from "./index";

const mockDepartments: Department[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Departemen Kurikulum & Akademik",
    code: "KUR",
    institution_id: "i0000000-0000-0000-0000-000000000001",
    created_at: "2026-10-21T00:00:00.000Z",
    updated_at: "2026-10-21T00:00:00.000Z",
    teachers: [
      {
        id: "d0000000-0000-4000-8000-000000000001",
        teacher_number: "TCH-001",
        profile: {
          id: "p0000000-0000-0000-0000-000000000001",
          fullName: "Budi Santoso, M.Pd",
          email: "budi@sekolah.sch.id",
          phoneNumber: "081234567890",
          photoUrl: null,
        },
      },
    ],
    _count: {
      teachers: 1,
      subjects: 3,
    },
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Departemen Kesiswaan",
    code: "KSW",
    institution_id: "i0000000-0000-0000-0000-000000000001",
    created_at: "2026-10-21T00:00:00.000Z",
    updated_at: "2026-10-21T00:00:00.000Z",
    teachers: [],
    _count: {
      teachers: 0,
      subjects: 0,
    },
  },
];

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    const method = opts?.method?.toUpperCase() ?? "GET";

    if (url.startsWith("/departments?") && method === "GET") {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Departments retrieved successfully",
        data: mockDepartments,
        meta: {
          totalData: 2,
          totalPages: 1,
          currentPage: 1,
          perPage: 10,
        },
      });
    }

    if (url === "/departments/a0000000-0000-0000-0000-000000000001" && method === "GET") {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Department retrieved successfully",
        data: mockDepartments[0],
      });
    }

    if (url === "/departments" && method === "POST") {
      const body = JSON.parse(String(opts?.body ?? "{}"));
      return Promise.resolve({
        status: "success",
        code: 201,
        message: "Department created successfully",
        data: {
          id: "a0000000-0000-0000-0000-000000000099",
          created_at: "2026-10-21T00:00:00.000Z",
          updated_at: "2026-10-21T00:00:00.000Z",
          ...body,
        },
      });
    }

    if (url === "/departments/a0000000-0000-0000-0000-000000000001" && method === "PATCH") {
      const body = JSON.parse(String(opts?.body ?? "{}"));
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Department updated successfully",
        data: {
          ...mockDepartments[0],
          ...body,
        },
      });
    }

    if (url === "/departments/a0000000-0000-0000-0000-000000000001" && method === "DELETE") {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Department deleted successfully",
        data: {
          success: true,
          id: "a0000000-0000-0000-0000-000000000001",
        },
      });
    }

    return Promise.reject(new Error(`Unhandled route: ${method} ${url}`));
  }),
}));

describe("departmentFormSchema", () => {
  it("harus valid saat data nama dan kode lengkap", () => {
    const result = departmentFormSchema.safeParse({
      name: "Sarana dan Prasarana",
      code: "SARPRAS",
      teacher_ids: ["d0000000-0000-4000-8000-000000000001"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Sarana dan Prasarana");
      expect(result.data.code).toBe("SARPRAS");
      expect(result.data.teacher_ids).toEqual([
        "d0000000-0000-4000-8000-000000000001",
      ]);
    }
  });

  it("harus mentrim spasi di awal dan akhir pada name dan code", () => {
    const result = departmentFormSchema.safeParse({
      name: "   Departemen Kehumasan   ",
      code: "   HUMAS   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Departemen Kehumasan");
      expect(result.data.code).toBe("HUMAS");
      expect(result.data.teacher_ids).toEqual([]);
    }
  });

  it("harus gagal jika name kosong atau hanya spasi", () => {
    const result = departmentFormSchema.safeParse({
      name: "   ",
      code: "DEP",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Nama departemen wajib diisi.",
      );
    }
  });

  it("harus gagal jika code kosong atau hanya spasi", () => {
    const result = departmentFormSchema.safeParse({
      name: "Departemen IT",
      code: " ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Kode departemen wajib diisi.",
      );
    }
  });

  it("harus gagal jika teacher_ids bukan array UUID valid", () => {
    const result = departmentFormSchema.safeParse({
      name: "Departemen IT",
      code: "IT",
      teacher_ids: ["invalid-uuid"],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("ID guru tidak valid");
    }
  });
});

describe("departments API client", () => {
  it("getDepartmentsApi harus mengembalikan daftar departemen beserta meta", async () => {
    const response = await getDepartmentsApi({ page: 1, limit: 10 });
    expect(response.data).toHaveLength(2);
    expect(response.data[0]?.code).toBe("KUR");
    expect(response.meta.totalData).toBe(2);
  });

  it("getDepartmentByIdApi harus mengembalikan satu departemen", async () => {
    const response = await getDepartmentByIdApi(
      "a0000000-0000-0000-0000-000000000001",
    );
    expect(response.id).toBe("a0000000-0000-0000-0000-000000000001");
    expect(response.name).toBe("Departemen Kurikulum & Akademik");
    expect(response.teachers).toHaveLength(1);
  });

  it("createDepartmentApi harus mengirim payload dan mengembalikan data baru", async () => {
    const response = await createDepartmentApi({
      name: "Laboratorium Komputer",
      code: "LAB-KOM",
      teacher_ids: ["d0000000-0000-4000-8000-000000000001"],
    });
    expect(response.name).toBe("Laboratorium Komputer");
    expect(response.code).toBe("LAB-KOM");
    expect(response.id).toBe("a0000000-0000-0000-0000-000000000099");
  });

  it("updateDepartmentApi harus mengirimkan update partial", async () => {
    const response = await updateDepartmentApi(
      "a0000000-0000-0000-0000-000000000001",
      {
        name: "Departemen Kurikulum Terpadu",
      },
    );
    expect(response.name).toBe("Departemen Kurikulum Terpadu");
  });

  it("deleteDepartmentApi harus menghapus departemen", async () => {
    const response = await deleteDepartmentApi(
      "a0000000-0000-0000-0000-000000000001",
    );
    expect(response.success).toBe(true);
    expect(response.id).toBe("a0000000-0000-0000-0000-000000000001");
  });
});
