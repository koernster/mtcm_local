"""
Excel-based contact provider — fallback when HubSpot API is unavailable.

Reads contacts from an Excel file (HubSpot export format) and serves them
through the same interface as the live HubSpot API.

Column mapping (Spanish HubSpot export → HubSpot API format):
  - "ID de registro"      → id / hs_object_id
  - "Nombre"              → firstname
  - "Apellidos"           → lastname
  - "Fecha de creación"   → createdate / createdAt
  - "Correo"              → email
  - "Número de teléfono"  → phone
  - "Propietario del contacto" → hubspot_owner_id (as display name)
"""

import os
import logging
from typing import List, Dict, Optional
from datetime import datetime

import openpyxl

logger = logging.getLogger(__name__)

# ── Column mapping: Spanish HubSpot export → internal field names ────────────
COLUMN_MAP = {
    "ID de registro": "id",
    "Nombre": "firstname",
    "Apellidos": "lastname",
    "Fecha de creación": "createdate",
    "Correo": "email",
    "Número de teléfono": "phone",
    "Estado del lead": "hs_lead_status",
    "Propietario del contacto": "hubspot_owner_id",
}


def _normalise_value(value) -> str:
    """Convert cell value to a JSON-safe string."""
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.isoformat() + "Z"
    return str(value).strip()


def _row_to_hubspot_contact(row: Dict[str, str], index: int) -> Dict:
    """
    Convert a mapped row dict into the HubSpot contact JSON shape
    expected by the frontend (HubSpotContact interface).
    """
    contact_id = row.get("id", "").replace(".", "").replace("E+", "")
    if not contact_id:
        contact_id = str(10000 + index)

    created = row.get("createdate", "")

    return {
        "id": contact_id,
        "properties": {
            "createdate": created,
            "email": row.get("email", ""),
            "firstname": row.get("firstname", ""),
            "lastname": row.get("lastname", ""),
            "hs_object_id": contact_id,
            "lastmodifieddate": created,
            "phone": row.get("phone", ""),
            "hs_lead_status": row.get("hs_lead_status", ""),
            "hubspot_owner_id": row.get("hubspot_owner_id", ""),
        },
        "createdAt": created,
        "updatedAt": created,
        "archived": False,
    }


class ExcelContactProvider:
    """
    Loads contacts from an Excel workbook once and keeps them in memory.
    Supports the same query patterns as the live HubSpot endpoints.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path
        self._contacts: List[Dict] = []
        self._loaded = False

    # ── Loading ──────────────────────────────────────────────────────────

    def load(self) -> int:
        """Parse the Excel file and return the number of contacts loaded."""
        if not os.path.exists(self.file_path):
            logger.error(f"Excel contact file not found: {self.file_path}")
            return 0

        wb = openpyxl.load_workbook(self.file_path, read_only=True)
        ws = wb.active

        # Build header → column-index map
        headers = [cell.value for cell in ws[1]]
        col_map: Dict[int, str] = {}
        for idx, header in enumerate(headers):
            if header in COLUMN_MAP:
                col_map[idx] = COLUMN_MAP[header]

        contacts = []
        for row_idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True)):
            mapped = {col_map[i]: _normalise_value(v) for i, v in enumerate(row) if i in col_map}
            if mapped.get("firstname") or mapped.get("email"):
                contacts.append(_row_to_hubspot_contact(mapped, row_idx))

        wb.close()
        self._contacts = contacts
        self._loaded = True
        logger.info(f"Excel provider loaded {len(contacts)} contacts from {self.file_path}")
        return len(contacts)

    @property
    def contacts(self) -> List[Dict]:
        if not self._loaded:
            self.load()
        return self._contacts

    # ── Query interface (mirrors HubSpot endpoints) ──────────────────────

    def get_all(self) -> List[Dict]:
        return self.contacts

    def get_by_id(self, contact_id: str) -> Optional[Dict]:
        for c in self.contacts:
            if c["id"] == contact_id:
                return c
        return None

    def search(self, query: str) -> List[Dict]:
        q = query.lower()
        return [
            c for c in self.contacts
            if q in (c["properties"].get("firstname") or "").lower()
            or q in (c["properties"].get("lastname") or "").lower()
            or q in (c["properties"].get("email") or "").lower()
        ]

    def reload(self) -> int:
        """Force re-read from disk (e.g. after file update)."""
        self._loaded = False
        self._contacts = []
        return self.load()
