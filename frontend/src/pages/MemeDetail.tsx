import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const API = import.meta.env.VITE_API_BASE_URL

export default function MemeDetail() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['meme', id],
    queryFn: async () => (await axios.get(`${API}/memes/${id}`)).data,
    enabled: !!id
  })
  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>Not found</p>

  return (
    <div className="max-w-2xl mx-auto">
      <img src={data.s3Url} alt={data.title} className="w-full rounded" draggable={false} onContextMenu={(e)=>e.preventDefault()} />
      <h1 className="text-2xl mt-2">{data.title}</h1>
      <p className="text-sm text-gray-500">by {data.user?.username}</p>
      <p className="mt-2">{data.description}</p>
      <div className="mt-3 flex gap-2 flex-wrap">
        {data.tags?.map((t: any) => (
          <span key={t.tag.id} className="px-2 py-1 bg-gray-200 rounded text-xs">{t.tag.name}</span>
        ))}
      </div>
    </div>
  )
}
