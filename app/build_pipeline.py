import joblib
from sklearn.pipeline import Pipeline
from TextPreprocessor import TextPreprocessor
import pandas as pd

# Cargar modelo y vectorizador ya entrenados
vectorizer = joblib.load('data/processed/tfidf_vectorizer.pkl')
model = joblib.load('models/mejor_modelo_xgboost.pkl')

# Crear pipeline (NO llamar a fit)
pipeline_final = Pipeline([
    ('preprocess', TextPreprocessor()),
    ('vectorize', vectorizer),
    ('model', model)
])

# Guardar pipeline directamente, sin fit
joblib.dump(pipeline_final, 'models/pipeline_final.pkl')
print("¡Pipeline guardado exitosamente en models/pipeline_final.pkl!")