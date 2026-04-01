import csv, os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

CSV_PATH = os.path.join(settings.BASE_DIR, 'data', 'mails_sent.csv')

CIVILITY_MAP = {"MR": "Herr", "MME": "Frau", "MRS": "Frau"}

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dispatch_history(request):
    rows = []
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            row['civility'] = CIVILITY_MAP.get(row.get('civility', '').upper(), row.get('civility', ''))
            rows.append(row)
    return Response({"records": rows, "total": len(rows)})