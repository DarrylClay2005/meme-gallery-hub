import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL

function getToken() { return localStorage.getItem('memehub_token') }

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['myMemes'],
    queryFn: async () => (await axios.get(`${API}/memes/user`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })).data,
  })

  if (isLoading) return <p>Loading...</p>

  return (
    <div>
      <h1 className="text-xl mb-4">My Uploads</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.map((m: any) => (
          <div key={m.id} className="border rounded overflow-hidden">
            <img src={m.s3Url} alt={m.title} className="w-full aspect-square object-cover" draggable={false} onContextMenu={(e)=>e.preventDefault()} />
            <div className="p-2 text-sm">{m.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
