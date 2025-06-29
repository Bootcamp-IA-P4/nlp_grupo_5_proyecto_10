# NLP Grupo 5 - Proyecto de Procesamiento de Lenguaje Natural

¡Bienvenidos al repositorio del Grupo 5 para el proyecto de NLP!

## 📋 Descripción del Proyecto

Este repositorio contiene el desarrollo completo de un proyecto de procesamiento de lenguaje natural (NLP), incluyendo análisis de datos, modelos de machine learning, backend API y frontend para la visualización de resultados.

## 📂 Resumen Rápido de Carpetas

- **📁 backend**: Aquí va el código del servidor y API
- **📁 data**: Aquí van los archivos CSV originales y modificados
- **📁 db**: Aquí van las bases de datos
- **📁 frontend**: Aquí va la página web para mostrar resultados
- **📁 models**: Aquí van los archivos .pkl, .h5 y .pth (modelos entrenados)
- **📁 notebooks**: Aquí van los archivos .ipynb para análisis
- **📁 tests**: Aquí van las pruebas del código

## 🏗️ Estructura del Proyecto

### 📁 **backend/**
**Responsable**: Equipo de Backend
**Contenido**: 
- API REST desarrollada en Python (Flask/FastAPI)
- Endpoints para servir los modelos de ML
- Lógica de negocio y procesamiento de datos
- Archivos de configuración del servidor
- Middleware y autenticación


```

### 📁 **data/**
**Responsable**: Equipo de Data Science
**Contenido**: 
- **Archivos CSV originales**: Datasets sin procesar tal como se obtuvieron de las fuentes
- **Archivos CSV modificados**: Datasets procesados, limpiados y preparados para entrenamiento

```

### 📁 **db/**
**Responsable**: Equipo de Backend/Data
**Contenido**: 
- Archivos de base de datos (SQLite, PostgreSQL dumps, etc.)
- Scripts de migración y creación de esquemas
- Configuraciones de conexión a BD
- Backup de datos importantes

### 📁 **frontend/**
**Responsable**: Equipo de Frontend
**Contenido**: 
- Aplicación web para visualización de resultados
- Interfaz de usuario para interactuar con los modelos
- Dashboard de métricas y resultados

**Tecnologías sugeridas**: React, Vue.js, o HTML/CSS/JavaScript vanilla

### 📁 **models/**
**Responsable**: Equipo de ML/Data Science
**Contenido**: 
- **Archivos .pkl**: Modelos serializados con pickle
- **Archivos .h5**: Modelos de deep learning (Keras/TensorFlow)
- **Archivos .pth**: Modelos de PyTorch
- Configuraciones de hiperparámetros
- Métricas y evaluaciones de modelos


### 📁 **notebooks/**
**Responsable**: Equipo de Data Science
**Contenido**: 
- Jupyter Notebooks para análisis exploratorio
- Notebooks de entrenamiento de modelos
- Visualizaciones y reportes
- Experimentación y prototipado

**Convención de nombres**: `nombre_de_modelo_autor.ipynb`


### 📁 **tests/**
**Responsable**: Todo el equipo
**Contenido**: 
- Tests unitarios para funciones críticas
- Tests de integración para APIs
- Tests de rendimiento de modelos
- Configuraciones de testing

## 🚀 Configuración del Entorno

### Requisitos Previos
- Python 3.8+
- Git
- Pip o Conda

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/MaximilianoScarlato/nlp_grupo_5.git
cd nlp_grupo_5

# Instalar dependencias
pip install -r requirements.txt

# Configurar el entorno (si es necesario)
```

## 🔄 Flujo de Trabajo (Git Flow)

### Ramas Principales
- **`main`**: Código estable y listo para producción
- **`dev`**: Rama de desarrollo donde se integran las nuevas características

### Flujo de Desarrollo
1. Crear una rama feature desde `dev`: `git checkout -b feature/nombre-caracteristica`
2. Desarrollar la funcionalidad
3. Hacer commit de los cambios: `git commit -m "feat: descripción del cambio"`
4. Push de la rama: `git push origin feature/nombre-caracteristica`
5. Crear Pull Request hacia `dev`
6. Revisión de código por el equipo
7. Merge a `dev` después de aprobación

## 📝 Convenciones de Commits

Usar el formato: `tipo: descripción`

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan funcionalidad)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `data`: Cambios en datasets o procesamiento de datos

## 👥 Equipo

- **Scrum Master**: [Tu nombre]
- **Backend**: [Nombres del equipo]
- **Frontend**: [Nombres del equipo]
- **Data Science/ML**: [Nombres del equipo]

---

**Última actualización**: Junio 2025
**Versión**: 1.0.0