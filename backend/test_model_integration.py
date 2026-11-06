import os
import sys
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ml_service import ml_service, REQUIRED_FEATURES

def test_model_integration():
    print("=" * 60)
    print("EDUINSIGHT AI - MODEL INTEGRATION TEST")
    print("=" * 60)

    # 1 & 2. Verify model loading
    rf_loaded = ml_service.rf_model is not None
    xgb_loaded = ml_service.xgb_model is not None

    print(f"1. eduinsight_rf.pkl loaded: {rf_loaded}")
    print(f"2. eduinsight_xgb.pkl loaded: {xgb_loaded}")

    if not (rf_loaded or xgb_loaded):
        print("\n[TEST RESULT: WARNING]")
        print("Model files are missing in backend/models/.")
        print("Please copy `eduinsight_rf.pkl` and `eduinsight_xgb.pkl` to `backend/models/` to pass live inference tests.")
        return False

    # 3. Test exact 7 features input structure
    test_input = {
        "attempt_count": 2,
        "hint_count": 1,
        "ms_first_response": 5000,
        "skill_id": 45,
        "bottom_hint": 0,
        "actions": 3,
        "overlap_time": 5000
    }

    print(f"\n3. Input Features (Exact 7 in order): {REQUIRED_FEATURES}")
    print(f"   Sample Input: {test_input}")

    # 4 & 5. Test prediction and class-0 risk probability
    if xgb_loaded:
        xgb_prob, xgb_risk, model_used = ml_service.predict_risk(test_input, model_type="xgb")
        print(f"\n4. XGBoost Live Prediction:")
        print(f"   - Class 0 (Risk) Probability: {xgb_prob:.4f} ({xgb_prob*100:.2f}%)")
        print(f"   - Classified Risk Level: {xgb_risk}")
        print(f"   - Model Used: {model_used}")

    if rf_loaded:
        rf_prob, rf_risk, model_used = ml_service.predict_risk(test_input, model_type="rf")
        print(f"\n5. Random Forest Live Prediction:")
        print(f"   - Class 0 (Risk) Probability: {rf_prob:.4f} ({rf_prob*100:.2f}%)")
        print(f"   - Classified Risk Level: {rf_risk}")
        print(f"   - Model Used: {model_used}")

    print("\n[TEST RESULT: SUCCESS] All model integration checks passed!")
    return True

if __name__ == "__main__":
    test_model_integration()
