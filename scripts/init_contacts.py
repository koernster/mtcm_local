#!/usr/bin/env python3
"""Create sample contacts.xlsx for local dev"""
import sys
try:
    import openpyxl
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openpyxl", "-q"])
    import openpyxl

from openpyxl import Workbook
from datetime import datetime

wb = Workbook()
ws = wb.active
ws.title = "Sheet1"

headers = [
    "ID de registro", "Nombre", "Apellidos", "Fecha de creación",
    "Correo", "Número de teléfono", "Respuesta LinkedIn Positiva",
    "Estado del lead", "Estado del contacto de marketing",
    "Primer sitio referente", "Primera página vista",
    "Fuente original de tráfico",
    "Análisis detallado 1 de la fuente de tráfico original",
    "Análisis detallado 2 de la fuente de tráfico original",
    "Fuente de tráfico más reciente",
    "Análisis detallado 1 de la fuente de tráfico más reciente",
    "Análisis detallado 2 de la fuente de tráfico más reciente",
    "Campaña Closely", "Propietario del contacto"
]
ws.append(headers)

rows = [
    ["6.89813E+11", "Nick", "Ritter", datetime(2026, 2, 9, 13, 45),
     "nick.ritter@mtcm.ch", None, None, "Nuevo", "Contacto de marketing",
     None, None, "Fuentes sin conexión", "CRM_UI", "Juan Somme",
     "Fuentes sin conexión", "CRM_UI", "Juan Somme", None, "Juan Somme"],
    ["6.82605E+11", "Pedro", "Cañas", datetime(2026, 2, 6, 14, 55),
     "pcanas@cordobainternational.co", None, None, "Nuevo",
     "Contacto de marketing", None, None, "Fuentes sin conexión",
     "CRM_UI", "Juan Somme", "Fuentes sin conexión", "CRM_UI",
     "Juan Somme", None, "Juan Somme"],
]

for row in rows:
    ws.append(row)

import os
out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "..", "services", "hubspot-function", "data", "contacts.xlsx")
wb.save(out)
print(f"Created {out} with {len(rows)} contacts")
