import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  type: 'system' | 'custom';
}

const mockRoles: Role[] = [
  { id: '1', name: 'Superadmin', description: 'Full access to all system features and settings.', usersCount: 1, type: 'system' },
  { id: '2', name: 'Admin', description: 'Can manage users, courses, and view reports.', usersCount: 3, type: 'system' },
  { id: '3', name: 'Teacher', description: 'Can manage own courses, contents and students.', usersCount: 24, type: 'system' },
  { id: '4', name: 'Student', description: 'Can access enrolled courses and submit assignments.', usersCount: 342, type: 'system' },
  { id: '5', name: 'Content Creator', description: 'Can create and edit course materials only.', usersCount: 5, type: 'custom' },
];

export function RolesPermissionPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = mockRoles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Roles & Permissions</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Manage roles and assign permissions to control user access.
          </p>
        </div>
        <Button className="shrink-0 group">
          <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
          Create New Role
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">System Roles</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              <Input
                type="search"
                placeholder="Search roles..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Role Name</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium text-center">Users</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${role.name === 'Superadmin' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {role.name === 'Superadmin' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{role.name}</p>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {role.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {role.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium px-2.5 py-1 rounded-full">
                        {role.usersCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400">
                          <Shield className="w-4 h-4" />
                          <span className="sr-only">Permissions</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400">
                          <Edit2 className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={role.type === 'system'}
                          className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                      No roles found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
