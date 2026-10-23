import { useState } from "react";
import { useClasses, useCreateClass, useDeleteClass, useUpdateClass } from "../hooks/useClasses";
import type { ClassItem } from "../types";

export function ClassesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isPending, isError, error } = useClasses({ page, limit: 10, search });
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  const rows: ClassItem[] = data?.data ?? [];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Manajemen Kelas</h1>
        </header>
        <input
          className="rounded border px-3 py-2"
          placeholder="Cari kelas"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isError && <div className="text-red-600">{String(error)}</div>}
        {isPending && <div>Loading...</div>}
        <table className="w-full border">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Grade Level</th>
              <th>Kapasitas</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.grade_level}</td>
                <td>{r.capacity ?? "-"}</td>
                <td>
                  <button onClick={() => deleteMutation.mutate(r.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </main>
  );
}