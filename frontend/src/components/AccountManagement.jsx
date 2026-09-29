import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit, Plus, Search, User, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './common/Button';
import { FormField } from './common/FormField';
import { DataTable } from './dashboard/DataTable';
import { ModalForm } from './dashboard/ModalForm';
import { StatusBadge } from './dashboard/StatusBadge';

export const AccountManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'author',
    password: '',
  });

  const fetchAccounts = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/users?limit=100&search=${encodeURIComponent(searchQuery)}`);
      setAccounts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError('Gagal memuat data akun. Silakan coba lagi.');
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
        password: '',
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
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    };

    if (editingAccount) {
      if (form.password) {
        if (form.password.length < 6) {
          setSubmitError('Password baru minimal 6 karakter');
          return;
        }
        payload.password = form.password;
      }
    } else {
      if (!form.password || form.password.length < 6) {
        setSubmitError('Password wajib diisi minimal 6 karakter');
        return;
      }
      payload.password = form.password;
    }

    setSubmitting(true);
    try {
      if (editingAccount) {
        await api.put(`/admin/users/${editingAccount.id}`, payload);
        if (editingAccount.id === user.id && (payload.password || payload.role !== user.role)) {
            // Force logout if self updated password or role
            logout();
            navigate('/medialog');
            return;
        }
      } else {
        await api.post('/admin/users', payload);
      }
      setShowModal(false);
      fetchAccounts(search);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Gagal menyimpan akun');
    } finally {
      setSubmitting(false);
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

  const columns = [
    {
      header: 'Nama Pengguna',
      accessor: 'name',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '50%' }}>
            <User size={16} />
          </div>
          <strong>{row.name} {row.id === user.id && '(Anda)'}</strong>
        </div>
      )
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <StatusBadge status={row.role === 'admin' ? 'breaking' : 'draft'} label={row.role.toUpperCase()} />
      )
    },
    {
      header: 'Bergabung Pada',
      accessor: 'created_at',
      cell: (row) => new Date(row.created_at).toLocaleDateString('id-ID')
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="sm" onClick={() => handleOpenModal(row)} aria-label="Edit Akun">
            <Edit size={14} />
          </Button>
          {row.role === 'author' && (
            <Button variant="danger" size="sm" onClick={() => handleDeleteAccount(row.id)} aria-label="Hapus Akun Author">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )
    }
  ];

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
          <Button type="submit" variant="outline">Cari</Button>
        </form>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus size={16} style={{ marginRight: '0.5rem' }} /> Tambah Akun
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={accounts}
        loading={loading}
        error={error}
        emptyTitle="Tidak ada akun"
        emptyDescription="Belum ada akun yang terdaftar atau ditemukan."
      />

      <ModalForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
        onSubmit={handleSaveAccount}
        submitting={submitting}
        submitLabel="Simpan Akun"
        error={submitError}
      >
        <FormField
          label="Nama Lengkap"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <FormField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <FormField
          label="Role Pengguna"
          type="select"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          options={[
            { label: 'Author (Penulis)', value: 'author' },
            { label: 'Admin', value: 'admin' }
          ]}
          required
        />
        <FormField
          label={editingAccount ? 'Password Baru (Opsional)' : 'Password'}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!editingAccount}
          minLength={6}
          autoComplete="new-password"
          placeholder={editingAccount ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
        />

        {editingAccount && editingAccount.id === user.id && (form.password || form.role !== user.role) && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.75rem', borderRadius: '4px', color: '#f59e0b', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <strong>Perhatian:</strong> Mengubah password atau role Anda sendiri akan membuat Anda keluar (logout) otomatis.
          </div>
        )}
      </ModalForm>
    </div>
  );
};
