from django.db import models

# Create your models here.

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    correo = models.TextField()
    telefono = models.CharField(max_length=12)
    run = models.CharField(max_length=10)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
