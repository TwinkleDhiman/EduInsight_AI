import os
from typing import Dict, List, Any
import numpy as np
from dotenv import load_dotenv
from ml_service import ml_service, REQUIRED_FEATURES

load_dotenv()

SHAP_HIGH_RESPONSE_TIME_MS = float(os.getenv("SHAP_HIGH_RESPONSE_TIME_MS", "8000.0"))

# Try importing SHAP optional
try:
    import shap
    HAS_SHAP = True
except Exception:
    HAS_SHAP = False

# Friendly mapping for technical feature names
FEATURE_FRIENDLY_NAMES = {
    "attempt_count": "Number of Attempts",
    "hint_count": "Hints Used",
    "ms_first_response": "Response Time",
    "skill_id": "Current Concept",
    "bottom_hint": "Bottom Hint Usage",
    "actions": "Interaction Actions",
    "overlap_time": "Overlap Time"
}

def get_shap_explanation(feature_dict: Dict[str, Any], risk_level: str, risk_probability: float) -> Dict[str, Any]:
    """
    Calculates feature contribution using SHAP on the actual loaded XGBoost model.
    Maps technical feature names to student-friendly labels.
    Generates 'Why am I at risk?' explanation.
    """
    features_input = ml_service.prepare_features(feature_dict)
    model = ml_service.xgb_model or ml_service.rf_model

    contributions = []
    top_bullets = []

    if HAS_SHAP and (ml_service.xgb_explainer is not None or model is not None):
        try:
            explainer = ml_service.xgb_explainer if ml_service.xgb_explainer is not None else shap.TreeExplainer(model)
            shap_values = explainer.shap_values(features_input)

            if isinstance(shap_values, list):
                vals = shap_values[0][0]
            elif isinstance(shap_values, np.ndarray):
                if len(shap_values.shape) == 3:
                    vals = shap_values[0, :, 0]
                elif len(shap_values.shape) == 2:
                    vals = shap_values[0]
                else:
                    vals = shap_values
            else:
                vals = np.zeros(len(REQUIRED_FEATURES))

            for idx, feat in enumerate(REQUIRED_FEATURES):
                val_score = vals[idx] if idx < len(vals) else 0.0
                feat_val = float(feature_dict.get(feat, 0))
                friendly = FEATURE_FRIENDLY_NAMES.get(feat, feat)
                shap_val = float(val_score)

                impact = "Increases Risk" if shap_val > 0 else "Decreases Risk"

                contributions.append({
                    "feature_name": feat,
                    "friendly_label": friendly,
                    "value": feat_val,
                    "shap_value": round(shap_val, 4),
                    "impact": impact
                })

            contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        except Exception as e:
            print(f"[SHAPService] Error calculating SHAP values: {e}. Using feature importance fallback.")
            contributions = _feature_importance_fallback(feature_dict)
    else:
        contributions = _feature_importance_fallback(feature_dict)

    # Generate student-friendly bullet points
    for c in contributions[:3]:
        lbl = c["friendly_label"]
        val = c["value"]
        if c["feature_name"] == "attempt_count" and val > 1:
            top_bullets.append(f"Multiple attempt count ({int(val)} attempts)")
        elif c["feature_name"] == "hint_count" and val > 0:
            top_bullets.append(f"Frequent hint usage ({int(val)} hints used)")
        elif c["feature_name"] == "ms_first_response" and val > SHAP_HIGH_RESPONSE_TIME_MS:
            top_bullets.append("Long response time before first answer")
        elif c["feature_name"] == "bottom_hint" and val > 0:
            top_bullets.append("Viewed bottom hint (answer revealing hint)")
        else:
            top_bullets.append(f"{lbl} contributed to the risk prediction")

    if not top_bullets:
        top_bullets = [
            "Attempt count is an important feature in the model prediction",
            "Response timing indicates concept hesitation",
            "Hint frequency influences mastery calculation"
        ]

    return {
        "title": "Why am I at risk?",
        "risk_level": risk_level,
        "risk_probability": round(risk_probability, 4),
        "top_bullets": top_bullets,
        "feature_contributions": contributions,
        "scientific_note": "SHAP identifies features that contributed to the model's prediction."
    }

def _feature_importance_fallback(feature_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fallback contribution list based on dataset feature order."""
    fallback_weights = {
        "attempt_count": 0.589,
        "hint_count": 0.248,
        "bottom_hint": 0.144,
        "overlap_time": 0.006,
        "ms_first_response": 0.005,
        "skill_id": 0.005,
        "actions": 0.000
    }
    res = []
    for feat in REQUIRED_FEATURES:
        feat_val = float(feature_dict.get(feat, 0))
        w = fallback_weights.get(feat, 0.01)
        res.append({
            "feature_name": feat,
            "friendly_label": FEATURE_FRIENDLY_NAMES.get(feat, feat),
            "value": feat_val,
            "shap_value": round(w * (feat_val + 0.1), 4),
            "impact": "Increases Risk" if feat_val > 1 else "Neutral"
        })
    res.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
    return res
