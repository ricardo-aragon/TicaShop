import { useEffect, useState } from 'react';
import { FileText, Trash2, Plus } from 'lucide-react';
import { getComentariosPorTicket, createComentario, deleteComentario } from '../api/api';
import FichaTecnicaModal, { FichaTecnica } from './FichaTecnicaModal';

interface Comentario {
  id: number;
  ticket: number;
  texto: string;
  fecha: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    rol: string;
  } | null;
  fichaTecnica?: FichaTecnica | null;
}

export default function CommentsPanelEspecialista({ 
  ticketId, 
  onNewComment,
  userRole 
}: { 
  ticketId: number; 
  onNewComment?: () => void;
  userRole?: string;
}) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFichaTecnicaModal, setShowFichaTecnicaModal] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await getComentariosPorTicket(ticketId);
      // Parsear fichaTecnica si viene como string JSON
      const comentariosConFicha = res.data.map((c: any) => ({
        ...c,
        fichaTecnica: c.fichaTecnica ? (typeof c.fichaTecnica === 'string' ? JSON.parse(c.fichaTecnica) : c.fichaTecnica) : null
      }));
      setComentarios(comentariosConFicha);
    } catch (err) {
      console.error('Error cargando comentarios', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) cargar();
  }, [ticketId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    try {
      await createComentario({ ticket: ticketId, texto });
      setTexto('');
      await cargar();
      if (onNewComment) onNewComment();
    } catch (err: any) {
      console.error('Error creando comentario', err);
      alert(err.response?.data?.error || 'Error creando comentario');
    }
  };

  const handleCreateWithFicha = async (fichaTecnica: FichaTecnica) => {
    try {
      const comentarioConFicha = {
        ticket: ticketId,
        texto: `📋 FICHA TÉCNICA: ${fichaTecnica.marca} - ${fichaTecnica.modelo}`,
        fichaTecnica: JSON.stringify(fichaTecnica)
      };
      await createComentario(comentarioConFicha);
      setShowFichaTecnicaModal(false);
      await cargar();
      if (onNewComment) onNewComment();
    } catch (err: any) {
      console.error('Error creando ficha técnica', err);
      alert(err.response?.data?.error || 'Error creando ficha técnica');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar comentario?')) return;
    try {
      await deleteComentario(id);
      await cargar();
    } catch (err) {
      console.error('Error eliminando comentario', err);
      alert('No se pudo eliminar el comentario');
    }
  };

  const isEspecialista = userRole === 'especialista';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">Comentarios</h4>
        {isEspecialista && (
          <button
            onClick={() => setShowFichaTecnicaModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md"
          >
            <Plus size={16} />
            Ficha Técnica
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto mb-3">
        {loading && <div className="text-center py-4">Cargando comentarios...</div>}
        {!loading && comentarios.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">Aún no hay comentarios.</div>
        )}
        {comentarios.map(c => (
          <div key={c.id} className={`border rounded-lg p-4 ${c.fichaTecnica ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <span>{c.usuario ? `${c.usuario.nombre} ${c.usuario.apellido}` : 'Usuario desconocido'}</span>
                  {c.fichaTecnica && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                      FICHA TÉCNICA
                    </span>
                  )}
                  <span className="text-xs text-gray-500">({c.usuario?.rol || '—'})</span>
                </div>
                <div className="text-xs text-gray-400">{new Date(c.fecha).toLocaleString()}</div>
              </div>
              <button 
                onClick={() => handleDelete(c.id)} 
                className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {c.fichaTecnica ? (
              // Renderizar Ficha Técnica
              <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-200">
                <div className="flex gap-4">
                  <img 
                    src={c.fichaTecnica.imagen} 
                    alt={c.fichaTecnica.modelo}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-200"
                  />
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-800 text-lg mb-2">
                      {c.fichaTecnica.marca} - {c.fichaTecnica.modelo}
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">{c.fichaTecnica.descripcion}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                        📍 {c.fichaTecnica.ubicacion}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Renderizar comentario normal
              <div className="mt-2 text-sm text-gray-700">{c.texto}</div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="space-y-2">
        <textarea
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          placeholder="Escribe un comentario..."
        />
        <div className="flex gap-2">
          <button 
            type="submit" 
            className="px-4 py-2 bg-purple-600 text-white border rounded-lg hover:bg-purple-700 transition-colors"
          >
            Agregar
          </button>
          <button 
            type="button" 
            onClick={() => setTexto('')} 
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </form>

      {showFichaTecnicaModal && (
        <FichaTecnicaModal
          onClose={() => setShowFichaTecnicaModal(false)}
          onSubmit={handleCreateWithFicha}
        />
      )}
    </div>
  );
}