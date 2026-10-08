import { useState } from 'react'
import { PageHeader } from './PanelLayout'
import { Button, ConfirmDialog, Empty, ErrorNote, Modal, Spinner, TextArea, TextField } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { api } from '../../lib/api'
import { useFetch } from '../../lib/useFetch'

function KategoriForm({ item, onSaved, onCancel }) {
  const toast = useToast()
  const [nama, setNama] = useState(item?.nama_kategori || '')
  const [deskripsi, setDeskripsi] = useState(item?.deskripsi || '')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const body = { nama_kategori: nama, deskripsi: deskripsi || null }
    try {
      const res = item ? await api.put(`/kategori/${item.id_kategori}`, body) : await api.post('/kategori', body)
      toast(res.message || 'Kategori disimpan')
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
      <TextField label="Nama kategori" value={nama} onChange={(e) => setNama(e.target.value)} error={errors.nama_kategori?.[0]} maxLength={100} autoFocus required />
      <TextArea label="Deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} error={errors.deskripsi?.[0]} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan kategori'}</Button>
      </div>
    </form>
  )
}

export default function Kategori() {
  const toast = useToast()
  const { data, loading, error, reload } = useFetch('/kategori')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  async function hapus() {
    setBusy(true)
    try {
      const res = await api.del(`/kategori/${deleting.id_kategori}`)
      toast(res.message || 'Kategori dihapus')
      setDeleting(null)
      reload()
    } catch (e) {
      toast(e.message, 'error') // contoh: "Kategori masih memiliki produk"
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Kategori" action={<Button onClick={() => setEditing('baru')}>Tambah kategori</Button>} />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <Empty title="Belum ada kategori">Tambahkan kategori pertama, misalnya Lobster Hidup.</Empty>
      ) : (
        <ul className="divide-y divide-mist rounded-md border border-mist bg-white">
          {data.map((k) => (
            <li key={k.id_kategori} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold">{k.nama_kategori}</p>
                {k.deskripsi && <p className="truncate text-sm text-tank/65">{k.deskripsi}</p>}
              </div>
              <div className="whitespace-nowrap text-sm">
                <button onClick={() => setEditing(k)} className="font-semibold underline underline-offset-4">Ubah</button>
                <button onClick={() => setDeleting(k)} className="ml-4 font-semibold text-shell-dark underline underline-offset-4">Hapus</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'baru' ? 'Ubah kategori' : 'Tambah kategori'}>
        {editing && (
          <KategoriForm
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
        title="Hapus kategori?"
        message={deleting && `Kategori ${deleting.nama_kategori} akan dihapus. Kategori yang masih punya produk tidak bisa dihapus.`}
        busy={busy}
        onConfirm={hapus}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
