from rest_framework import serializers
from .models import Usuario, Ticket, Licitacion, Reporte

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'

class LicitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Licitacion
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = '__all__'