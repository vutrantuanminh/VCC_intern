import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from xgboost import XGBRegressor
import matplotlib.pyplot as plt

# Đọc dữ liệu
data = pd.read_csv("USA_Housing.csv")

# Tách features và target
X = data.drop(['Price', 'Address'], axis=1)
y = data['Price']

# Chia train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Huấn luyện mô hình cơ bản
xgb = XGBRegressor(random_state=42)
xgb.fit(X_train, y_train)
y_pred = xgb.predict(X_test)

# Đánh giá mô hình cơ bản
print("Mô hình cơ bản:")
print("  R²:", r2_score(y_test, y_pred))
print("  RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))
print("  MAE:", mean_absolute_error(y_test, y_pred))

# Tối ưu tham số bằng RandomizedSearchCV
param_dist = {
    'learning_rate': [0.01, 0.05, 0.1, 0.2],
    'n_estimators': [100, 200, 300, 500],
    'max_depth': [3, 4, 5, 6, 7],
    'subsample': [0.6, 0.7, 0.8, 0.9, 1.0]
}

random_search = RandomizedSearchCV(
    estimator=XGBRegressor(random_state=42),
    param_distributions=param_dist,
    n_iter=20,
    cv=5,
    scoring='r2',
    verbose=1,
    random_state=42,
    n_jobs=-1
)

random_search.fit(X_train, y_train)

# Dự đoán với mô hình tối ưu
best_model = random_search.best_estimator_
y_pred_best = best_model.predict(X_test)

# Đánh giá mô hình tối ưu
print("\nTốt nhất (sau RandomizedSearchCV):")
print("  Tham số tối ưu:", random_search.best_params_)
print("  R²:", r2_score(y_test, y_pred_best))
print("  RMSE:", np.sqrt(mean_squared_error(y_test, y_pred_best)))
print("  MAE:", mean_absolute_error(y_test, y_pred_best))

# Vẽ biểu đồ Feature Importance
plt.figure(figsize=(8, 5))
plt.barh(X.columns, best_model.feature_importances_)
plt.xlabel("Feature Importance")
plt.title("XGBoost Feature Importances")
plt.tight_layout()
plt.show()
