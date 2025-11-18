from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from ticashop_app import views

router = routers.DefaultRouter()
router.register(r'Usuario', views.usuarioView, 'usuario')
router.register(r'Ticket', views.ticketView, 'ticket')
router.register(r'Licitacion', views.licitacionView, 'licitacion')
router.register(r'Reporte', views.reporteView, 'reporte')
router.register(r'Comentario', views.comentarioView, 'comentario')


urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('api/v1/auth/login/', views.login_view, name='login'),
    path('docs/', include_docs_urls(title='ticashop API', public=True))
]