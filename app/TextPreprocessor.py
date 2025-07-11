from sklearn.base import BaseEstimator, TransformerMixin
from .preprocessing import (
    clean_noise, normalize_text, replace_slang, tokenize_text,
    normalize_repeated_letters, correct_spelling,
    remove_stopwords, lemmatize_tokens, spell
)
from .preprocessing_resources import slang_dict, correction_dict

class TextPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self, slang_dict=slang_dict, correction_dict=correction_dict, spell=spell):
        self.slang_dict = slang_dict
        self.correction_dict = correction_dict
        self.spell = spell

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        import pandas as pd
        if not hasattr(X, 'apply'):
            X = pd.Series(X)
        return X.apply(self._process)

    def _process(self, text):
        text = clean_noise(text)
        text = normalize_text(text)
        text = replace_slang(text, self.slang_dict)
        tokens = tokenize_text(text)
        tokens = [normalize_repeated_letters(t) for t in tokens]
        tokens = [correct_spelling(t, self.correction_dict, self.spell) for t in tokens]
        tokens = remove_stopwords(tokens)
        tokens = lemmatize_tokens(tokens)
        return " ".join(tokens)
