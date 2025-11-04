from django.shortcuts import render
from rest_framework import viewsets
from .serializer import *
from .models import *

# Create your views here.

class usuarioView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = Usuario.objects.all()

class ticketView(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    queryset = Ticket.objects.all()

class licitacionView(viewsets.ModelViewSet):
    serializer_class = LicitacionSerializer
    queryset = Licitacion.objects.all()

class reporteView(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    queryset = Reporte.objects.all()
