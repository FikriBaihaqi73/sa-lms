import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CheckCircle2, Layers3, PauseCircle, Plus, Search, ShieldCheck, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type InstitutionLevel = {
  code: string;
  name: string;
  levels: number;
  institutions: number;
  active: boolean;
};

const initialLevels: InstitutionLevel[] = [
  { code: "PAUD", name: "PAUD / TK", levels: 3, institutions: 142, active: true },
  { code: "SD", name: "SD / MI", levels: 6, institutions: 388, active: true },
  { code: "SMP", name: "SMP / MTs", levels: 3, institutions: 264, active: true },
  { code: "SMA", name: "SMA / MA", levels: 3, institutions: 191, active: true },
  { code: "SMK", name: "SMK", levels: 4, institutions: 97, active: true },
  { code: "PT", name: "Perguruan tinggi", levels: 8, institutions: 23, active: false },
  { code: "KRS", name: "Kursus & pelatihan", levels: 1, institutions: 0, active: false },
];

const formSchema = z.object({
  code: z.string().trim().min(2, "Kode minimal 2 karakter.").max(10, "Kode maksimal 10 karakter.").regex(/^\S+$/, "Kode tidak boleh mengandung spasi."),
  name: z.string().trim().min(3, "Nama jenjang minimal 3 karakter."),
  levels: z.coerce.number().int("Jumlah tingkat harus bilangan bulat.").min(1, "Minimal 1 tingkat.").max(99, "Maksimal 99 tingkat."),
  description: z.string().trim().max(250, "Keterangan maksimal 250 karakter.").optional(),
});

type FormValues = z.output<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;

const stats = [
  { label: "Total jenjang", value: "7", icon: Layers3, amber: false },
  { label: "Jenjang aktif", value: "5", icon: CheckCircle2, amber: false },
  { label: "Institusi terdaftar", value: "1.105", icon: Building2, amber: false },
  { label: "Nonaktif", value: "2", icon: PauseCircle, amber: true },
];

