"""
Jaal Drushti - ML Model Training Pipeline
Trains a time-series Random Forest Regressor to forecast 7-day future WQI based on 
historical lags, physicochemical stress indicators, and water coverage variations.
"""

import os
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.model_selection import train_test_split
import joblib

def generate_synthetic_training_dataset(n_samples: int = 1200) -> pd.DataFrame:
    """Generates realistic synthetic multi-lake sensor data for model training."""
    np.random.seed(42)
    
    # Baseline WQI distribution across 4 distinct simulated lake types
    base_wqi = np.random.uniform(50.0, 90.0, size=n_samples)
    
    # Lagged features
    lag_1 = base_wqi + np.random.normal(0, 1.5, size=n_samples)
    lag_3 = base_wqi + np.random.normal(0, 2.5, size=n_samples)
    lag_7 = base_wqi + np.random.normal(0, 4.0, size=n_samples)
    
    # Chemical parameters correlated with WQI
    ph = 7.0 + (base_wqi - 70) * 0.02 + np.random.normal(0, 0.3, size=n_samples)
    turbidity = np.clip(30.0 - (base_wqi * 0.25) + np.random.exponential(4.0, size=n_samples), 1.0, 80.0)
    dissolved_oxygen = np.clip((base_wqi * 0.08) + np.random.normal(0, 0.6, size=n_samples), 2.0, 10.0)
    tds = np.clip(600.0 - (base_wqi * 3.5) + np.random.normal(0, 40.0, size=n_samples), 100.0, 1500.0)
    temperature = np.random.uniform(18.0, 32.0, size=n_samples)
    water_coverage = np.random.uniform(35.0, 85.0, size=n_samples)
    water_area_delta = np.random.normal(0, 2.0, size=n_samples)
    
    # Target: WQI 7 days into future
    # Degrades if turbidity is high and DO is low
    deterioration_force = ((turbidity > 20) * 2.5) + ((dissolved_oxygen < 5.0) * 3.0)
    recovery_force = ((dissolved_oxygen > 7.0) * 1.5)
    target_7d = base_wqi + (base_wqi - lag_7) * 0.5 - deterioration_force + recovery_force + np.random.normal(0, 2.0, size=n_samples)
    target_7d = np.clip(target_7d, 15.0, 98.0)
    
    df = pd.DataFrame({
        "lag_1": lag_1,
        "lag_3": lag_3,
        "lag_7": lag_7,
        "ph": ph,
        "turbidity": turbidity,
        "dissolved_oxygen": dissolved_oxygen,
        "tds": tds,
        "temperature": temperature,
        "water_coverage": water_coverage,
        "water_area_delta": water_area_delta,
        "target_7d_wqi": target_7d
    })
    return df

def train_pipeline():
    print("==================================================")
    print("      JAAL DRUSHTI — ML TRAINING PIPELINE         ")
    print("==================================================")
    
    output_dir = Path(__file__).resolve().parent.parent / "models"
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "wqi_forecast_model.joblib"
    
    print("[1/4] Generating synthetic multi-lake training dataset...")
    df = generate_synthetic_training_dataset(n_samples=1500)
    print(f"      Dataset synthesized with {len(df)} samples across 10 features.")
    
    feature_cols = [
        "lag_1", "lag_3", "lag_7", "ph", "turbidity", 
        "dissolved_oxygen", "tds", "temperature", "water_coverage", "water_area_delta"
    ]
    X = df[feature_cols]
    y = df["target_7d_wqi"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("[2/4] Training Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    print("[3/4] Evaluating Model Performance...")
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print(f"      Mean Absolute Error (MAE): {mae:.2f} WQI points")
    print(f"      Root Mean Squared Error (RMSE): {rmse:.2f} WQI points")
    print(f"      R-squared (R²): {r2:.4f}")
    
    # Feature Importances
    importances = dict(zip(feature_cols, model.feature_importances_))
    sorted_imp = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("\n      Key Feature Drivers:")
    for feat, imp in sorted_imp[:5]:
        print(f"      - {feat:18s}: {imp * 100:.1f}%")
        
    print(f"\n[4/4] Serializing model to {model_path}...")
    joblib.dump(model, model_path)
    print("      Model training and serialization completed successfully!")
    print("==================================================")

if __name__ == "__main__":
    train_pipeline()
