import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  CloudCog,
  Globe2,
  HardDriveDownload,
  KeyRound,
  Moon,
  Network,
  RefreshCcw,
  ServerCog,
  ShieldCheck,
  Sun,
  Wrench,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

const settingsSchema = z.object({
  platformName: z.string(),
  rootHostname: z.string(),
  wildcardDomain: z.string(),
  idleTimeout: z.string(),
  jwtExpiry: z.string(),
  trialDuration: z.string(),
  userLimit: z.string(),
  bannerMessage: z.string(),
  ipWhitelist: z.string(),
  estimatedEnd: z.string(),
  fidoRequired: z.boolean(),
  totpAllowed: z.boolean(),
  manualVerification: z.boolean(),
  maintenanceLock: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const defaultValues: SettingsForm = {
  platformName: "[Nama Platform]",
  rootHostname: "[domain-utama.ac.id]",
  wildcardDomain: "*.[domain-utama.ac.id]",
  idleTimeout: "15",
  jwtExpiry: "60 menit",
  trialDuration: "30 hari",
  userLimit: "500 pengguna",
  bannerMessage: "[PEMBERITAHUAN] Sistem akan menjalani pemeliharaan rutin pada [tanggal], [jam] WIB. Seluruh portal akan tidak dapat diakses sementara.",
  ipWhitelist: "[IP-1], [IP-2]",
  estimatedEnd: "[tanggal, jam]",
  fidoRequired: true,
  totpAllowed: false,
  manualVerification: true,
  maintenanceLock: false,
};

const navigation = [
  { label: "Konfigurasi Inti SaaS", icon: ServerCog, active: true },
  { label: "Manajemen Tenant", icon: Building2 },
  { label: "Kebijakan Autentikasi 2FA", icon: ShieldCheck },
  { label: "DNS, SSL & Routing", icon: Network },
  { label: "Mode Maintenance & WAF", icon: Wrench },
  { label: "API Gateway & Webhooks", icon: CloudCog },
];

const tabs = ["Identitas & Domain", "2FA & Sesi FIDO2", "Tenant & Onboarding", "Mode Maintenance", "Danger Zone"];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6BFF]", checked ? "bg-[#2F6BFF]" : "bg-[#98A2B3] dark:bg-[#475467]")}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

function Field({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className={cn("block min-w-0", className)}><span className="mb-1.5 block text-xs font-medium text-[#475467] dark:text-[#9AA7C0]">{label}</span><input className="h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 font-mono text-sm font-medium text-[#101828] outline-none placeholder:text-[#667085] focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/15 dark:border-[#2B3A63] dark:bg-[#0B1220] dark:text-[#E6EAF2] dark:placeholder:text-[#9AA7C0]" {...props} /></label>;
}

function CardHeading({ icon: Icon, title, description, badge }: { icon: ComponentType<{ className?: string }>; title: string; description: string; badge?: string }) {
  return <div className="flex min-w-0 items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF0FF] text-[#2F6BFF] dark:bg-[#1B2B54] dark:text-[#7FB0FF]"><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-[#101828] dark:text-[#E6EAF2]">{title}</h2>{badge && <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">{badge}</span>}</div><p className="mt-0.5 text-xs leading-4 text-[#475467] dark:text-[#9AA7C0]">{description}</p></div></div>;
}

export function SuperadminSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset, watch, setValue } = useForm<SettingsForm>({ defaultValues, resolver: zodResolver(settingsSchema) });
  const values = watch();
  const isDark = theme === "dark";
  const onSubmit = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2500); };

  return (
    <main className="min-h-screen bg-[#F4F6F9] font-sans text-[#101828] dark:bg-[#0B1220] dark:text-[#E6EAF2]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-[248px] shrink-0 flex-col border-r border-[#E4E7EC] bg-white px-4 py-5 dark:border-[#223054] dark:bg-[#0E1730]">
          <div className="flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#2F6BFF] text-white"><ServerCog className="h-5 w-5" /></div><div><p className="text-sm font-bold leading-tight">Console Superadmin</p><p className="font-mono text-[11px] text-[#475467] dark:text-[#9AA7C0]">[Nama Platform]</p></div></div>
          <p className="mt-9 px-2 text-[10px] font-bold tracking-[0.08em] text-[#667085] dark:text-[#9AA7C0]">PENGATURAN INFRASTRUKTUR</p>
          <nav className="mt-3 space-y-1">{navigation.map(({ label, icon: Icon, active }) => <button className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors", active ? "bg-[#EAF0FF] text-[#1748C5] dark:bg-[#1B2B54] dark:text-[#7FB0FF]" : "text-[#475467] hover:bg-slate-100 dark:text-[#9AA7C0] dark:hover:bg-white/5")} key={label} type="button"><Icon className="h-4 w-4" />{label}</button>)}</nav>
          <div className="mt-auto border-t border-[#E4E7EC] px-2 pt-4 dark:border-[#223054]"><p className="text-[10px] font-semibold text-[#475467] dark:text-[#9AA7C0]">Primary Cluster</p><p className="font-mono text-[11px] text-[#101828] dark:text-[#E6EAF2]">[nama-cluster-utama]</p></div>
        </aside>

        <section className="min-w-0 flex-1 px-7 py-5 xl:px-8">
          <div className="flex items-center justify-between gap-4 text-xs"><div className="flex min-w-0 items-center text-[#475467] dark:text-[#9AA7C0]"><span>Console</span><ChevronRight className="h-3.5 w-3.5" /><span>Superadmin</span><ChevronRight className="h-3.5 w-3.5" /><span className="truncate">Pengaturan Arsitektur & Keamanan</span></div><div className="flex shrink-0 items-center gap-3"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"><CircleDot className="h-3 w-3" />Sistem normal</span><span className="font-mono text-[#475467] dark:text-[#9AA7C0]">root@[domain]</span><button aria-label="Ganti tema" className="grid h-8 w-8 place-items-center rounded-lg border border-[#E4E7EC] text-[#475467] hover:bg-white dark:border-[#223054] dark:text-[#9AA7C0] dark:hover:bg-white/5" onClick={toggleTheme} type="button">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button></div></div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <header className="mt-6 flex items-end justify-between gap-5"><div><h1 className="text-2xl font-bold tracking-tight">Pengaturan Superadmin</h1><p className="mt-1 max-w-2xl text-sm text-[#475467] dark:text-[#9AA7C0]">Konfigurasi pusat sistem multi-tenant, sertifikasi domain kustom, autentikasi perangkat keras FIDO2, dan lokasi data.</p></div><div className="flex shrink-0 gap-2"><button className="h-11 rounded-lg border border-[#D0D5DD] bg-white px-4 text-xs font-bold text-[#344054] hover:bg-slate-50 dark:border-[#2B3A63] dark:bg-[#111A2E] dark:text-[#E6EAF2]" onClick={() => reset(defaultValues)} type="button"><RefreshCcw className="mr-1.5 inline h-3.5 w-3.5" />Reset Perubahan</button><button className="h-11 rounded-lg bg-[#2F6BFF] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#2458db]" type="submit"><Check className="mr-1.5 inline h-3.5 w-3.5" />{saved ? "Konfigurasi tersimpan" : "Terapkan Konfigurasi"}</button></div></header>
            <div className="mt-6 flex border-b border-[#E4E7EC] dark:border-[#223054]">{tabs.map((tab) => <button className={cn("relative px-3 py-3 text-xs font-semibold", activeTab === tab ? tab === "Danger Zone" ? "text-[#E11D48]" : "text-[#2F6BFF] dark:text-[#7FB0FF]" : tab === "Danger Zone" ? "text-[#E11D48]" : "text-[#475467] dark:text-[#9AA7C0]")} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}{activeTab === tab && <span className={cn("absolute inset-x-2 bottom-0 h-0.5", tab === "Danger Zone" ? "bg-[#E11D48]" : "bg-[#2F6BFF]")} />}</button>)}</div>

            <div className="mt-5 space-y-5">
              <article className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm dark:border-[#223054] dark:bg-[#111A2E]"><CardHeading badge="DNS auto-propagation" description="Atur nama dan domain induk, serta sertifikat TLS otomatis untuk setiap tenant." icon={Globe2} title="Identitas Platform SaaS & Custom Domain SSL" /><div className="mt-5 grid grid-cols-3 gap-3"><Field label="Nama resmi platform" {...register("platformName")} /><Field label="Root hostname domain" {...register("rootHostname")} /><Field label="Wildcard subdomain tenant" {...register("wildcardDomain")} /></div><div className="mt-4 flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2.5 dark:bg-[#0B1220]"><p className="text-xs text-[#475467] dark:text-[#9AA7C0]"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />TLS 1.3 strict mode aktif</p><div className="flex gap-2"><button className="mini-button" type="button">Cek CNAME</button><button className="mini-button" type="button">Paksa Renew SSL</button></div></div></article>

              <div className="grid grid-cols-2 gap-5"><article className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm dark:border-[#223054] dark:bg-[#111A2E]"><CardHeading badge="FIDO2 siap" description="Protokol keamanan FIDO2 / WebAuthn untuk akun superadmin." icon={ShieldCheck} title="Autentikasi 2FA & Hardware Key" /><div className="mt-5 flex items-start justify-between gap-3"><div><p className="text-xs font-bold">Wajibkan FIDO2 untuk superadmin</p><p className="mt-0.5 text-[11px] text-[#475467] dark:text-[#9AA7C0]">Biometrik atau kunci keras wajib saat login.</p></div><Toggle checked={values.fidoRequired} label="Wajibkan FIDO2" onChange={(value) => setValue("fidoRequired", value)} /></div><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Timeout sesi idle (menit)" {...register("idleTimeout")} /><Field label="Masa kedaluwarsa token JWT" {...register("jwtExpiry")} /></div><div className="mt-4 flex items-start justify-between gap-3"><div><p className="text-xs font-bold">Izinkan TOTP authenticator</p><p className="mt-0.5 text-[11px] text-[#475467] dark:text-[#9AA7C0]">Hanya sebagai cadangan darurat.</p></div><Toggle checked={values.totpAllowed} label="Izinkan TOTP" onChange={(value) => setValue("totpAllowed", value)} /></div></article>
              <article className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm dark:border-[#223054] dark:bg-[#111A2E]"><CardHeading badge="Auto-provision" description="Aturan pendaftaran tenant dan masa uji coba." icon={Building2} title="Tenant Onboarding & Trial Rules" /><div className="mt-5 grid grid-cols-2 gap-3"><Field label="Durasi trial tenant baru" {...register("trialDuration")} /><Field label="Batas pengguna default" {...register("userLimit")} /></div><div className="mt-4 flex items-start justify-between gap-3"><div><p className="text-xs font-bold">Verifikasi manual oleh superadmin</p><p className="mt-0.5 text-[11px] text-[#475467] dark:text-[#9AA7C0]">Tenant aktif setelah disetujui.</p></div><Toggle checked={values.manualVerification} label="Verifikasi manual" onChange={(value) => setValue("manualVerification", value)} /></div><p className="mt-3 font-mono text-[11px] text-[#475467] dark:text-[#9AA7C0]">Alokasi object storage default: [50 GB]</p></article></div>

              <article className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-sm dark:border-[#223054] dark:bg-[#111A2E]"><div className="flex items-start justify-between gap-4"><CardHeading description="Kunci akses portal dan siarkan pesan ke semua tenant." icon={Wrench} title="Mode Maintenance & Banner Notifikasi Siaran" /><div className="flex items-center gap-3 pt-1"><span className="text-xs text-[#475467] dark:text-[#9AA7C0]">Aktifkan maintenance lock</span><Toggle checked={values.maintenanceLock} label="Aktifkan maintenance lock" onChange={(value) => setValue("maintenanceLock", value)} /></div></div><div className="mt-5 grid grid-cols-2 gap-5"><div><label><span className="mb-1.5 block text-xs font-medium text-[#475467] dark:text-[#9AA7C0]">Teks banner / pesan pemeliharaan</span><textarea className="h-24 w-full resize-none rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 font-mono text-xs font-medium leading-5 text-[#101828] outline-none focus:border-[#2F6BFF] dark:border-[#2B3A63] dark:bg-[#0B1220] dark:text-[#E6EAF2]" {...register("bannerMessage")} /></label><div className="mt-3 grid grid-cols-2 gap-3"><Field label="Whitelist IP superadmin" {...register("ipWhitelist")} /><Field label="Perkiraan waktu selesai" {...register("estimatedEnd")} /></div></div><div><p className="mb-1.5 text-xs font-medium text-[#475467] dark:text-[#9AA7C0]">Live preview tampilan banner di sisi pengguna</p><div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700/70 dark:bg-amber-950/30 dark:text-amber-200"><p className="text-xs font-bold">PEMBERITAHUAN SISTEM PUSAT</p><p className="mt-2 whitespace-pre-line text-xs leading-5">{values.bannerMessage}</p></div></div></div></article>

              <article className="flex items-center justify-between gap-5 rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/70 dark:bg-rose-950/25"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-[#E11D48] dark:bg-rose-950/70"><AlertTriangle className="h-5 w-5" /></div><div><h2 className="text-sm font-bold text-[#BE123C] dark:text-rose-300">Danger Zone: Otorisasi & Pemutusan Sesi Darurat</h2><p className="mt-1 max-w-xl text-xs leading-5 text-[#9F1239] dark:text-rose-200">Mencabut seluruh sesi aktif akan memaksa semua pengguna login ulang. Tindakan ini tidak dapat dibatalkan.</p></div></div><div className="flex shrink-0 gap-2"><button className="h-11 rounded-lg border border-rose-200 bg-white px-4 text-xs font-bold text-[#BE123C] dark:border-rose-900/70 dark:bg-transparent dark:text-rose-200" type="button"><HardDriveDownload className="mr-1.5 inline h-3.5 w-3.5" />Unduh Snapshot Saat Ini</button><button className="h-11 rounded-lg bg-[#E11D48] px-4 text-xs font-bold text-white hover:bg-[#be123c]" type="button"><KeyRound className="mr-1.5 inline h-3.5 w-3.5" />Cabut Semua Sesi Aktif</button></div></article>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
