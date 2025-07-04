import pandas as pd
import joblib
from sklearn.metrics import classification_report
from lightgbm import LGBMClassifier

X_train = joblib.load('data/processed/X_train_tfidf.pkl')
X_test = joblib.load('data/processed/X_test_tfidf.pkl')

y_train = pd.read_csv('data/processed/y_train.csv')
y_test = pd.read_csv('data/processed/y_test.csv')

if y_train.shape[1] == 1:
    y_train = y_train.iloc[:, 0]
if y_test.shape[1] == 1:
    y_test = y_test.iloc[:, 0]

lgbm = LGBMClassifier(random_state=42)
lgbm.fit(X_train, y_train)

y_pred = lgbm.predict(X_test)

print("=== LightGBM Classifier ===")
print(classification_report(y_test, y_pred))
