from typing import Dict, Any
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse
from django.conf import settings
from urllib.parse import quote
from pathlib import Path
import tempfile
import os

from docmanager.core import DocManager, DocError

# Initialize DocManager
manager = DocManager(settings.TEMPLATES_DIR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def templates_list(request):
    """List all available templates."""
    try:
        files = manager.list_templates()
        return Response({"files": files})
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def placeholders(request):
    """Get placeholders for a template."""
    filename = request.data.get('filename')
    
    if not filename:
        return Response(
            {"error": "filename is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        return Response({
            "placeholders": manager.get_placeholders_with_options(filename),
            "meta": manager.get_meta(filename),
            "layout": manager.get_layout(filename),
        })
    except DocError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_doc(request):
    """Generate a document from template and context."""
    filename = request.data.get('filename')
    context = request.data.get('context', {})
    
    if not filename:
        return Response(
            {"error": "filename is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        buf = manager.render_to_buffer(filename, context)
    except DocError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Prepare filename for download
    filename_base = Path(filename).name.replace("\r", " ")
    filename_clean = filename_base.replace("\n", " ").replace("\\", "\\\\").replace('"', '\\"')
    
    response = StreamingHttpResponse(
        buf,
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    response['Content-Disposition'] = f'attachment; filename="{filename_clean}"; filename*=UTF-8\'\'{quote(filename_base)}'
    
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_doc(request):
    """Validate a document (placeholder for validator logic)."""
    if 'file' not in request.FILES:
        return Response(
            {"error": "No file provided"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    file = request.FILES['file']
    
    if not file.name or not file.name.lower().endswith('.docx'):
        return Response(
            {"error": "Only .docx files are allowed"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Read file content
        content = file.read()
        
        # Create temporary file for validation
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = os.path.join(tmpdir, file.name)
            
            with open(tmp_path, 'wb') as f:
                f.write(content)
            
            # Placeholder for validation logic
            # You can import and use your validator here
            issues = []
            
        return Response({
            "ok": True,
            "filename": file.name,
            "issues": issues
        })
    except DocError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": "Validation failed"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )