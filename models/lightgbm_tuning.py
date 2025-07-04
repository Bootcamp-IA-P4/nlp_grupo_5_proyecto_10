import pandas as pd
import joblib
from lightgbm import LGBMClassifier
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import classification_report

X_train = joblib.load('data/processed/X_train_tfidf.pkl')
X_test = joblib.load('data/processed/X_test_tfidf.pkl')
y_train = pd.read_csv('data/processed/y_train.csv')
y_test = pd.read_csv('data/processed/y_test.csv')

if y_train.shape[1] == 1:
    y_train = y_train.iloc[:, 0]
if y_test.shape[1] == 1:
    y_test = y_test.iloc[:, 0]

param_grid = {
    'num_leaves': [15, 31],
    'max_depth': [-1, 10],
    'learning_rate': [0.05, 0.1],
    'n_estimators': [50, 100],
    'subsample': [0.8],
    'colsample_bytree': [0.8]
}

lgbm = LGBMClassifier(random_state=42)

grid = RandomizedSearchCV(
    estimator=lgbm,
    param_distributions=param_grid,
    n_iter=8,  # Number of random parameter combinations to try
    scoring='f1',
    cv=3,
    verbose=3,
    n_jobs=-1,
    random_state=42
)

grid.fit(X_train, y_train)

print("Best parameters:", grid.best_params_)

y_pred = grid.predict(X_test)
print("=== Tuned LightGBM Classifier ===")
print(classification_report(y_test, y_pred))
