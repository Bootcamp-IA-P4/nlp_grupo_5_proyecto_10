import re
import emoji
import contractions
import spacy
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from unidecode import unidecode
from spellchecker import SpellChecker

# === Load spaCy English model ===
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# === Download NLTK resources with SSL fix ===
import ssl
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

stop_words = set(stopwords.words('english'))

# === Initialize spell checker ===
spell = SpellChecker(language='en')

# === FUNCTIONS ===

def clean_noise(text):
    """
    Removes URLs, mentions, and replaces emojis with text names.
    """
    text = re.sub(r"http\S+|www\S+|https\S+", '', text, flags=re.MULTILINE)  # remove URLs
    text = re.sub(r'@\w+', '', text)  # remove @mentions
    text = emoji.demojize(text)  # convert emojis to :emoji_name:
    return text

def normalize_text(text):
    """
    Lowercase, remove accents, expand contractions, remove special chars except underscores.
    """
    text = text.lower()
    text = unidecode(text)  # remove accents
    text = re.sub(r"\'scuse", " excuse ", text)
    text = contractions.fix(text)  # e.g. can't -> cannot
    text = re.sub(r'[^a-z_\s]', ' ', text)  # keep only letters, underscores, and spaces
    text = re.sub(r'\s+', ' ', text)  # replace multiple spaces/tabs/newlines with single space
    return text.strip()

def replace_slang(text, slang_dict):
    """
    Replace slang words in text using slang_dict.
    """
    pattern = re.compile(r'\b(' + '|'.join(map(re.escape, slang_dict.keys())) + r')\b')
    return pattern.sub(lambda x: slang_dict[x.group().lower()], text)

def correct_spelling(word, correction_dict, spell):
    """
    Correct spelling using correction_dict first, then spellchecker.
    """
    word_lower = word.lower()
    if word_lower in correction_dict:
        return correction_dict[word_lower]

    if not word.isalpha():
        return word

    corrected = spell.correction(word)
    return corrected if corrected else word

def normalize_repeated_letters(word):
    """
    Reduce letters repeated >2 times to only 2 (e.g. coooool -> coool).
    """
    return re.sub(r'(.)\1{2,}', r'\1\1', word)

def tokenize_text(text):
    """
    Tokenize text using NLTK word_tokenize.
    """
    return word_tokenize(text)

def remove_stopwords(tokens):
    """
    Remove stopwords and single-character tokens.
    """
    return [word for word in tokens if word not in stop_words and len(word) > 1]

def lemmatize_tokens(tokens):
    """
    Lemmatize tokens using spaCy.
    """
    doc = nlp(" ".join(tokens))
    return [token.lemma_ for token in doc]

def preprocess_text(text, slang_dict, correction_dict, spell):
    """
    Full preprocessing pipeline: normalize, replace slang, tokenize, correct spelling,
    normalize repeated letters, remove stopwords, lemmatize.
    Returns cleaned string.
    """
    text = clean_noise(text)
    text = normalize_text(text)
    text = replace_slang(text, slang_dict)
    tokens = tokenize_text(text)
    tokens = [normalize_repeated_letters(t) for t in tokens]
    tokens = [correct_spelling(t, correction_dict, spell) for t in tokens]
    tokens = remove_stopwords(tokens)
    tokens = lemmatize_tokens(tokens)
    return " ".join(tokens)
