"""
EduInsight AI — Database Seeder
================================
Seeds ONLY:
  - 1 teacher account (for admin/demo)
  - Educational skills (10 concepts from ASSISTments dataset)
  - 22 quiz questions

Does NOT seed:
  - Fake student interactions
  - Hardcoded mastery values
  - Random risk/prediction data

Real students register via /api/auth/register and earn real data
by taking quizzes. Their BKT mastery, risk, SHAP, and recommendations
are all computed from their actual interactions.
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from database import engine, SessionLocal, Base
import models
from auth import hash_password

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(BASE_DIR, "models"))
XGB_PATH = os.path.join(MODELS_DIR, "eduinsight_xgb.pkl")
RF_PATH = os.path.join(MODELS_DIR, "eduinsight_rf.pkl")

SEED_TEACHER_NAME = os.getenv("SEED_TEACHER_NAME", "Dr. Sarah Jenkins")
SEED_TEACHER_EMAIL = os.getenv("SEED_TEACHER_EMAIL", "teacher@eduinsight.ai")
SEED_TEACHER_PASSWORD = os.getenv("SEED_TEACHER_PASSWORD", "password123")


def check_models_presence():
    """Verifies existence of trained .pkl files - never generates or replaces them."""
    print("=" * 60)
    print("CHECKING PRE-TRAINED MODEL FILES IN backend/models/")
    print("=" * 60)
    rf_exists = os.path.exists(RF_PATH)
    xgb_exists = os.path.exists(XGB_PATH)

    if rf_exists:
        print(f"[FOUND]   Random Forest: {RF_PATH}")
    else:
        print(f"[MISSING] Random Forest: {RF_PATH}")

    if xgb_exists:
        print(f"[FOUND]   XGBoost      : {XGB_PATH}")
    else:
        print(f"[MISSING] XGBoost      : {XGB_PATH}")

    if not (rf_exists and xgb_exists):
        print("\n[IMPORTANT] Place your pre-trained .pkl files in backend/models/")
        print("  -> eduinsight_rf.pkl")
        print("  -> eduinsight_xgb.pkl")
        print("  The system uses a heuristic fallback until .pkl files are available.")
    print("=" * 60)


def seed_database():
    check_models_presence()

    # Drop and recreate all tables (clean slate)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # ── 1. Seed Teacher Account ─────────────────────────────────────────
        print("\n[1/3] Seeding Teacher Account...")
        teacher_user = models.User(
            name=SEED_TEACHER_NAME,
            email=SEED_TEACHER_EMAIL,
            password_hash=hash_password(SEED_TEACHER_PASSWORD),
            role="TEACHER"
        )
        db.add(teacher_user)
        db.commit()
        print(f"  [+] Teacher: {SEED_TEACHER_EMAIL} / {SEED_TEACHER_PASSWORD}")

        # ── 2. Seed Skills (from ASSISTments dataset) ───────────────────────
        print("\n[2/3] Seeding Skills...")
        skills_data = [
            (45,  "Equation Solving Two or Fewer Steps"),
            (12,  "Venn Diagram"),
            (78,  "Finding y-intercept"),
            (102, "Combining Like Terms"),
            (34,  "Finding Slope"),
            (19,  "Pattern Finding"),
            (105, "Properties and Classification of Pyramid"),
            (112, "Perimeter of an Irregular Figure"),
            (88,  "Surface Area Pyramid"),
            (64,  "Division Mixed Fractions"),
        ]

        for sk_id, sk_name in skills_data:
            db.add(models.Skill(skill_id=sk_id, skill_name=sk_name))
        db.commit()
        print(f"  [+] Seeded {len(skills_data)} skills.")

        # ── 3. Seed Quiz Questions ───────────────────────────────────────────
        print("\n[3/3] Seeding Quiz Questions...")
        questions_data = [
            # Skill 45: Equation Solving
            (45, "Solve for x: 2x + 5 = 15",
             "x = 5", "x = 10", "x = 7.5", "x = 4", "A"),
            (45, "Solve for y: 3y - 9 = 0",
             "y = 0", "y = 3", "y = 9", "y = -3", "B"),
            (45, "Solve for z: 4z + 8 = 32",
             "z = 4", "z = 8", "z = 6", "z = 10", "C"),

            # Skill 12: Venn Diagram
            (12, "In a class of 30, 18 play Soccer, 14 play Basketball, and 5 play both. How many play neither?",
             "3", "5", "8", "2", "A"),
            (12, "If Set A has 10 elements, Set B has 15 elements, and A ∩ B has 4 elements, how many elements are in A ∪ B?",
             "25", "21", "19", "29", "B"),

            # Skill 78: Finding y-intercept
            (78, "Find the y-intercept of the line y = 3x - 7.",
             "(0, 3)", "(3, 0)", "(0, -7)", "(-7, 0)", "C"),
            (78, "What is the y-intercept of 2x + 4y = 12?",
             "(0, 3)", "(6, 0)", "(0, 12)", "(0, 6)", "A"),

            # Skill 102: Combining Like Terms
            (102, "Simplify: 5x + 3y - 2x + 7y",
             "7x + 10y", "3x + 10y", "10x + 3y", "3x + 4y", "B"),
            (102, "Simplify: 4a + 2b - a - 5b",
             "3a - 3b", "5a - 3b", "3a + 7b", "4a - 3b", "A"),

            # Skill 34: Finding Slope
            (34, "Find the slope of the line passing through (2, 3) and (4, 11).",
             "2", "4", "8", "0.5", "B"),
            (34, "What is the slope of the horizontal line y = 5?",
             "Undefined", "0", "5", "1", "B"),

            # Skill 19: Pattern Finding
            (19, "What is the next number in the sequence: 2, 6, 18, 54, ...?",
             "108", "162", "216", "72", "B"),
            (19, "Find the 6th term of the sequence: 3, 7, 11, 15, ...",
             "19", "23", "27", "31", "B"),

            # Skill 105: Pyramid Properties
            (105, "How many vertices does a square-based pyramid have?",
             "4", "5", "6", "8", "B"),
            (105, "What shape forms the lateral faces of any standard pyramid?",
             "Triangles", "Squares", "Rectangles", "Pentagons", "A"),

            # Skill 112: Perimeter Irregular Figure
            (112, "Calculate the perimeter of an irregular figure with sides 4cm, 7cm, 5cm, 3cm, and 6cm.",
             "20cm", "25cm", "22cm", "27cm", "B"),
            (112, "An L-shaped figure has outer dimensions 8m by 6m. If its inner cutouts are 4m and 3m, what is its perimeter?",
             "28m", "24m", "32m", "18m", "A"),

            # Skill 88: Surface Area Pyramid
            (88, "Find the total surface area of a square pyramid with base side 6m and slant height 5m.",
             "96 sq m", "60 sq m", "84 sq m", "120 sq m", "A"),
            (88, "The base area of a pyramid is 25 sq cm and its 4 lateral faces each have area 15 sq cm. What is the total surface area?",
             "60 sq cm", "85 sq cm", "100 sq cm", "75 sq cm", "B"),

            # Skill 64: Division Mixed Fractions
            (64, "Divide: 2 1/2 ÷ 1 1/4",
             "2", "1 1/2", "3", "2 1/2", "A"),
            (64, "Evaluate: 3 1/3 ÷ 5/6",
             "4", "2 1/2", "3 2/3", "4 1/2", "A"),
        ]

        for q_sk_id, text, opt_a, opt_b, opt_c, opt_d, ans in questions_data:
            db.add(models.QuizQuestion(
                skill_id=q_sk_id,
                question=text,
                option_a=opt_a,
                option_b=opt_b,
                option_c=opt_c,
                option_d=opt_d,
                correct_answer=ans
            ))
        db.commit()
        # ── 4. Seed Demo Student (matches UI Demo Student button) ─────────
        print("\n[4/4] Seeding Demo Student...")
        student_user = models.User(
            name="Alex Carter",
            email="student1@eduinsight.ai",
            password_hash=hash_password("password123"),
            role="STUDENT"
        )
        db.add(student_user)
        db.flush()

        student_profile = models.Student(
            user_id=student_user.id,
            student_code=100001,
            teacher_id=teacher_user.id
        )
        db.add(student_profile)
        db.flush()

        for sk_id, _ in skills_data:
            db.add(models.StudentSkillMastery(
                student_id=student_profile.id,
                skill_id=sk_id,
                mastery=0.0
            ))
        db.commit()
        print("  [+] Demo Student: student1@eduinsight.ai / password123")

        print("\n" + "=" * 60)
        print("DATABASE SEEDING COMPLETE")
        print("=" * 60)
        print("\nReady to use:")
        print("  Teacher login  : teacher@eduinsight.ai / password123")
        print("  Demo Student   : student1@eduinsight.ai / password123")
        print("  Or register any new student at /register")
        print("\nNOTE: Students start with P_INIT BKT mastery (0.20).")
        print("      All analytics grow from REAL quiz interactions.")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n[-] Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
