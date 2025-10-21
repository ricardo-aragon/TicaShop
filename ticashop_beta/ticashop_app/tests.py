from django.test import TestCase

# Create your tests here.
from pymongo import MongoClient

client = MongoClient(
    host='localhost',
    port=27017,
    username='administrador',
    password='pollo123',
    authSource='admin',  # or 'tichashop_mongo'
    authMechanism='SCRAM-SHA-1'
)

db = client['tichashop_mongo']
print(db.list_collection_names())
