import os
import json
import joblib
import pandas as pd
import numpy as np
import scipy.sparse
import matplotlib.pyplot as plt
import seaborn as sns
from lightgbm import LGBMClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve

os.makedirs('results', exist_ok=True)
os.makedirs('models', exist_ok=True)

X_train = joblib.load('data/processed/X_train_tfidf.pkl')
X_test = joblib.load('data/processed/X_test_tfidf.pkl')
y_train = pd.read_csv('data/processed/y_train.csv')
y_test = pd.read_csv('data/processed/y_test.csv')

if y_train.shape[1] == 1:
    y_train = y_train.iloc[:, 0]
if y_test.shape[1] == 1:
    y_test = y_test.iloc[:, 0]

if scipy.sparse.issparse(X_train):
    feature_names = [f"feat_{i}" for i in range(X_train.shape[1])]
    X_train_df = pd.DataFrame(X_train.toarray(), columns=feature_names)
    X_test_df = pd.DataFrame(X_test.toarray(), columns=feature_names)
else:
    if isinstance(X_train, pd.DataFrame):
        X_train_df = X_train
        X_test_df = pd.DataFrame(X_test, columns=X_train.columns)
    else:
        feature_names = [f"feat_{i}" for i in range(X_train.shape[1])]
        X_train_df = pd.DataFrame(X_train, columns=feature_names)
        X_test_df = pd.DataFrame(X_test, columns=feature_names)

lgbm = LGBMClassifier(
    subsample=0.8,
    num_leaves=15,
    n_estimators=100,
    max_depth=10,
    learning_rate=0.1,
    colsample_bytree=0.8,
    random_state=42
)

lgbm.fit(X_train_df, y_train)

y_pred = lgbm.predict(X_test_df)
y_proba = lgbm.predict_proba(X_test_df)[:, 1]

class_report = classification_report(y_test, y_pred, output_dict=True)
print("=== Tuned LightGBM Classifier ===")
print(classification_report(y_test, y_pred))

cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['No Toxic', 'Toxic'], yticklabels=['No Toxic', 'Toxic'])
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.tight_layout()
plt.savefig('results/lightgbm_confusion_matrix.png')
plt.close()

importance = lgbm.feature_importances_
indices = np.argsort(importance)[-20:]  # top 20 features
plt.figure(figsize=(8, 6))
plt.barh(range(len(indices)), importance[indices], align='center')
plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
plt.xlabel('Feature Importance')
plt.title('Top 20 Feature Importances - LightGBM')
plt.tight_layout()
plt.savefig('results/lightgbm_feature_importance.png')
plt.close()

roc_auc = roc_auc_score(y_test, y_proba)
fpr, tpr, _ = roc_curve(y_test, y_proba)
plt.figure(figsize=(6, 6))
plt.plot(fpr, tpr, label=f'LightGBM ROC curve (area = {roc_auc:.2f})')
plt.plot([0, 1], [0, 1], linestyle='--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend(loc='lower right')
plt.tight_layout()
plt.savefig('results/lightgbm_roc_curve.png')
plt.close()

joblib.dump(lgbm, 'models/lightgbm_model.pkl')

metrics_to_save = {
    'classification_report': class_report,
    'roc_auc': roc_auc,
    'confusion_matrix': cm.tolist()
}

with open('results/lightgbm_metrics.json', 'w') as f:
    json.dump(metrics_to_save, f, indent=4)

print("Model, metrics, and visualizations saved under 'models/' and 'results/' directories.")
