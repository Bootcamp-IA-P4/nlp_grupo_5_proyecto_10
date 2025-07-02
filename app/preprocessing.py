import re
import emoji
import contractions
import spacy
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from unidecode import unidecode

# Cargar modelo de spaCy
nlp = spacy.load("en_core_web_sm")

try:
    nltk.download('punkt_tab')  # Nueva versión del tokenizador
except:
    nltk.download('punkt')  # Fallback para versiones anteriores

# Descargar stopwords
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# === FUNCIONES DEL PIPELINE === #

def normalize_text(text):

    text = text.lower()
    text = unidecode(text)  # elimina acentos
    text = re.sub(r"\'scuse", " excuse ", text)
    text = contractions.fix(text) # p.ej can´t -> cannot

    # text = re.sub('\W', ' ', text)
    text = re.sub(r'[^a-z_\s]', ' ', text) # solo letras y espacios -> he añadido _ para los emojis
    text = re.sub('\s+', ' ', text) # reemplaza múltiples espacios por uno solo (incluye \t, \n etc)
    text = text.strip()  # elimina espacios al inicio y final
    return text

def clean_noise(text):
    text = re.sub(r"http\S+|www\S+|https\S+", '', text, flags=re.MULTILINE) # elimina URLs
    text = re.sub(r'@\w+', '', text) # elimina menciones del usuario @pepe
    text = emoji.demojize(text) # reemplaza emojis por su nombre
    return text

def tokenize_text(text):
    return word_tokenize(text)

def remove_stopwords(tokens):
    return [word for word in tokens if word not in stop_words and len(word) > 1]

def lemmatize_tokens(tokens):
    doc = nlp(" ".join(tokens))
    return [token.lemma_ for token in doc]

def preprocess_pipeline(text):
    text = normalize_text(text)
    text = clean_noise(text)
    tokens = tokenize_text(text)
    tokens = remove_stopwords(tokens)
    tokens = lemmatize_tokens(tokens)
    return " ".join(tokens)
