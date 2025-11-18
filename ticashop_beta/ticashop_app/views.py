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
        if usuario.rol not in ['admin', 'soporte', 'tecnico', 'especialista']:
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
        queryset = self.queryset
        usuario_id = self.request.query_params.get('idUsuario', None)
        if usuario_id:
            queryset = queryset.filter(idUsuario_id=usuario_id)
        tecnico_id = self.request.query_params.get('idTecnico', None)
        if tecnico_id:
            queryset = queryset.filter(idTecnico_id=tecnico_id)
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado__icontains=estado)
        return queryset.order_by('-fecha_creacion')

    def create(self, request, *args, **kwargs):
        """
        Crear ticket: solo 'soporte' y 'admin' pueden crear (según tu regla).
        Si usuario soporte crea, por defecto idUsuario (creador) = soporte (esto
        sigue tu comentario anterior donde soporte puede crear tickets).
        """
        usuario = _get_user_from_token(request)
        if not usuario:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

        if usuario.rol not in ['soporte', 'admin']:
            return Response({'error': 'No tienes permiso para crear tickets'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        # Si no envían idUsuario_id, asignar al creador (soporte)
        if not data.get('idUsuario_id'):
            data['idUsuario_id'] = usuario.id
        # Prioridad por defecto si no viene
        if not data.get('prioridad'):
            data['prioridad'] = 'media'
        if not data.get('estado'):
            data['estado'] = 'Abierto'

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        ticket = self.get_object()
        usuario = _get_user_from_token(request)
        if not usuario:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        # Admin puede borrar todo. Soporte sólo puede borrar tickets que él creó (idUsuario)
        if usuario.rol == 'admin':
            return super().destroy(request, *args, **kwargs)
        if usuario.rol == 'soporte' and ticket.idUsuario_id == usuario.id:
            return super().destroy(request, *args, **kwargs)
        return Response({'error': 'No tienes permiso para eliminar este ticket'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['patch'])
    def cerrar(self, request, pk=None):
        ticket = self.get_object()
        ticket.estado = 'Cerrado'
        from datetime import datetime
        ticket.fecha_cierre = datetime.now()
        ticket.save()
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def asignar_tecnico(self, request, pk=None):
        """
        Asignar tecnico a un ticket. 
        Reglas: 
        - 'admin' puede asignar a cualquiera sin restricciones
        - 'especialista' puede asignar tickets a usuarios de soporte
        - 'soporte' solo puede auto-asignarse
        """
        ticket = self.get_object()
        usuario = _get_user_from_token(request)
        if not usuario:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

        tecnico_id = request.data.get('idTecnico')
        if not tecnico_id:
            return Response({'error': 'idTecnico requerido'}, status=status.HTTP_400_BAD_REQUEST)

        # Permitir que admins, especialistas y soporte asignen tickets
        if usuario.rol not in ['admin', 'soporte', 'especialista']:
            return Response({'error': 'No tienes permisos para asignar técnicos'}, status=status.HTTP_403_FORBIDDEN)

        # Verificar que el técnico a asignar existe
        try:
            tecnico = Usuario.objects.get(id=tecnico_id)
        except Usuario.DoesNotExist:
            return Response({'error': 'El técnico especificado no existe'}, status=status.HTTP_404_NOT_FOUND)

        # Validaciones según el rol
        if usuario.rol == 'admin':
            # ✅ Admin puede asignar a cualquiera sin restricciones
            pass
        
        elif usuario.rol == 'soporte':
            # Soporte solo puede auto-asignarse
            if int(tecnico_id) != usuario.id:
                return Response({'error': 'Soporte solo puede auto-asignarse a sí mismo'}, status=status.HTTP_403_FORBIDDEN)
        
        elif usuario.rol == 'especialista':
            # Especialista solo puede asignar a usuarios con rol "soporte"
            if tecnico.rol != 'soporte':
                return Response({'error': 'Especialista solo puede asignar tickets a usuarios de soporte'}, status=status.HTTP_403_FORBIDDEN)

        ticket.idTecnico_id = tecnico_id
        ticket.save()
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    @action(detail=True, methods=['patch'])
    def escalar_prioridad(self, request, pk=None):
        """
        Incrementa la prioridad: media -> alta -> urgente.
        Solo 'soporte' o 'admin' pueden ejecutar.
        """
        ticket = self.get_object()
        usuario = _get_user_from_token(request)
        if not usuario:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        if usuario.rol not in ['admin', 'soporte']:
            return Response({'error': 'No tienes permiso para escalar prioridad'}, status=status.HTTP_403_FORBIDDEN)

        current = (ticket.prioridad or 'media').lower()
        order = ['baja', 'media', 'alta', 'urgente']
        try:
            idx = order.index(current) if current in order else 1
        except ValueError:
            idx = 1
        new_idx = min(len(order)-1, idx+1)
        ticket.prioridad = order[new_idx]
        ticket.save()
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)

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

def _get_user_from_token(request):
    """
    Helper simple para extraer Usuario desde header Authorization: Bearer token_{id}_{correo}
    (Coincide con el esquema simple que ya usas en login_view).
    Devuelve instancia Usuario o None.
    """
    auth = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
    if not auth:
        return None
    if auth.lower().startswith('bearer '):
        token = auth.split(' ', 1)[1]
    else:
        token = auth
    # token esperado: token_{id}_{correo}
    parts = token.split('_')
    if len(parts) < 3:
        return None
    try:
        user_id = int(parts[1])
        return Usuario.objects.filter(id=user_id).first()
    except Exception:
        return None
    
def getPermissionsByRole(rol):
    permissions_map = {
        'admin': ['tickets', 'licitaciones', 'reportes', 'admin'],
        'especialista': ['tickets', 'licitaciones', 'reportes', 'usuarios-soporte'],
        'soporte': ['tickets', 'licitaciones', 'reportes'],
        'tecnico': ['tickets', 'reportes']
    }
    return permissions_map.get(rol, ['tickets'])

class comentarioView(viewsets.ModelViewSet):
    serializer_class = ComentarioSerializer
    queryset = Comentario.objects.all().select_related('usuario', 'ticket')

    def get_queryset(self):
        queryset = self.queryset
        ticket_id = self.request.query_params.get('ticket', None)
        if ticket_id:
            queryset = queryset.filter(ticket_id=ticket_id)
        return queryset.order_by('-fecha')

    def create(self, request, *args, **kwargs):
        # Identificar usuario desde token
        usuario = _get_user_from_token(request)
        if not usuario:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data.copy()
        data['usuario_id'] = usuario.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        comentario = self.get_object()
        usuario = _get_user_from_token(request)
        if not usuario:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        # Permitir borrar si es admin o autor del comentario
        if usuario.rol != 'admin' and comentario.usuario_id != usuario.id:
            return Response({'error': 'No tienes permiso para eliminar este comentario'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
