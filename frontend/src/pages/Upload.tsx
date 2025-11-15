import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL

function getToken() { return localStorage.getItem('memehub_token') }

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [tags, setTags] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setMsg('Pick an image')
    const form = new FormData()
    form.append('image', file)
    form.append('title', title)
    form.append('description', description)
    form.append('isPublic', String(isPublic))
    form.append('tags', tags)
    const { data } = await axios.post(`${API}/memes`, form, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    setMsg(`Uploaded: ${data.title}`)
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl mb-4">Upload Meme</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <input value={title} onChange={e=>setTitle(e.target.value)} className="border p-2 rounded" placeholder="Title" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="border p-2 rounded" placeholder="Description" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} /> Public</label>
        <input value={tags} onChange={e=>setTags(e.target.value)} className="border p-2 rounded" placeholder="Tags (comma separated)" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Upload</button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  )
}
