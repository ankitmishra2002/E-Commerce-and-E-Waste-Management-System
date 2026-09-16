import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios.js';
import { formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';
import { UserPlus, UserCheck, ShieldAlert, Loader2, Edit } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [role, setRole] = useState('USER');
  const [isActive, setIsActive] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load user records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setRole(user.role);
    setIsActive(user.isActive);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axiosInstance.put(`/admin/users/${editingUser.id}`, { role, isActive });
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user details');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate/block this user?')) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="heading-display text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 border-b pb-4">
        User Operations
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User list */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 border rounded-2xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Platform Role</th>
                  <th className="pb-3">Member Since</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="text-slate-600 dark:text-slate-400">
                    <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                    <td className="py-4">{u.email}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-danger-bg text-danger-text' : u.role === 'VENDOR' ? 'bg-warning-bg text-warning-text' : 'bg-info-bg text-info-text'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4">{formatDate(u.createdAt)}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        u.isActive ? 'bg-success-bg text-success-text border-success-text/20' : 'bg-danger-bg text-danger-text border-danger-text/20'
                      }`}>
                        {u.isActive ? 'ACTIVE' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 border hover:bg-slate-50 rounded"
                          title="Edit User Detail"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        {u.isActive && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="p-1 border hover:bg-red-50 text-red-500 rounded"
                            title="Block User"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User editing sidebar card */}
        <div>
          {editingUser ? (
            <form
              onSubmit={handleUpdate}
              className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 shadow-sm sticky top-24"
            >
              <div>
                <h3 className="heading-display text-base font-bold flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-brand-600" />
                  <span>Edit User Role & Status</span>
                </h3>
                <span className="text-[10px] text-slate-400 mt-1 block truncate">User: {editingUser.name}</span>
              </div>

              <div className="space-y-4">
                {/* Role select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">User Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs focus:outline-none font-bold"
                  >
                    <option value="USER">USER (Customer)</option>
                    <option value="VENDOR">VENDOR (Seller)</option>
                    <option value="ADMIN">ADMIN (Manager)</option>
                  </select>
                </div>

                {/* Status toggle */}
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-705 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>User account is active (unblocked)</span>
                </label>
              </div>

              <div className="flex space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 border border-dashed rounded-2xl text-center text-xs text-slate-400 py-12">
              Select a user edit icon from the list to modify their roles or status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
