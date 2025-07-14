############################################################
# 1. Imagen base para Python y ML
############################################################
FROM python:3.10-slim

# Instala dependencias del sistema necesarias para ML y para psycopg2
RUN apt-get update && apt-get install -y gcc g++ libpq-dev && rm -rf /var/lib/apt/lists/*
############################################################
# 2. Directorio de trabajo
############################################################
WORKDIR /backendpremium

############################################################
# 3. Copia el código fuente y recursos al contenedor
############################################################
# Copia la carpeta principal del backend
COPY backend ./backend

# Copia la carpeta de la aplicación FastAPI
COPY app ./app

# Copia la carpeta de tokenización (NLP)
COPY tokenizador ./tokenizador

# Copia los modelos ML y NLP
COPY models ./models

# Copia la base de datos (scripts, migraciones, etc.)
COPY db ./db

# Copia los datos de ejemplo o entrenamiento
COPY data ./data


# Copia ARCHIVOS DE LA RAIZ POR LAS DUDAS (si los usas)

COPY migrate_database.py .
COPY test_database.py .

# Copia el archivo de dependencias Python
COPY requirements.txt .

############################################################
# 4. Instalación de dependencias Python
############################################################
RUN pip install --no-cache-dir -r requirements.txt

############################################################
# 5. Exponer el puerto para FastAPI/Uvicorn
############################################################
EXPOSE 8000

############################################################
# 6. Configuración de PYTHONPATH para importar módulos
############################################################
ENV PYTHONPATH=/backendpremium/backend:/backendpremium/app:/backendpremium/tokenizador:/backendpremium/models:/backendpremium/db:/backendpremium/data:/backendpremium/test

############################################################
# 7. Comando de inicio del servidor FastAPI
############################################################
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

############################################################
# Índice de pasos y estructura esperada
############################################################
# 1. Instala dependencias del sistema para ML y NLP.
# 2. Establece el directorio de trabajo en /backendpremium.
# 3. Copia todas las carpetas relevantes del proyecto al contenedor:
#    - backend/
#    - app/
#    - tokenizador/
#    - models/
#    - db/
#    - data/
#    - test/
#    - requirements.txt
# 4. Instala dependencias Python (incluye FastAPI, transformers, etc.).
# 5. Expone el puerto 8000 para la API.
# 6. Configura PYTHONPATH para importar módulos desde todas las carpetas.
# 7. Inicia el servidor FastAPI con Uvicorn.

############################################################
# Estructura de carpetas esperada en el proyecto
############################################################
# proyecto/
# ├── backend/
# ├── app/
# ├── tokenizador/
# ├── models/
# ├── db/
# ├── data/
# ├── test/
# ├── requirements.txt
# ├── Dockerfile