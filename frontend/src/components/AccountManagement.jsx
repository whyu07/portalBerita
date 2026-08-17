import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit, Plus, X, Search, User, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccountManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'author',
    password: '',
  });

  const fetchAccounts = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?limit=100&search=${encodeURIComponent(searchQuery)}`);
      setAccounts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAccounts(search);
  };

  const handleOpenModal = (acc = null) => {
    if (acc) {
      setEditingAccount(acc);
      setForm({
        name: acc.name,
        email: acc.email,
        role: acc.role,
        password: '', // Password lama tidak ditampilkan, isi password baru opsional
      });
    } else {
      setEditingAccount(null);
      setForm({
        name: '',
        email: '',
        role: 'author',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await api.put(`/admin/users/${editingAccount.id}`, form);
        if (editingAccount.id === user.id && (form.password || form.role !== user.role)) {
            // Force logout if self updated password or role
            logout();
            navigate('/medialog');
            return;
        }
      } else {
        await api.post('/admin/users', form);
      }
      setShowModal(false);
      fetchAccounts(search);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan akun');
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${id}`);
      if (id === user.id) {
        // If deleted self
        logout();
        navigate('/medialog');
        return;
      }
      fetchAccounts(search);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus akun');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '35px', marginBottom: 0 }}
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm">Cari</button>
        </form>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" id="btn-admin-add-account">
          <Plus size={16} /> Tambah Akun
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama Pengguna</th>
              <th>Email</th>
              <th>Role</th>
              <th>Bergabung Pada</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Memuat data akun...</td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Tidak ada akun ditemukan.</td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '50%' }}>
                        <User size={16} />
                      </div>
                      <strong>{acc.name} {acc.id === user.id && '(Anda)'}</strong>
                    </div>
                  </td>
                  <td>{acc.email}</td>
                  <td>
                    <span className="badge-category" style={{ 
                        background: acc.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
                        color: acc.role === 'admin' ? '#ef4444' : '#3b82f6', 
                        borderColor: 'transparent',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem'
                    }}>
                      {acc.role}
                    </span>
                  </td>
                  <td>{new Date(acc.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenModal(acc)} className="btn btn-outline btn-sm" title="Edit Akun">
                        <Edit size={14} />
                      </button>
                      {acc.role === 'author' && (
                        <button 
                          onClick={() => handleDeleteAccount(acc.id)} 
                          className="btn btn-outline btn-sm" 
                          style={{ color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }} 
                          title="Hapus Akun Author"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAccount}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role Pengguna</label>
                <select
                  className="form-control"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="author">Author (Penulis)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>{editingAccount ? 'Password Baru (Opsional)' : 'Password'}</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  required={!editingAccount}
                  placeholder={editingAccount ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
                />
              </div>
              
              {editingAccount && editingAccount.id === user.id && (form.password || form.role !== user.role) && (
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.75rem', borderRadius: '4px', color: '#f59e0b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <strong>Perhatian:</strong> Mengubah password atau role Anda sendiri akan membuat Anda keluar (logout) otomatis.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" id="btn-save-account-modal">
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
