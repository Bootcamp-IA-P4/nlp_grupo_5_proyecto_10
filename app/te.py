import joblib

vectorizer = joblib.load('data/processed/tfidf_vectorizer.pkl')
print(hasattr(vectorizer, 'idf_'))  # Debe dar True
