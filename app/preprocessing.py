import re
import emoji
import contractions
import spacy
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from unidecode import unidecode
from spellchecker import SpellChecker


# Cargar modelo de spaCy
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Descargar recursos NLTK necesarios
import ssl
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

import nltk
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
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
    text = re.sub(r'\s+', ' ', text) # reemplaza múltiples espacios por uno solo (incluye \t, \n etc)
    text = text.strip()  # elimina espacios al inicio y final
    return text

def clean_noise(text):
    text = re.sub(r"http\S+|www\S+|https\S+", '', text, flags=re.MULTILINE) # elimina URLs
    text = re.sub(r'@\w+', '', text) # elimina menciones del usuario @pepe
    text = emoji.demojize(text) # reemplaza emojis por su nombre
    return text

spell = SpellChecker(language='en')

def replace_slang(text, slang_dict):
    # Reemplaza palabras en texto según slang_dict (solo palabras completas)
    pattern = re.compile(r'\b(' + '|'.join(map(re.escape, slang_dict.keys())) + r')\b')
    return pattern.sub(lambda x: slang_dict[x.group().lower()], text)

def correct_spelling(word, correction_dict, spell):
    # Si palabra está en correcciones manuales, aplica esa
    if word.lower() in correction_dict:
        return correction_dict[word.lower()]

    # No corregir si no es alfabético (para no romper slang con números)
    if not word.isalpha():
        return word

    # Usar spellchecker para corregir si hay cambio
    corrected = spell.correction(word)
    return corrected if corrected else word

def normalize_repeated_letters(word):
    # Reduce letras repetidas >2 a solo 2 (ej: ooooola -> oola)
    return re.sub(r'(.)\1{2,}', r'\1\1', word)

def preprocess_text(text, slang_dict, correction_dict, spell):
    text = text.lower()
    text = replace_slang(text, slang_dict)
    return text

def tokenize_text(text):
    return word_tokenize(text)

def remove_stopwords(tokens):
    return [word for word in tokens if word not in stop_words and len(word) > 1]

def lemmatize_tokens(tokens):
    doc = nlp(" ".join(tokens))
    return [token.lemma_ for token in doc]