export function InstitutionLevelsPage() {
  const [items, setItems] = useState<InstitutionLevel[]>(initialLevels);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(formSchema), defaultValues: { code: "", name: "", levels: 1, description: "" } });

  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.code} ${item.name}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || (status === "active") === item.active);
  }), [items, query, status]);

  const toggleStatus = (code: string) => setItems((current) => current.map((item) => item.code === code ? { ...item, active: !item.active } : item));

  const closeDrawer = () => { setDrawerOpen(false); form.reset(); };
  const onSubmit = (values: FormValues) => {
    const code = values.code.toUpperCase();
    if (items.some((item) => item.code === code)) {
      form.setError("code", { message: "Kode jenjang sudah digunakan." });
      return;
    }
    setItems((current) => [...current, { code, name: values.name, levels: values.levels, institutions: 0, active: true }]);
    setNotice(`Jenjang ${values.name} berhasil ditambahkan.`);
    closeDrawer();
  };

  return (
    <main className="min-h-screen bg-[#F3F5F9] p-5 text-[#1F2937] transition-colors dark:bg-[#0B1220] dark:text-[#E6ECF7] sm:p-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-600/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400"><ShieldCheck className="size-3.5" />Settings Portal</span><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Jenjang institusi</h1><p className="mt-1 max-w-xl text-sm leading-5 text-[#6B7280] dark:text-[#94A3B8]">Kelompok jenjang yang bisa dipilih institusi saat mendaftar. Perubahan berlaku untuk semua institusi.</p></div>
          <button type="button" onClick={() => setDrawerOpen(true)} className="flex h-10 items-center justify-center gap-1.5 rounded-md bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-[#3B82F6] dark:hover:bg-blue-500"><Plus className="size-4" />Tambah jenjang</button>
        </div>

        {notice && <div className="mb-5 flex items-center justify-between rounded-lg border border-blue-200 bg-[#E8F0FE] px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-[#14274A] dark:text-blue-200"><span>{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label="Tutup notifikasi"><X className="size-4" /></button></div>}

        <section aria-label="Ringkasan jenjang" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, amber }) => <article key={label} className="flex min-h-[96px] items-center gap-3 rounded-lg border border-[#E2E6EE] bg-white p-3.5 dark:border-[#1E2A44] dark:bg-[#111B2E]"><span className={`grid size-10 shrink-0 place-items-center rounded-[10px] ${amber ? "bg-amber-50 text-[#B7791F] dark:bg-amber-400/10 dark:text-[#E0A930]" : "bg-[#E8F0FE] text-[#2563EB] dark:bg-[#14274A] dark:text-[#3B82F6]"}`}><Icon className="size-5" strokeWidth={1.8} /></span><div><p className="font-mono text-2xl font-semibold leading-6 tabular-nums">{value}</p><p className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8]">{label}</p></div></article>)}
        </section>

        <section className="overflow-hidden rounded-lg border border-[#E2E6EE] bg-white dark:border-[#1E2A44] dark:bg-[#111B2E]">
          <div className="flex flex-col gap-3 border-b border-[#E2E6EE] p-3 dark:border-[#1E2A44] sm:flex-row">
            <label className="relative flex-1"><span className="sr-only">Cari jenjang</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau kode jenjang" className="h-10 w-full rounded-md border border-[#E2E6EE] bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 dark:border-[#1E2A44] dark:placeholder:text-[#94A3B8] dark:focus:border-[#3B82F6] dark:focus:ring-blue-500/20" /></label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-[#E2E6EE] bg-transparent px-3 text-sm font-medium outline-none focus:border-[#2563EB] dark:border-[#1E2A44] dark:focus:border-[#3B82F6]"><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
          </div>
          <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="border-b border-[#E2E6EE] text-xs font-medium text-[#6B7280] dark:border-[#1E2A44] dark:text-[#94A3B8]"><tr><th className="px-4 py-3 font-medium">Kode</th><th className="px-4 py-3 font-medium">Nama jenjang</th><th className="px-4 py-3 font-medium">Kelas / tingkat</th><th className="px-4 py-3 font-medium">Institusi</th><th className="px-4 py-3 font-medium">Aktif</th><th className="px-4 py-3 font-medium">Aksi</th></tr></thead><tbody>{visibleItems.map((item) => <tr key={item.code} className="border-b border-[#E2E6EE] last:border-0 dark:border-[#1E2A44]"><td className="px-4 py-3"><span className="inline-flex rounded bg-[#E8F0FE] px-2 py-0.5 text-xs font-bold text-[#2563EB] dark:bg-[#14274A] dark:text-[#3B82F6]">{item.code}</span></td><td className="px-4 py-3 font-semibold">{item.name}</td><td className="px-4 py-3 tabular-nums">{item.levels} tingkat</td><td className="px-4 py-3 font-mono tabular-nums">{item.institutions}</td><td className="px-4 py-3"><button type="button" role="switch" aria-checked={item.active} aria-label={`Status ${item.name}`} onClick={() => toggleStatus(item.code)} className={`relative h-5 w-9 rounded-full transition ${item.active ? "bg-[#2563EB] dark:bg-[#3B82F6]" : "bg-slate-300 dark:bg-slate-600"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white transition ${item.active ? "left-4" : "left-0.5"}`} /></button></td><td className="px-4 py-3 whitespace-nowrap"><button type="button" className="text-sm font-medium text-[#2563EB] hover:underline dark:text-[#3B82F6]">Ubah</button>{item.institutions > 0 ? <span className="ml-2 text-xs font-medium text-[#B7791F] dark:text-[#E0A930]">Terpakai</span> : <button type="button" onClick={() => setItems((current) => current.filter((candidate) => candidate.code !== item.code))} className="ml-2 text-xs text-[#6B7280] hover:underline dark:text-[#94A3B8]">Hapus</button>}</td></tr>)}</tbody></table></div>
          <p className="border-t border-[#E2E6EE] px-4 py-3 text-xs text-[#6B7280] dark:border-[#1E2A44] dark:text-[#94A3B8]">Menampilkan {visibleItems.length} dari {items.length} jenjang. Jenjang yang dipakai institusi tidak bisa dihapus, hanya dinonaktifkan.</p>
        </section>
      </div>

      {drawerOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><section className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E2E6EE] bg-white shadow-xl dark:border-[#1E2A44] dark:bg-[#111B2E]"><div className="flex items-center justify-between border-b border-[#E2E6EE] px-6 py-4 dark:border-[#1E2A44]"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400"><Layers3 className="size-5" /></span><div><h2 id="drawer-title" className="text-lg font-bold">Tambah jenjang</h2><p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Tambahkan jenjang baru untuk institusi.</p></div></div><button type="button" onClick={closeDrawer} className="rounded-lg p-1.5 text-[#6B7280] hover:bg-slate-100 dark:text-[#94A3B8] dark:hover:bg-white/5" aria-label="Tutup dialog"><X className="size-5" /></button></div><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6"><Field label="Kode" hint="Singkat, unik, tanpa spasi." error={form.formState.errors.code?.message}><input {...form.register("code")} className="field" placeholder="Contoh: SMA" /></Field><Field label="Nama jenjang" error={form.formState.errors.name?.message}><input {...form.register("name")} className="field" placeholder="Contoh: Sekolah menengah atas" /></Field><Field label="Jumlah tingkat" error={form.formState.errors.levels?.message}><input {...form.register("levels")} type="number" min="1" className="field" /></Field><Field label="Keterangan" optional error={form.formState.errors.description?.message}><textarea {...form.register("description")} className="field min-h-24 resize-y" placeholder="Tambahkan keterangan bila diperlukan" /></Field><div className="flex justify-end gap-2 border-t border-[#E2E6EE] pt-4 dark:border-[#1E2A44]"><button type="button" onClick={closeDrawer} className="h-10 rounded-md border border-[#E2E6EE] px-4 text-sm font-semibold hover:bg-slate-50 dark:border-[#1E2A44] dark:hover:bg-white/5">Batal</button><button type="submit" className="h-10 rounded-md bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-[#3B82F6]">Simpan jenjang</button></div></form></section></div>}
    </main>
  );
}

function Field({ label, hint, optional = false, error, children }: { label: string; hint?: string; optional?: boolean; error?: string; children: ReactNode }) {
  return <label className="block text-sm font-medium">{label}{optional && <span className="ml-1 font-normal text-[#6B7280] dark:text-[#94A3B8]">(opsional)</span>}<span className="mt-1.5 block">{children}</span>{hint && <span className="mt-1 block text-xs font-normal text-[#6B7280] dark:text-[#94A3B8]">{hint}</span>}{error && <span className="mt-1 block text-xs font-medium text-red-600 dark:text-red-400">{error}</span>}</label>;
}
