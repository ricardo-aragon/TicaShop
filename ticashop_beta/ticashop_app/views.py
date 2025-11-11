from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .serializer import *
from .models import *

@api_view(['POST'])
def login_view(request):
    """
    Endpoint de login seguro
    """
    correo = request.data.get('username')  # En el frontend se envía como username
    password = request.data.get('password')
    
    if not correo or not password:
        return Response(
            {'error': 'Correo y contraseña son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Buscar usuario por correo
        usuario = Usuario.objects.get(correo=correo)
        
        # Verificar contraseña (usa check_password si hasheas las contraseñas)
        # Por ahora comparación directa
        if usuario.password != password:
            return Response(
                {'error': 'Contraseña incorrecta'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar que tenga permisos de acceso
        if usuario.rol not in ['admin', 'soporte', 'tecnico']:
            return Response(
                {'error': 'No tienes permisos de acceso al sistema'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Login exitoso
        serializer = UsuarioSerializer(usuario)
        
        # Generar token simple (deberías usar JWT en producción)
        token = f"token_{usuario.id}_{usuario.correo}"
        
        return Response({
            'user': serializer.data,
            'token': token,
            'message': 'Login exitoso'
        }, status=status.HTTP_200_OK)
        
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class usuarioView(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    queryset = Usuario.objects.all()
    
    @action(detail=False, methods=['get'])
    def by_correo(self, request):
        """Buscar usuario por correo"""
        correo = request.query_params.get('correo', None)
        if correo:
            usuarios = self.queryset.filter(correo=correo)
            serializer = self.get_serializer(usuarios, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=False, methods=['get'])
    def by_rol(self, request):
        """Buscar usuarios por rol"""
        rol = request.query_params.get('rol', None)
        if rol:
            usuarios = self.queryset.filter(rol=rol)
            serializer = self.get_serializer(usuarios, many=True)
            return Response(serializer.data)
        return Response([])

class ticketView(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all().select_related('idUsuario', 'idTecnico')
    
    def get_queryset(self):
        """Permitir filtrado por query params"""
        queryset = self.queryset
        
        # Filtrar por usuario
        usuario_id = self.request.query_params.get('idUsuario', None)
        if usuario_id:
            queryset = queryset.filter(idUsuario_id=usuario_id)
        
        # Filtrar por técnico
        tecnico_id = self.request.query_params.get('idTecnico', None)
        if tecnico_id:
            queryset = queryset.filter(idTecnico_id=tecnico_id)
        
        # Filtrar por estado
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado__icontains=estado)
        
        return queryset.order_by('-fecha_creacion')
    
    @action(detail=True, methods=['patch'])
    def cerrar(self, request, pk=None):
        """Cerrar un ticket"""
        ticket = self.get_object()
        ticket.estado = 'Cerrado'
        from datetime import datetime
        ticket.fecha_cierre = datetime.now()
        ticket.save()
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def asignar_tecnico(self, request, pk=None):
        """Asignar técnico a un ticket"""
        ticket = self.get_object()
        tecnico_id = request.data.get('idTecnico')
        if tecnico_id:
            ticket.idTecnico_id = tecnico_id
            ticket.save()
            serializer = self.get_serializer(ticket)
            return Response(serializer.data)
        return Response({'error': 'idTecnico requerido'}, status=status.HTTP_400_BAD_REQUEST)

class licitacionView(viewsets.ModelViewSet):
    serializer_class = LicitacionSerializer
    queryset = Licitacion.objects.all().select_related('idUsuario')
    
    def get_queryset(self):
        """Permitir filtrado por query params"""
        queryset = self.queryset
        
        # Filtrar por usuario
        usuario_id = self.request.query_params.get('idUsuario', None)
        if usuario_id:
            queryset = queryset.filter(idUsuario_id=usuario_id)
        
        # Filtrar por estado
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado__icontains=estado)
        
        return queryset.order_by('-fecha_creacion')

class reporteView(viewsets.ModelViewSet):
    serializer_class = ReporteSerializer
    queryset = Reporte.objects.all()
    
    def get_queryset(self):
        """Permitir filtrado y ordenamiento"""
        queryset = self.queryset
        
        # Filtrar por fecha
        fecha = self.request.query_params.get('fecha', None)
        if fecha:
            queryset = queryset.filter(fecha=fecha)
        
        # Ordenar
        ordering = self.request.query_params.get('ordering', '-fecha')
        queryset = queryset.order_by(ordering)
        
        # Limitar resultados
        limit = self.request.query_params.get('limit', None)
        if limit:
            queryset = queryset[:int(limit)]
        
        return queryset
