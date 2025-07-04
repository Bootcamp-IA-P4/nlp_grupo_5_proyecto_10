import pandas as pd
import joblib
from lightgbm import LGBMClassifier
from sklearn.metrics import classification_report

X_train = joblib.load('data/processed/X_train_tfidf.pkl')
X_test = joblib.load('data/processed/X_test_tfidf.pkl')
y_train = pd.read_csv('data/processed/y_train.csv')
y_test = pd.read_csv('data/processed/y_test.csv')

if y_train.shape[1] == 1:
    y_train = y_train.iloc[:, 0]
if y_test.shape[1] == 1:
    y_test = y_test.iloc[:, 0]

lgbm = LGBMClassifier(
    subsample=0.8,
    num_leaves=15,
    n_estimators=100,
    max_depth=10,
    learning_rate=0.1,
    colsample_bytree=0.8,
    random_state=42
)

lgbm.fit(X_train, y_train)

y_pred = lgbm.predict(X_test)
print("=== Final Tuned LightGBM Classifier ===")
print(classification_report(y_test, y_pred))
