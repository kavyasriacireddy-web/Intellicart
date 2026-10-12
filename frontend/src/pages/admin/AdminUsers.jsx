import React, { useState, useEffect } from 'react';
import { Users, Shield, Check, X, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await api.put(`/auth/users/${userId}`, { role: newRole });
      if (res.data.success) {
        success(`User role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      error('Failed to update role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const res = await api.put(`/auth/users/${userId}`, { isActive: !currentStatus });
      if (res.data.success) {
        success(`Account ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchUsers();
      }
    } catch (err) {
      error('Failed to update status');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Accounts & Roles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage customer accounts, permissions, and administrative access
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {filtered.length} users registered
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Phone & Location</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-6">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </td>

                  <td className="py-3 px-6 text-slate-600">
                    <p>{u.phone || '—'}</p>
                    <p className="text-[10px] text-slate-400">{u.address?.city || 'India'}</p>
                  </td>

                  <td className="py-3 px-6">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                      <span>{u.role}</span>
                    </span>
                  </td>

                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.isActive !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-3 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleRoleToggle(u._id, u.role)}
                      className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                    >
                      Make {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                    </button>
                    <button
                      onClick={() => handleStatusToggle(u._id, u.isActive !== false)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg ${
                        u.isActive !== false
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
