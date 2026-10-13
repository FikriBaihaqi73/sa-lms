import { useState, useMemo } from 'react';
import { useActivityLogs } from '../hooks/use-activity-logs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Download,
  Users,
  Calendar,
  X,
  Eye,
  LogIn,
  LogOut,
  PlusCircle,
  Edit,
  Trash2,
  ShieldAlert,
  Home,
  ChevronRight as ChevronRightIcon,
  Filter,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import type { ActivityLog } from '../types';

export function ActivityLogList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25); // Default to 25 for audit
  
  // Filter States
  const [search, setSearch] = useState('');
  const [ipSearch, setIpSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Applied filters (to trigger filtering on "Apply Filters" click)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    ipSearch: '',
    roleFilter: '',
    typeFilter: '',
    statusFilter: '',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  
  // The API only supports basic search, so we'll use it for the main text search, 
  // but we apply other filters client-side for now to meet UI requirements.
  const { data, isLoading, isError } = useActivityLogs(page, limit, appliedFilters.search);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      ipSearch,
      roleFilter,
      typeFilter,
      statusFilter,
      dateFrom,
      dateTo
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setIpSearch('');
    setRoleFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setAppliedFilters({
      search: '',
      ipSearch: '',
      roleFilter: '',
      typeFilter: '',
      statusFilter: '',
      dateFrom: '',
      dateTo: ''
    });
    setPage(1);
  };

  // Mock Derivations for features not yet in backend
  const getStatus = (log: ActivityLog) => log.id.charCodeAt(0) % 7 === 0 ? 'Failed' : 'Success';
  
  const getRole = (log: ActivityLog) => {
    const email = log.users?.email || '';
    if (email.includes('super')) return 'Super Admin';
    if (email.includes('admin')) return 'Admin';
    if (email.includes('instructor')) return 'Instructor';
    return 'User';
  };

  const getRoleLabel = (role: string) => ({
    'Super Admin': 'Superadmin',
    Admin: 'Admin',
    Instructor: 'Guru',
    User: 'Pengguna',
  })[role] ?? role;

  const getStatusLabel = (status: string) => status === 'Success' ? 'Berhasil' : 'Gagal';

  const getActionLabel = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('login')) return 'Masuk';
    if (lower.includes('logout')) return 'Keluar';
    if (lower.includes('create') || lower.includes('insert')) return 'Buat';
    if (lower.includes('update') || lower.includes('edit')) return 'Perbarui';
    if (lower.includes('delete') || lower.includes('remove')) return 'Hapus';
    if (lower.includes('permission')) return 'Perubahan Izin';
    return action;
  };

  const getActionIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('login')) return <LogIn className="w-4 h-4 text-blue-500" />;
    if (lower.includes('logout')) return <LogOut className="w-4 h-4 text-slate-500" />;
    if (lower.includes('create') || lower.includes('insert')) return <PlusCircle className="w-4 h-4 text-emerald-500" />;
    if (lower.includes('update') || lower.includes('edit')) return <Edit className="w-4 h-4 text-amber-500" />;
    if (lower.includes('delete') || lower.includes('remove')) return <Trash2 className="w-4 h-4 text-red-500" />;
    if (lower.includes('permission') || lower.includes('role')) return <ShieldAlert className="w-4 h-4 text-purple-500" />;
    return <Activity className="w-4 h-4 text-indigo-500" />;
  };

  // Client-side filtering for advanced fields
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    let filtered = [...data.data];

    if (appliedFilters.ipSearch) {
      filtered = filtered.filter(log => log.ip_address?.includes(appliedFilters.ipSearch));
    }
    if (appliedFilters.typeFilter) {
      filtered = filtered.filter(log => log.action.toLowerCase().includes(appliedFilters.typeFilter.toLowerCase()));
    }
    if (appliedFilters.statusFilter) {
      filtered = filtered.filter(log => getStatus(log) === appliedFilters.statusFilter);
    }
    if (appliedFilters.roleFilter) {
      filtered = filtered.filter(log => getRole(log) === appliedFilters.roleFilter);
    }
    if (appliedFilters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.created_at) >= new Date(appliedFilters.dateFrom));
    }
    if (appliedFilters.dateTo) {
      // Add one day to dateTo to include the whole day
      const toDate = new Date(appliedFilters.dateTo);
      toDate.setDate(toDate.getDate() + 1);
      filtered = filtered.filter(log => new Date(log.created_at) <= toDate);
    }

    return filtered;
  }, [data?.data, appliedFilters]);

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const handleExport = (format: 'csv' | 'json') => {
    // Mock export functionality
    alert(`Mengekspor log dalam format ${format.toUpperCase()}...`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. Breadcrumb & Header */}
      <div className="space-y-4">
        <nav className="flex text-sm text-muted-foreground font-medium">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="hover:text-foreground flex items-center gap-1">
                <Home className="w-4 h-4" /> Dasbor
              </a>
            </li>
            <li><ChevronRightIcon className="w-4 h-4" /></li>
            <li className="text-foreground">Log Aktivitas</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Log Aktivitas</h1>
            <p className="text-muted-foreground mt-1">
              Pantau dan audit seluruh aktivitas platform.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select onChange={(e) => handleExport(e.target.value as 'csv' | 'json')} defaultValue="">
              <option value="" disabled>Ekspor Log</option>
              <option value="csv">Ekspor sebagai CSV</option>
              <option value="json">Ekspor sebagai JSON</option>
            </Select>
            <Button className="shrink-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" /> Ekspor
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Aktivitas</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-9 w-20" /> : (data?.meta.totalData.toLocaleString() || '0')}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Aktivitas Hari Ini</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-9 w-16" /> : '3,142'}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Admin Aktif</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-9 w-16" /> : '12'}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Administrator platform yang aktif hari ini</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Aktivitas Gagal</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-9 w-16" /> : '28'}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-red-500 mt-4 flex items-center gap-1">
               <span className="font-semibold">+4</span> sejak satu jam lalu
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        {/* 3. Advanced Search & Filters */}
        <CardHeader className="border-b pb-5 bg-muted/20">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
            <Filter className="w-4 h-4" /> Filter Lanjutan
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Cari Aktivitas / Pengguna</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ID, Nama, Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Peran Pengguna</label>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 bg-background">
                <option value="">Semua Peran</option>
                <option value="Super Admin">Superadmin</option>
                <option value="Admin">Admin</option>
                <option value="Instructor">Guru</option>
                <option value="User">Pengguna</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Jenis Aktivitas</label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 bg-background">
                <option value="">Semua Aktivitas</option>
                <option value="login">Masuk / Keluar</option>
                <option value="create">Buat</option>
                <option value="update">Perbarui</option>
                <option value="delete">Hapus</option>
                <option value="permission">Perubahan Izin</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 bg-background">
                <option value="">Semua Status</option>
                <option value="Success">Berhasil</option>
                <option value="Failed">Gagal</option>
              </Select>
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Rentang Tanggal</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 bg-background" 
                />
                <span className="text-muted-foreground text-sm">sampai</span>
                <Input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 bg-background" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Alamat IP</label>
              <Input
                type="text"
                placeholder="Contoh: 192.168.1.1"
                value={ipSearch}
                onChange={(e) => setIpSearch(e.target.value)}
                className="h-9 bg-background"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="h-9 flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white">
                Terapkan Filter
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="h-9 px-3" title="Hapus Filter">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* 4. Activity Logs Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px]">Aktivitas</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Sasaran</TableHead>
                  <TableHead>Alamat IP</TableHead>
                  <TableHead className="w-[160px]">Tanggal & Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center w-[60px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center text-red-500">
                      Gagal memuat log audit. Periksa koneksi Anda.
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-foreground">Tidak ada log audit yang sesuai</p>
                        <p className="text-sm mt-1">Coba sesuaikan filter lanjutan atau kata kunci pencarian.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((log) => {
                    const status = getStatus(log);
                    const role = getRole(log);
                    return (
                      <TableRow key={log.id} className="transition-colors group hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="font-semibold text-foreground capitalize truncate max-w-[140px]" title={getActionLabel(log.action)}>
                              {getActionLabel(log.action)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {Array.isArray(log.users?.profile)
                                ? log.users?.profile[0]?.fullName || 'Pengguna tidak diketahui'
                                : (log.users?.profile as any)?.fullName || 'Pengguna tidak diketahui'}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {log.users?.email || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-medium ${
                            role === 'Super Admin' ? 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-900 dark:text-purple-400 dark:bg-purple-900/20' : 
                            role === 'Admin' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:bg-blue-900/20' :
                            'border-slate-200 text-slate-700 bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:bg-slate-800/30'
                          }`}>
                            {getRoleLabel(role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                            {log.module}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {log.table_name ? (
                              <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground inline-block w-fit">
                                {log.table_name}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                            {log.record_id && (
                              <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]" title={log.record_id}>
                                {log.record_id.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {log.ip_address || '-'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              status === 'Success' 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/50"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-800/50"
                            }
                          >
                            {getStatusLabel(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sr-only">Lihat Detail Audit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* 6. Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-muted/10 gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Menampilkan <span className="font-medium text-foreground">{data?.meta ? ((page - 1) * limit) + 1 : 0}</span> sampai <span className="font-medium text-foreground">{data?.meta ? Math.min(page * limit, data.meta.totalData) : 0}</span> dari{' '}
                <span className="font-medium text-foreground">{data?.meta?.totalData || 0}</span> log
              </span>
              <div className="flex items-center gap-2">
                <span>Baris:</span>
                <Select value={limit.toString()} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="h-8 w-[70px] text-xs">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">Halaman {page} dari {data?.meta?.totalPages || 1}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data?.meta?.totalPages || 1, p + 1))}
                disabled={!data?.meta || page === data.meta.totalPages || isLoading}
                className="h-8 px-3"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Activity Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl shadow-2xl border-border animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row justify-between items-start border-b border-border pb-4 shrink-0 bg-muted/10">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  Detail Log Audit
                </CardTitle>
                <CardDescription className="mt-1 font-mono text-xs">
                  ID Log: {selectedLog.id}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="h-8 w-8 -mt-2 -mr-2">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Status Banner */}
                <div className={`p-4 rounded-lg flex items-start gap-3 border ${getStatus(selectedLog) === 'Success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'}`}>
                  {getStatus(selectedLog) === 'Success' ? <Activity className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />}
                  <div>
                    <p className="font-semibold">{getStatusLabel(getStatus(selectedLog))} Dieksekusi</p>
                    {getStatus(selectedLog) === 'Failed' && (
                      <p className="text-sm mt-1 opacity-90">
                        Kode kesalahan: ERR_VALIDATION_FAILED. Tindakan diblokir karena izin tidak tersedia atau struktur data tidak valid. (Kesalahan Simulasi)
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Pelaku</p>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">
                        {Array.isArray(selectedLog.users?.profile)
                          ? selectedLog.users?.profile[0]?.fullName || 'Pengguna tidak diketahui'
                          : (selectedLog.users?.profile as any)?.fullName || 'Pengguna tidak diketahui'}
                      </p>
                      <Badge variant="secondary" className="text-[10px] py-0">{getRoleLabel(getRole(selectedLog))}</Badge>
                    </div>
                    <p className="text-muted-foreground">{selectedLog.users?.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Konteks Aksi</p>
                    <p className="font-semibold text-foreground flex items-center gap-2 capitalize">
                      {getActionIcon(selectedLog.action)} {getActionLabel(selectedLog.action)}
                    </p>
                    <p className="text-muted-foreground mt-1">Modul: {selectedLog.module}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Waktu</p>
                    <p className="font-medium text-foreground">{formatDate(selectedLog.created_at)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Zona waktu UTC</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Asal Jaringan</p>
                    <p className="font-mono text-foreground font-medium">{selectedLog.ip_address || 'N/A'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Entitas Sasaran</p>
                    {selectedLog.table_name ? (
                      <div className="bg-muted/50 p-3 rounded-md border border-border">
                        <p className="text-sm font-medium"><span className="text-muted-foreground">Tabel:</span> {selectedLog.table_name}</p>
                        {selectedLog.record_id && (
                          <p className="text-sm font-mono mt-1"><span className="text-muted-foreground font-sans">ID Data:</span> {selectedLog.record_id}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">Tidak ada entitas sasaran tertentu</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Agen Pengguna</p>
                    <p className="font-mono text-[11px] p-3 bg-muted/30 rounded border border-border text-muted-foreground break-all">
                      {selectedLog.user_agent || 'Tidak diketahui / Tidak direkam'}
                    </p>
                  </div>

                  {selectedLog.action.toLowerCase().includes('update') && getStatus(selectedLog) === 'Success' && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">Perubahan Data (Simulasi)</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-border rounded-md overflow-hidden">
                          <div className="bg-muted/50 px-3 py-1.5 border-b border-border text-xs font-medium text-muted-foreground">Sebelum</div>
                          <pre className="p-3 text-[10px] font-mono text-red-500/80 bg-red-500/5 overflow-x-auto">
                            {`{\n  "status": "pending",\n  "updated_by": null\n}`}
                          </pre>
                        </div>
                        <div className="border border-border rounded-md overflow-hidden">
                          <div className="bg-muted/50 px-3 py-1.5 border-b border-border text-xs font-medium text-muted-foreground">Sesudah</div>
                          <pre className="p-3 text-[10px] font-mono text-emerald-500/80 bg-emerald-500/5 overflow-x-auto">
                            {`{\n  "status": "approved",\n  "updated_by": "${selectedLog.user_id}"\n}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t border-border bg-muted/20 shrink-0 flex justify-between items-center rounded-b-xl">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Log audit tidak dapat diubah
              </p>
              <Button onClick={() => setSelectedLog(null)} variant="outline">
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
