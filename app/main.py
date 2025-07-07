# joblib.dump(pipeline_final, 'pipeline_final.pkl')
# pipeline = joblib.load('pipeline_final.pkl')

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os

# Cargar pipeline final
model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline_final.pkl')
pipeline = joblib.load(model_path)

# Crear app
app = FastAPI(
    title="NLP Sentiment Classifier API",
    description="Una API que clasifica texto usando un modelo de NLP",
    version="1.0"
)

# Input model
class TextInput(BaseModel):
    text: str

# Endpoint
@app.post("/predict")
def predict(input_text: TextInput):
    try:
        prediction = pipeline.predict([input_text.text])
        return {"prediction": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))