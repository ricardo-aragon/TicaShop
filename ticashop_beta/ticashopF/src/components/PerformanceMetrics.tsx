export default function PerformanceMetrics() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Rendimiento</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tiempo Promedio de Respuesta</span>
          <span className="font-bold text-blue-600">2.5h</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tasa de Resolución</span>
          <span className="font-bold text-green-600">87%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Satisfacción del Cliente</span>
          <span className="font-bold text-yellow-600">4.6/5</span>
        </div>
      </div>
    </div>
  );
}
