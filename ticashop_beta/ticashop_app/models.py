# models.py - Actualizado

from django.db import models

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correo = models.CharField(max_length=100)
    # Roles: admin, soporte, especialista, tecnico
    rol = models.CharField(max_length=100)
    password = models.CharField(max_length=158)

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.rol})"
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

class Ticket(models.Model):
    idUsuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='tickets_creados')
    idTecnico = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='tickets_asignados', null=True, blank=True)
    
    # Información del cliente reportante
    nombre_cliente = models.CharField(max_length=200, default='Cliente')
    email_cliente = models.EmailField(max_length=200, default='cliente@ejemplo.com')
    
    # Información del ticket
    titulo = models.CharField(max_length=200, default='Ticket')
    desc = models.TextField()
    categoria = models.CharField(max_length=100, default='technical')
    prioridad = models.CharField(max_length=50, default='media')
    estado = models.CharField(max_length=100)
    
    # Fechas
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.titulo} - {self.nombre_cliente}"
    
    class Meta:
        verbose_name = 'Ticket'
        verbose_name_plural = 'Tickets'

class Licitacion(models.Model):
    idUsuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    desc = models.TextField()
    propuesta = models.TextField()
    estado = models.CharField(max_length=100)
    fecha_creacion = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.desc[:50]
    
    class Meta:
        verbose_name = 'Licitacion'
        verbose_name_plural = 'Licitaciones'

class Reporte(models.Model):
    idReporte = models.AutoField(primary_key=True)
    fecha = models.DateField(auto_now_add=True)
    ticketsAbiertos = models.IntegerField()
    ticketsCerrados = models.IntegerField()
    tiempoProResolucion = models.FloatField()

    def __str__(self):
        return f"reporte {self.idReporte} - {self.fecha}"
    
    class Meta:
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'

class Comentario(models.Model):
    ticket = models.ForeignKey('Ticket', on_delete=models.CASCADE, related_name='comentarios')
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE, related_name='comentarios')
    texto = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    
    # ✨ NUEVO: Campo para ficha técnica (JSON)
    fichaTecnica = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Comentario {self.id} by {self.usuario.nombre} on Ticket {self.ticket.id}"

    class Meta:
        verbose_name = 'Comentario'
        verbose_name_plural = 'Comentarios'