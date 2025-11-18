from rest_framework import serializers
from .models import Usuario, Ticket, Licitacion, Reporte, Comentario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class UsuarioBasicoSerializer(serializers.ModelSerializer):
    """Serializer simplificado para relaciones"""
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'correo', 'rol']

class ComentarioSerializer(serializers.ModelSerializer):
    usuario = UsuarioBasicoSerializer(read_only=True)
    usuario_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Comentario
        fields = ['id', 'ticket', 'texto', 'fecha', 'usuario', 'usuario_id', 'fichaTecnica']
        read_only_fields = ['id', 'fecha', 'usuario']

    def create(self, validated_data):
        usuario_id = validated_data.pop('usuario_id', None)
        if usuario_id:
            validated_data['usuario_id'] = usuario_id
        return super().create(validated_data)

class TicketSerializer(serializers.ModelSerializer):
    # Incluir datos relacionados del usuario y técnico
    idUsuario = UsuarioBasicoSerializer(read_only=True)
    idTecnico = UsuarioBasicoSerializer(read_only=True)
    
    # Para escritura, aceptar solo IDs
    idUsuario_id = serializers.IntegerField(write_only=True, required=False)
    idTecnico_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Ticket
        fields = '__all__'
    
    def create(self, validated_data):
        # Manejar IDs de usuario y técnico
        usuario_id = validated_data.pop('idUsuario_id', None)
        tecnico_id = validated_data.pop('idTecnico_id', None)
        idUsuario_id = serializers.IntegerField(write_only=True, required=False)
        idTecnico_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
        comentarios = ComentarioSerializer(many=True, read_only=True)
        
        if usuario_id:
            validated_data['idUsuario_id'] = usuario_id
        if tecnico_id:
            validated_data['idTecnico_id'] = tecnico_id
            
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Manejar IDs de usuario y técnico
        usuario_id = validated_data.pop('idUsuario_id', None)
        tecnico_id = validated_data.pop('idTecnico_id', None)
        
        if usuario_id:
            validated_data['idUsuario_id'] = usuario_id
        if tecnico_id is not None:
            validated_data['idTecnico_id'] = tecnico_id
            
        return super().update(instance, validated_data)

class LicitacionSerializer(serializers.ModelSerializer):
    idUsuario = UsuarioBasicoSerializer(read_only=True)
    idUsuario_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Licitacion
        fields = '__all__'
    
    def create(self, validated_data):
        usuario_id = validated_data.pop('idUsuario_id', None)
        if usuario_id:
            validated_data['idUsuario_id'] = usuario_id
        return super().create(validated_data)

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = '__all__'

# Mantener compatibilidad con nombres antiguos
UserSerializer = UsuarioSerializer
ReportSerializer = ReporteSerializer