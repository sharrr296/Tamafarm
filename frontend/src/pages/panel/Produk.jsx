import { useState } from 'react'
import { PageHeader } from './PanelLayout'
import { ProductImage } from '../../components/ProductCard'
import { Button, ConfirmDialog, Empty, ErrorNote, Modal, Select, Spinner, TextArea, TextField } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { api } from '../../lib/api'
import { qty, rupiah } from '../../lib/format'
import { useFetch } from '../../lib/useFetch'

const FIELDS = ['id_kategori', 'nama_produk', 'satuan', 'deskripsi', 'ukuran', 'harga', 'harga_usd', 'stok', 'moq_restoran', 'moq_luar_negeri']

const initial = (item) =>
  Object.fromEntries(FIELDS.map((k) => [k, item ? (item[k] ?? '') : k === 'satuan' ? 'kg' : '']))

function ProdukForm({ item, kategori, onSaved, onCancel }) {
  const toast = useToast()
  const [f, setF] = useState(() => initial(item))
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(item?.gambar_url || null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isKg = f.satuan === 'kg'
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const err = (k) => errors[k]?.[0]

  function pickFile(e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const fd = new FormData()
    const keys = ['id_kategori', 'nama_produk', 'satuan', 'deskripsi', 'ukuran', 'harga', 'stok']
    if (isKg) keys.push('harga_usd', 'moq_restoran', 'moq_luar_negeri')
    keys.forEach((k) => fd.append(k, f[k] ?? ''))
    if (file) fd.append('gambar', file)

    try {
      let res
      if (item) {
        fd.append('_method', 'PUT')
        res = await api.postForm(`/produk/${item.id_produk}`, fd)
      } else {
        res = await api.postForm('/produk', fd)
      }
      toast(res.message || 'Produk disimpan')
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Kategori" value={f.id_kategori} onChange={set('id_kategori')} error={err('id_kategori')} required>
          <option value="">Pilih kategori</option>
          {kategori.map((k) => (
            <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>
          ))}
        </Select>
        <Select label="Satuan" value={f.satuan} onChange={set('satuan')} error={err('satuan')}>
          <option value="kg">Per kg (lobster hidup)</option>
          <option value="paket">Paket (kemitraan)</option>
        </Select>
      </div>

      <TextField label="Nama produk" value={f.nama_produk} onChange={set('nama_produk')} error={err('nama_produk')} maxLength={100} required />
      <TextField label="Ukuran" value={f.ukuran} onChange={set('ukuran')} error={err('ukuran')} maxLength={50} hint="Contoh: 200-300 gram per ekor" />
      <TextArea label="Deskripsi" value={f.deskripsi} onChange={set('deskripsi')} error={err('deskripsi')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Harga (Rp)" type="number" min="0" step="1" value={f.harga} onChange={set('harga')} error={err('harga')} required />
        <TextField label="Stok" type="number" min="0" step="0.01" value={f.stok} onChange={set('stok')} error={err('stok')} required />
      </div>

      {isKg && (
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Harga (USD)" type="number" min="0" step="0.01" value={f.harga_usd} onChange={set('harga_usd')} error={err('harga_usd')} hint="Opsional" />
          <TextField label="Min. order restoran (kg)" type="number" min="1" step="0.01" value={f.moq_restoran} onChange={set('moq_restoran')} error={err('moq_restoran')} required />
          <TextField label="Min. order luar negeri (kg)" type="number" min="1" step="0.01" value={f.moq_luar_negeri} onChange={set('moq_luar_negeri')} error={err('moq_luar_negeri')} required />
        </div>
      )}

      <div>
        <p className="text-sm font-semibold">Foto produk</p>
        <div className="mt-2 flex items-center gap-4">
          {preview ? (
            <img src={preview} alt="Pratinjau foto" className="h-20 w-28 rounded-md object-cover" />
          ) : (
            <div className="flex h-20 w-28 items-center justify-center rounded-md bg-sand text-xs text-tank/50">Belum ada</div>
          )}
          <div>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="text-sm" />
            <p className="mt-1 text-xs text-tank/60">JPG, PNG, atau WebP, maksimal 2 MB.{item && ' Kosongkan untuk mempertahankan foto lama.'}</p>
            {err('gambar') && <p className="mt-1 text-xs font-medium text-shell-dark">{err('gambar')}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan produk'}</Button>
      </div>
    </form>
  )
}

export default function Produk() {
  const toast = useToast()
  const produk = useFetch('/produk')
  const kategori = useFetch('/kategori')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // null | 'baru' | item
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const list = (produk.data || []).filter((p) => p.nama_produk.toLowerCase().includes(q.trim().toLowerCase()))
  const noKategori = kategori.data && kategori.data.length === 0

  async function hapus() {
    setBusy(true)
    try {
      const res = await api.del(`/produk/${deleting.id_produk}`)
      toast(res.message || 'Produk dihapus')
      setDeleting(null)
      produk.reload()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Produk"
        action={<Button onClick={() => setEditing('baru')} disabled={noKategori || !kategori.data}>Tambah produk</Button>}
      />

      {noKategori && (
        <div className="mb-6"><Empty title="Buat kategori dulu">Produk harus punya kategori. Tambahkan lewat menu Kategori.</Empty></div>
      )}

      {produk.loading ? (
        <Spinner />
      ) : produk.error ? (
        <ErrorNote message={produk.error} onRetry={produk.reload} />
      ) : (
        <>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama produk"
            aria-label="Cari nama produk"
            className="mb-4 w-full rounded-md border border-mist bg-white px-3 py-2 text-sm sm:w-72"
          />
          {list.length === 0 ? (
            <Empty title={produk.data.length ? 'Tidak ada produk yang cocok' : 'Belum ada produk'} />
          ) : (
            <div className="overflow-x-auto rounded-md border border-mist bg-white">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-mist bg-mist/40 text-xs text-tank/70">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Produk</th>
                    <th className="px-4 py-3 font-semibold">Kategori</th>
                    <th className="px-4 py-3 text-right font-semibold">Harga</th>
                    <th className="px-4 py-3 text-right font-semibold">Stok</th>
                    <th className="px-4 py-3"><span className="sr-only">Aksi</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  {list.map((p) => (
                    <tr key={p.id_produk}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage produk={p} className="h-12 w-16 shrink-0 rounded text-[10px]" />
                          <div>
                            <p className="font-semibold">{p.nama_produk}</p>
                            {p.ukuran && <p className="text-xs text-tank/60">{p.ukuran}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.kategori?.nama_kategori}</td>
                      <td className="px-4 py-3 text-right">{rupiah(p.harga)} / {p.satuan}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${Number(p.stok) <= 0 ? 'text-shell-dark' : ''}`}>
                        {Number(p.stok) <= 0 ? 'Habis' : `${qty(p.stok)} ${p.satuan}`}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button onClick={() => setEditing(p)} className="font-semibold underline underline-offset-4">Ubah</button>
                        <button onClick={() => setDeleting(p)} className="ml-4 font-semibold text-shell-dark underline underline-offset-4">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && editing !== 'baru' ? 'Ubah produk' : 'Tambah produk'} wide>
        {editing && (
          <ProdukForm
            item={editing === 'baru' ? null : editing}
            kategori={kategori.data || []}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              produk.reload()
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Hapus produk?"
        message={deleting && `${deleting.nama_produk} akan dihapus permanen beserta fotonya.`}
        busy={busy}
        onConfirm={hapus}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
