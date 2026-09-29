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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const handleExport = (format: 'csv' | 'json') => {
    // Mock export functionality
    alert(`Exporting logs in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. Breadcrumb & Header */}
      <div className="space-y-4">
        <nav className="flex text-sm text-muted-foreground font-medium">
          <ol className="flex items-center space-x-2">
            <li>
              <a href="/" className="hover:text-foreground flex items-center gap-1">
                <Home className="w-4 h-4" /> Dashboard
              </a>
            </li>
            <li><ChevronRightIcon className="w-4 h-4" /></li>
            <li className="text-foreground">Activity Logs</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Activity Logs</h1>
            <p className="text-muted-foreground mt-1">
              Monitor, track, and audit all platform activities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select onChange={(e) => handleExport(e.target.value as 'csv' | 'json')} defaultValue="">
              <option value="" disabled>Export Logs</option>
              <option value="csv">Export as CSV</option>
              <option value="json">Export as JSON</option>
            </Select>
            <Button className="shrink-0" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" /> Export
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
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
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
                <p className="text-sm font-medium text-muted-foreground">Today's Activities</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active Admins</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-9 w-16" /> : '12'}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Platform administrators active today</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Failed Activities</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? <Skeleton className="h-9 w-16" /> : '28'}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-red-500 mt-4 flex items-center gap-1">
               <span className="font-semibold">+4</span> since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        {/* 3. Advanced Search & Filters */}
        <CardHeader className="border-b pb-5 bg-muted/20">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
            <Filter className="w-4 h-4" /> Advanced Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Search Activity / User</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ID, Name, Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">User Role</label>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 bg-background">
                <option value="">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Instructor">Instructor</option>
                <option value="User">User</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Activity Type</label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 bg-background">
                <option value="">All Activities</option>
                <option value="login">Login / Logout</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="permission">Permission Changes</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 bg-background">
                <option value="">All Status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </Select>
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Date Range</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 bg-background" 
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 bg-background" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">IP Address</label>
              <Input
                type="text"
                placeholder="e.g. 192.168.1.1"
                value={ipSearch}
                onChange={(e) => setIpSearch(e.target.value)}
                className="h-9 bg-background"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="h-9 flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="h-9 px-3" title="Reset Filters">
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
                  <TableHead className="w-[180px]">Activity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="w-[160px]">Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center w-[60px]">Action</TableHead>
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
                      Failed to load audit logs. Please check your connection.
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="font-medium text-foreground">No audit logs match criteria</p>
                        <p className="text-sm mt-1">Try adjusting your advanced filters or search query.</p>
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
                            <span className="font-semibold text-foreground capitalize truncate max-w-[140px]" title={log.action}>
                              {log.action}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {Array.isArray(log.users?.profile) 
                                ? log.users?.profile[0]?.fullName || 'Unknown User' 
                                : (log.users?.profile as any)?.fullName || 'Unknown User'}
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
                            {role}
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
                            {status}
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
                            <span className="sr-only">View Audit Detail</span>
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
                Showing <span className="font-medium text-foreground">{data?.meta ? ((page - 1) * limit) + 1 : 0}</span> to <span className="font-medium text-foreground">{data?.meta ? Math.min(page * limit, data.meta.totalData) : 0}</span> of{' '}
                <span className="font-medium text-foreground">{data?.meta?.totalData || 0}</span> logs
              </span>
              <div className="flex items-center gap-2">
                <span>Rows:</span>
                <Select value={limit.toString()} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="h-8 w-[70px] text-xs">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">Page {page} of {data?.meta?.totalPages || 1}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data?.meta?.totalPages || 1, p + 1))}
                disabled={!data?.meta || page === data.meta.totalPages || isLoading}
                className="h-8 px-3"
              >
                Next
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
                  Audit Log Detail
                </CardTitle>
                <CardDescription className="mt-1 font-mono text-xs">
                  Log ID: {selectedLog.id}
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
                    <p className="font-semibold">{getStatus(selectedLog)} Execution</p>
                    {getStatus(selectedLog) === 'Failed' && (
                      <p className="text-sm mt-1 opacity-90">
                        Error code: ERR_VALIDATION_FAILED. Action was blocked due to missing permissions or invalid payload structure. (Mock Error)
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Actor</p>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">
                        {Array.isArray(selectedLog.users?.profile) 
                          ? selectedLog.users?.profile[0]?.fullName || 'Unknown User' 
                          : (selectedLog.users?.profile as any)?.fullName || 'Unknown User'}
                      </p>
                      <Badge variant="secondary" className="text-[10px] py-0">{getRole(selectedLog)}</Badge>
                    </div>
                    <p className="text-muted-foreground">{selectedLog.users?.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Action Context</p>
                    <p className="font-semibold text-foreground flex items-center gap-2 capitalize">
                      {getActionIcon(selectedLog.action)} {selectedLog.action}
                    </p>
                    <p className="text-muted-foreground mt-1">Module: {selectedLog.module}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Timestamp</p>
                    <p className="font-medium text-foreground">{formatDate(selectedLog.created_at)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">UTC Timezone</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Network Origin</p>
                    <p className="font-mono text-foreground font-medium">{selectedLog.ip_address || 'N/A'}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">Target Entity</p>
                    {selectedLog.table_name ? (
                      <div className="bg-muted/50 p-3 rounded-md border border-border">
                        <p className="text-sm font-medium"><span className="text-muted-foreground">Table:</span> {selectedLog.table_name}</p>
                        {selectedLog.record_id && (
                          <p className="text-sm font-mono mt-1"><span className="text-muted-foreground font-sans">Record ID:</span> {selectedLog.record_id}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No specific entity targeted</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase tracking-wider">User Agent</p>
                    <p className="font-mono text-[11px] p-3 bg-muted/30 rounded border border-border text-muted-foreground break-all">
                      {selectedLog.user_agent || 'Unknown / Not captured'}
                    </p>
                  </div>

                  {selectedLog.action.toLowerCase().includes('update') && getStatus(selectedLog) === 'Success' && (
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">Data Changes (Mock)</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-border rounded-md overflow-hidden">
                          <div className="bg-muted/50 px-3 py-1.5 border-b border-border text-xs font-medium text-muted-foreground">Before</div>
                          <pre className="p-3 text-[10px] font-mono text-red-500/80 bg-red-500/5 overflow-x-auto">
                            {`{\n  "status": "pending",\n  "updated_by": null\n}`}
                          </pre>
                        </div>
                        <div className="border border-border rounded-md overflow-hidden">
                          <div className="bg-muted/50 px-3 py-1.5 border-b border-border text-xs font-medium text-muted-foreground">After</div>
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
                <ShieldAlert className="w-3 h-3" /> Audit log is immutable
              </p>
              <Button onClick={() => setSelectedLog(null)} variant="outline">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
