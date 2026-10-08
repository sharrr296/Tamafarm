import { useState } from 'react'
import { PageHeader } from './PanelLayout'
import { Button, ConfirmDialog, Empty, ErrorNote, Modal, Spinner, TextField } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { api } from '../../lib/api'
import { useFetch } from '../../lib/useFetch'

function AkunForm({ item, onSaved, onCancel }) {
  const toast = useToast()
  const [f, setF] = useState({ nama: item?.nama || '', username: item?.username || '', password: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const res = item ? await api.put(`/admin/${item.id_user}`, f) : await api.post('/admin', f)
      toast(res.message || 'Akun disimpan')
      onSaved()
    } catch (e2) {
      setErrors(e2.errors || {})
      toast(e2.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <TextField label="Nama" value={f.nama} onChange={set('nama')} error={errors.nama?.[0]} maxLength={100} autoFocus required />
      <TextField label="Username" value={f.username} onChange={set('username')} error={errors.username?.[0]} minLength={4} maxLength={30} hint="4 sampai 30 karakter: huruf, angka, strip, atau garis bawah" autoComplete="off" required />
      <TextField
        label="Password"
        type="password"
        value={f.password}
        onChange={set('password')}
        error={errors.password?.[0]}
        minLength={6}
        hint={item ? 'Kosongkan jika tidak ingin mengubah password' : 'Minimal 6 karakter'}
        autoComplete="new-password"
        required={!item}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan akun'}</Button>
      </div>
    </form>
  )
}

export default function Akun() {
  const toast = useToast()
  const { data, loading, error, reload } = useFetch('/admin')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  async function hapus() {
    setBusy(true)
    try {
      const res = await api.del(`/admin/${deleting.id_user}`)
      toast(res.message || 'Akun dihapus')
      setDeleting(null)
      reload()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Akun admin" action={<Button onClick={() => setEditing('baru')}>Tambah admin</Button>} />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <Empty title="Belum ada akun admin">Buat akun untuk orang yang akan mengelola produk dan kategori.</Empty>
      ) : (
        <ul className="divide-y divide-mist rounded-md border border-mist bg-white">
          {data.map((u) => (
            <li key={u.id_user} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-semibold">{u.nama}</p>
                <p className="text-sm text-tank/65">{u.username}</p>
              </div>
              <div className="whitespace-nowrap text-sm">
                <button onClick={() => setEditing(u)} className="font-semibold underline underline-offset-4">Ubah</button>
                <button onClick={() => setDeleting(u)} className="ml-4 font-semibold text-shell-dark underline underline-offset-4">Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'baru' ? 'Ubah akun admin' : 'Tambah akun admin'}>
        {editing && (
          <AkunForm
            item={editing === 'baru' ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              reload()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus akun admin?"
        message={deleting && `Akun ${deleting.username} akan dihapus dan langsung keluar dari semua perangkat.`}
        busy={busy}
        onConfirm={hapus}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
