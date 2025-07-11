from googleapiclient.discovery import build
from dotenv import load_dotenv
import os
import re
import logging

# Set up logging
logger = logging.getLogger(__name__)

def extraer_video_id(url):
    """Extrae el video ID de una URL de YouTube"""
    patterns = [
        r'(?:youtube\.com/watch\?v=)([a-zA-Z0-9_-]+)',
        r'(?:youtu\.be/)([a-zA-Z0-9_-]+)',
        r'(?:youtube\.com/embed/)([a-zA-Z0-9_-]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def obtener_comentarios_video(video_url, max_results=50):
    """Obtiene los comentarios de un video de YouTube"""
    try:
        # Verificar dependencias
        try:
            from googleapiclient.discovery import build
            from dotenv import load_dotenv
        except ImportError as e:
            logger.error(f"Missing dependencies: {e}")
            return {"error": f"Missing dependencies: {e}. Install with: pip install google-api-python-client python-dotenv"}
        
        # Cargar variables de entorno
        load_dotenv()
        api_key = os.getenv("API_KEY")
        
        logger.info(f"API_KEY loaded: {'Yes' if api_key else 'No'}")
        
        if not api_key:
            return {"error": "API_KEY not found. Please set your YouTube API key in .env file"}
        
        # Extraer video ID
        video_id = extraer_video_id(video_url)
        if not video_id:
            return {"error": "Invalid YouTube URL format"}
        
        logger.info(f"Processing video ID: {video_id}")
        
        # Construir cliente de YouTube
        try:
            youtube = build("youtube", "v3", developerKey=api_key)
        except Exception as e:
            logger.error(f"Failed to build YouTube client: {e}")
            return {"error": f"Failed to connect to YouTube API: {str(e)}"}
        
        # Obtener información del video
        try:
            video_request = youtube.videos().list(
                part="snippet,statistics",
                id=video_id
            )
            video_response = video_request.execute()
            
            if not video_response["items"]:
                return {"error": "Video not found or not accessible"}
            
            video_info = video_response["items"][0]
            logger.info(f"Video found: {video_info['snippet']['title']}")
            
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            return {"error": f"Failed to get video information: {str(e)}"}
        
        # Obtener comentarios
        try:
            comments_request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=min(max_results, 100),
                order="relevance"
            )
            comments_response = comments_request.execute()
            
        except Exception as e:
            logger.error(f"Failed to get comments: {e}")
            return {"error": f"Failed to get comments. Video may have comments disabled: {str(e)}"}
        
        # Procesar comentarios
        comentarios = []
        for item in comments_response["items"]:
            comment = item["snippet"]["topLevelComment"]["snippet"]
            comentarios.append({
                "autor": comment["authorDisplayName"],
                "texto": comment["textDisplay"],
                "fecha": comment["publishedAt"],
                "likes": comment["likeCount"],
                "id": item["id"]
            })
        
        logger.info(f"Successfully retrieved {len(comentarios)} comments")
        
        return {
            "success": True,
            "video_info": {
                "titulo": video_info["snippet"]["title"],
                "canal": video_info["snippet"]["channelTitle"],
                "descripcion": video_info["snippet"]["description"][:200] + "..." if video_info["snippet"]["description"] else "",
                "fecha_publicacion": video_info["snippet"]["publishedAt"],
                "vistas": video_info["statistics"].get("viewCount", "N/A"),
                "likes": video_info["statistics"].get("likeCount", "N/A"),
                "comentarios_totales": video_info["statistics"].get("commentCount", "N/A")
            },
            "comentarios": comentarios,
            "total_obtenidos": len(comentarios)
        }
        
    except Exception as e:
        logger.error(f"Unexpected error in obtener_comentarios_video: {e}")
        return {"error": f"Unexpected error: {str(e)}"}

# Test function
if __name__ == "__main__":
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    result = obtener_comentarios_video(test_url, 5)
    print(f"Test result: {result}")