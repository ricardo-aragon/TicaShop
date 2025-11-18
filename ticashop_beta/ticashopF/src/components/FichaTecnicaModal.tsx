import { useState } from 'react';
import { Upload, X, Image, AlertTriangle, Camera, Tag, FileText, MapPin } from 'lucide-react';


interface FichaTecnicaModalProps {
  onClose: () => void;
  onSubmit: (fichaTecnica: FichaTecnica) => void;
}

export interface FichaTecnica {
  imagen: string; // Base64 o URL
  marca: string;
  modelo: string;
  descripcion: string;
  ubicacion: string;
}


const notify = (message: string, isError: boolean = false) => {
    if (isError) {
        console.error(`ERROR: ${message}`);
    } else {
        console.log(`INFO: ${message}`);
    }
};

export default function FichaTecnicaModal({ onClose, onSubmit }: FichaTecnicaModalProps) {
  const [formData, setFormData] = useState<FichaTecnica>({
    imagen: '',
    marca: '',
    modelo: '',
    descripcion: '',
    ubicacion: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('❌ La imagen no debe superar los 5MB.');
        e.target.value = '';
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrorMsg('❌ Solo se permiten archivos de imagen (PNG, JPG, GIF).');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imagen: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('❌ La imagen no debe superar los 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrorMsg('❌ Solo se permiten archivos de imagen (PNG, JPG, GIF).');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, imagen: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData({ ...formData, imagen: '' });
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imagen) {
      setErrorMsg('⚠️ Por favor, sube una imagen del producto antes de guardar.');
      return;
    }

    if (!formData.marca.trim() || !formData.modelo.trim() || 
        !formData.descripcion.trim() || !formData.ubicacion.trim()) {
      setErrorMsg('⚠️ Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await onSubmit(formData);
      notify('Ficha Técnica guardada con éxito.');
      onClose();
    } catch (error) {
      console.error('Error al enviar ficha técnica:', error);
      setErrorMsg('❌ Error al enviar la ficha técnica. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const InputStyle = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 outline-none bg-white";
  const LabelStyle = "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2";

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
        overflowY: 'auto',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          width: '100%',
          maxWidth: '56rem',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #9333ea, #4f46e5)',
          color: 'white',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          flexShrink: 0
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              margin: 0
            }}>
              <span style={{ fontSize: '2rem' }}>📋</span> 
              <span>Nueva Ficha Técnica</span>
            </h3>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginTop: '0.25rem',
              margin: '0.25rem 0 0 0'
            }}>
              Documenta el producto relacionado con el ticket de soporte
            </p>
          </div>
          <button 
            onClick={onClose}
            type="button"
            style={{
              color: 'white',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '9999px',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: '1rem',
              flexShrink: 0,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={22} /> 
          </button>
        </div>

        {/* Body*/}
        <div style={{
          maxHeight: 'calc(90vh - 220px)',
          overflowY: 'auto',
          padding: '2rem'
        }}>
          <div className="space-y-5">
            
            {/* Alerta de Error General */}
            {errorMsg && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3" role="alert">
                <AlertTriangle size={20} />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Sección de Imagen */}
            <div className="space-y-3">
              <label className={LabelStyle}>
                <Camera size={18} className="text-gray-600" />
                Imagen del Producto *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Sube una imagen clara del producto. Máximo 5MB.
              </p>

              {!imagePreview ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragActive 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-500 hover:bg-indigo-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={48} className="text-indigo-500 mb-3" />
                    <span className="text-sm font-bold text-gray-700 mb-1">
                      Arrastra y suelta o haz clic para subir
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Archivos JPG, PNG o GIF (Max 5MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover border-2 border-gray-200 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Eliminar imagen"
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-xl"
                  >
                    <X size={18} />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-lg">
                    ✓ Imagen cargada
                  </div>
                </div>
              )}
            </div>
            
            {/* Separador */}
            <hr className="border-gray-200" />

            {/* Grid de Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Marca */}
              <div>
                <label className={LabelStyle}>
                  <Tag size={18} className="text-gray-600" />
                  Marca del Producto *
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  required
                  className={InputStyle}
                  placeholder="Ej: Samsung, Apple, Sony..."
                />
              </div>

              {/* Modelo */}
              <div>
                <label className={LabelStyle}>
                  <FileText size={18} className="text-gray-600" />
                  Modelo *
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  required
                  className={InputStyle}
                  placeholder="Ej: Galaxy S21, iPhone 13 Pro..."
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className={LabelStyle}>
                <FileText size={18} className="text-gray-600" />
                Descripción del Producto *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
                rows={4}
                className={`${InputStyle} resize-none`}
                placeholder="Describe las características principales, especificaciones técnicas, problemas identificados, etc."
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {formData.descripcion.length} caracteres
              </p>
            </div>

            {/* Ubicación */}
            <div>
              <label className={LabelStyle}>
                <MapPin size={18} className="text-gray-600" />
                Dónde Encontrarlo *
              </label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                required
                className={InputStyle}
                placeholder="Ej: Bodega A, Estante 3, Tienda Principal, URL del producto..."
              />
            </div>

            {/* Previsualización */}
            {imagePreview && formData.marca && formData.modelo && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
                  <Image size={20} className="text-indigo-600" />
                  Vista Previa de la Ficha
                </h4>
                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
                  <div className="flex gap-4 items-start">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-base text-gray-900 truncate">
                        {formData.marca} - {formData.modelo}
                      </p>
                      {formData.descripcion && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {formData.descripcion}
                        </p>
                      )}
                      {formData.ubicacion && (
                        <p className="text-xs text-purple-600 mt-2 font-medium flex items-center gap-1">
                          <MapPin size={14} />
                          {formData.ubicacion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          backgroundColor: '#f9fafb',
          display: 'flex',
          gap: '0.75rem',
          flexShrink: 0,
          borderBottomLeftRadius: '1rem',
          borderBottomRightRadius: '1rem'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              color: '#374151',
              borderRadius: '0.75rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              backgroundColor: 'white',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.imagen}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: 'linear-gradient(to right, #4f46e5, #9333ea)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              cursor: (loading || !formData.imagen) ? 'not-allowed' : 'pointer',
              opacity: (loading || !formData.imagen) ? 0.5 : 1,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Guardando...
              </span>
            ) : (
              '✅ Guardar Ficha Técnica'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}