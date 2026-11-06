import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database import SessionLocal, Base, engine
import models
import schemas
import bkt_service
import ml_service
import shap_service
import recommendation_service

def test_quiz_submit():
    db = SessionLocal()
    try:
        # Check if student exists
        student = db.query(models.Student).first()
        if not student:
            print("[ERROR] No student found in DB. Run seed.py first.")
            return

        question = db.query(models.QuizQuestion).first()
        if not question:
            print("[ERROR] No quiz question found in DB. Run seed.py first.")
            return

        print(f"Testing submission for Student ID: {student.id}, Question ID: {question.id}...")

        submission = schemas.QuizSubmission(
            question_id=question.id,
            selected_option="A",
            attempt_count=1,
            hint_count=0,
            ms_first_response=5000.0,
            bottom_hint=0,
            actions=1,
            overlap_time=5000.0
        )

        correct = 1 if submission.selected_option.upper() == question.correct_answer.upper() else 0

        # Save Interaction
        interaction = models.Interaction(
            student_id=student.id,
            question_id=question.id,
            skill_id=question.skill_id,
            correct=correct,
            attempt_count=submission.attempt_count,
            hint_count=submission.hint_count,
            ms_first_response=submission.ms_first_response,
            bottom_hint=submission.bottom_hint,
            actions=submission.actions,
            overlap_time=submission.overlap_time
        )
        db.add(interaction)
        db.commit()
        print("[1/5] Interaction saved successfully!")

        # Update BKT
        new_mastery = bkt_service.update_mastery(db, student.id, question.skill_id, correct)
        print(f"[2/5] BKT Mastery updated: {new_mastery:.4f}")

        # ML Risk
        feat_dict = {
            "attempt_count": submission.attempt_count,
            "hint_count": submission.hint_count,
            "ms_first_response": submission.ms_first_response,
            "skill_id": question.skill_id,
            "bottom_hint": submission.bottom_hint,
            "actions": submission.actions,
            "overlap_time": submission.overlap_time
        }

        risk_prob, risk_level, model_name = ml_service.ml_service.predict_risk(feat_dict, model_type="xgb")
        print(f"[3/5] ML Risk Prediction: Level={risk_level}, Prob={risk_prob:.4f}, Model={model_name}")

        # SHAP
        shap_exp = shap_service.get_shap_explanation(feat_dict, risk_level, risk_prob)
        print(f"[4/5] SHAP Explanation generated successfully!")

        # Recommendations
        new_recs = recommendation_service.generate_recommendations(db, student.id)
        print(f"[5/5] Recommendations generated: {len(new_recs)} recommendations.")

        print("\n[SUCCESS] Quiz submission logic works 100% cleanly!")

    except Exception as e:
        print(f"\n[EXCEPTION IN QUIZ SUBMIT]: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_quiz_submit()
