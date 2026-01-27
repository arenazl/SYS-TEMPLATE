from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import cloudinary
import cloudinary.uploader
from core.config import settings

router = APIRouter(prefix="/imagenes", tags=["imagenes"])

# Configurar Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = "general"
):
    """
    Sube una imagen a Cloudinary

    Args:
        file: Archivo de imagen
        folder: Carpeta en Cloudinary (themes, categorias, etc)

    Returns:
        dict: URL de la imagen subida
    """
    try:
        # Validar tipo de archivo
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

        # Leer contenido del archivo
        contents = await file.read()

        # Subir a Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="image",
            allowed_formats=["jpg", "jpeg", "png", "webp", "gif"]
        )

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result["width"],
            "height": result["height"],
            "format": result["format"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")


@router.delete("/delete/{public_id:path}")
async def delete_image(public_id: str):
    """
    Elimina una imagen de Cloudinary

    Args:
        public_id: ID público de la imagen en Cloudinary

    Returns:
        dict: Resultado de la eliminación
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return {"result": result["result"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar imagen: {str(e)}")
