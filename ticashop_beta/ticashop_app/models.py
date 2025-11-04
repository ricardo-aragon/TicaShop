from django.db import models

# Create your models here.

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correo = models.CharField(max_length=100)
    rol = models.CharField(max_length=100)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

class Ticket(models.Model):
    idUsuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='tickets_creados')
    idTecnico = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='tickets_asignados', null=True, blank=True)
    desc = models.TextField()
    estado = models.CharField(max_length=100)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.desc
    
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
        return self.desc
    
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