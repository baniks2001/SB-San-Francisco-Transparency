import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface User {
  _id: string;
  username: string;
  fullName: string;
  role: string;
  profileImage?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

interface Position {
  _id: string;
  name: string;
  description: string;
  accessibleTabs: string[];
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<any>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, positionsResponse] = await Promise.all([
        api.get('/users'),
        api.get('/positions')
      ]);
      setUsers(usersResponse.data);
      setPositions(positionsResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (type: 'create' | 'edit', user?: User) => {
    setModalType(type);
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        fullName: '',
        role: '',
        permissions: [],
        isActive: true
      });
    }
    setSelectedFile(null);
    setIsUserModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openPositionModal = (type: 'create' | 'edit', position?: Position) => {
    setModalType(type);
    if (position) {
      setEditingPosition(position);
      setFormData({
        name: position.name,
        description: position.description,
        accessibleTabs: position.accessibleTabs
      });
    } else {
      setEditingPosition(null);
      setFormData({
        name: '',
        description: '',
        accessibleTabs: []
      });
    }
    setIsPositionModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closePositionModal = () => {
    setIsPositionModalOpen(false);
    setEditingPosition(null);
    setFormData({
      name: '',
      description: '',
      accessibleTabs: []
    });
    setError('');
    setSuccess('');
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      role: '',
      permissions: [],
      isActive: true
    });
    setSelectedFile(null);
    setError('');
    setSuccess('');
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalType === 'create') {
        await api.post('/users', formData);
        setSuccess('User created successfully!');
      } else {
        await api.put(`/users/${editingUser?._id}`, formData);
        setSuccess('User updated successfully!');
      }

      // Upload profile image if selected
      if (selectedFile && editingUser) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/users/${editingUser._id}/profile-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Profile image updated successfully!');
      }

      await fetchData();
      closeUserModal();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handlePositionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalType === 'create') {
        await api.post('/positions', formData);
        setSuccess('Position created successfully!');
      } else {
        await api.put(`/positions/${editingPosition?._id}`, formData);
        setSuccess('Position updated successfully!');
      }

      await fetchData();
      closePositionModal();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save position');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/api/users/${id}`);
      setSuccess('User deleted successfully!');
      await fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeletePosition = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this position?')) return;
    
    try {
      await api.delete(`/api/positions/${id}`);
      setSuccess('Position deleted successfully!');
      await fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete position');
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/api/users/${id}/status`, { isActive: !currentStatus });
      setSuccess(`User ${currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // Check if current user is System Administrator
  if (currentUser?.role !== 'System Administrator') {
    return (
      <div className="p-6">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-200 mb-2">Access Denied</h3>
          <p className="text-red-300">Only System Administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl shadow-xl p-6 border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-300">Manage user accounts and position roles</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {/* Position Roles Table */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Position Roles</h2>
          <button
            onClick={() => openPositionModal('create')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Create Position
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Position Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Accessible Tabs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {positions.map((position) => (
                <tr key={position._id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{position.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{position.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {position.accessibleTabs.map((tab, index) => (
                        <span key={index} className="px-2 py-1 bg-yellow-600 text-white rounded text-xs">
                          {tab}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openPositionModal('edit', position)}
                      className="text-yellow-400 hover:text-yellow-300 font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePosition(position._id)}
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">User Accounts</h2>
          <button
            onClick={() => openUserModal('create')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{user.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'System Administrator' ? 'bg-purple-600 text-white' :
                      user.role === 'Administrator' ? 'bg-blue-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openUserModal('edit', user)}
                      className="text-yellow-400 hover:text-yellow-300 font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className={`px-2 py-1 rounded ${
                        user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      } text-white text-xs`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-400 hover:text-red-300 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalType === 'create' ? 'Add New User' : 'Edit User'}
            </h3>
            <form onSubmit={handleUserSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Staff">Staff</option>
                    {currentUser?.role === 'System Administrator' && (
                      <option value="System Administrator">System Administrator</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                  accept="image/*"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (modalType === 'create' ? 'Create User' : 'Update User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Position Modal */}
      {isPositionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalType === 'create' ? 'Create Position' : 'Edit Position'}
            </h3>
            <form onSubmit={handlePositionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Position Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Accessible Tabs
                </label>
                <div className="space-y-2">
                  {['Dashboard', 'Resolutions', 'Ordinances', 'Procurements', 'Vacancies', 'Announcements', 'Users', 'Settings'].map((tab) => (
                    <label key={tab} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.accessibleTabs?.includes(tab)}
                        onChange={(e) => {
                          const tabs = formData.accessibleTabs || [];
                          if (e.target.checked) {
                            setFormData({...formData, accessibleTabs: [...tabs, tab]});
                          } else {
                            setFormData({...formData, accessibleTabs: tabs.filter((t: string) => t !== tab)});
                          }
                        }}
                        className="mr-2 rounded border-gray-600 bg-gray-800 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-300">{tab}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPositionModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  {modalType === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
