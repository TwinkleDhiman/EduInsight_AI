import os
from typing import Dict, List, Any
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import func
import models

load_dotenv()

# BKT Prototype Parameters (configurable via environment variables)
P_INIT = float(os.getenv("BKT_P_INIT", "0.20"))
P_LEARN = float(os.getenv("BKT_P_LEARN", "0.15"))
P_GUESS = float(os.getenv("BKT_P_GUESS", "0.20"))
P_SLIP = float(os.getenv("BKT_P_SLIP", "0.10"))

MASTERY_HIGH_THRESHOLD = float(os.getenv("MASTERY_HIGH_THRESHOLD", "0.80"))
MASTERY_MED_THRESHOLD = float(os.getenv("MASTERY_MED_THRESHOLD", "0.60"))

def update_mastery(db: Session, student_id: int, skill_id: int, correct: int) -> float:
    """
    Updates student BKT concept mastery given question response (1 = correct, 0 = incorrect).
    BKT Formula:
      Posterior P(L_t | obs):
        If correct (1): P(L_t) * (1 - P_SLIP) / [ P(L_t) * (1 - P_SLIP) + (1 - P(L_t)) * P_GUESS ]
        If incorrect (0): P(L_t) * P_SLIP / [ P(L_t) * P_SLIP + (1 - P(L_t)) * (1 - P_GUESS) ]
      Transition P(L_{t+1}):
        P(L_t | obs) + (1 - P(L_t | obs)) * P_LEARN
    """
    # Fetch existing mastery or initialize with P_INIT
    record = db.query(models.StudentSkillMastery).filter(
        models.StudentSkillMastery.student_id == student_id,
        models.StudentSkillMastery.skill_id == skill_id
    ).first()

    p_prev = record.mastery if record else P_INIT

    # Step 1: Posterior update based on observation
    if correct == 1:
        p_obs = (p_prev * (1.0 - P_SLIP)) / (p_prev * (1.0 - P_SLIP) + (1.0 - p_prev) * P_GUESS)
    else:
        p_obs = (p_prev * P_SLIP) / (p_prev * P_SLIP + (1.0 - p_prev) * (1.0 - P_GUESS))

    # Step 2: Learning transition update
    p_new = p_obs + (1.0 - p_obs) * P_LEARN

    # Clamp mastery between 0.01 and 0.99 for numerical stability
    p_new = max(0.01, min(0.99, float(p_new)))

    # Save to database
    if record:
        record.mastery = p_new
    else:
        record = models.StudentSkillMastery(
            student_id=student_id,
            skill_id=skill_id,
            mastery=p_new
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return p_new

def get_mastery(db: Session, student_id: int, skill_id: int) -> float:
    """Returns current mastery for a student + skill."""
    record = db.query(models.StudentSkillMastery).filter(
        models.StudentSkillMastery.student_id == student_id,
        models.StudentSkillMastery.skill_id == skill_id
    ).first()
    return record.mastery if record else 0.0

def get_mastery_label(mastery: float) -> str:
    """Classifies numerical mastery into human-readable level."""
    if mastery == 0.0:
        return "Not Started"
    elif mastery >= MASTERY_HIGH_THRESHOLD:
        return "Mastered"
    elif mastery >= MASTERY_MED_THRESHOLD:
        return "Developing"
    else:
        return "Needs Improvement"

def classify_skill_subject(skill_name: str, skill_id: int = 0) -> str:
    """Categorizes curriculum concept into student subjects: Computer Science, Mathematics, Science, English, Physics, Social Studies."""
    name_lower = (skill_name or "").lower()
    if skill_id in (401, 402, 403, 404) or any(k in name_lower for k in [
        "algorithm", "data structure", "tree", "complexity", "programming", "binary", 
        "database", "network", "cybersecurity", "software", "variable", "loop", 
        "computer", "coding", "cs_", "recursion", "oop"
    ]):
        return "Computer Science"
    if skill_id in (501, 502, 503) or any(k in name_lower for k in [
        "kinematics", "newton", "mechanics", "energy conservation", "joules", 
        "velocity", "acceleration", "thermodynamics", "optics", "electromagnetism"
    ]):
        return "Physics"
    if skill_id in (601, 602) or any(k in name_lower for k in [
        "history", "geography", "civics", "economics", "civilization", "cartography", "governance"
    ]):
        return "Social Studies"
    if skill_id in (201, 202, 203) or any(k in name_lower for k in [
        "cell", "biology", "photosynthesis", "respiration", "chemistry", "chemical", 
        "organelle", "ecology", "genetics", "science", "sci_"
    ]):
        return "Science"
    if skill_id in (301, 302, 303) or any(k in name_lower for k in [
        "grammar", "vocabulary", "english", "syntax", "comprehension", "reading", 
        "sentence", "preposition", "literature", "poetry", "essay", "punctuation"
    ]):
        return "English"
    return "Mathematics"

def get_student_learning_twin(db: Session, student_id: int, subject: Any = None) -> Dict[str, Any]:
    """
    Generates dynamic Learning Twin representation for student concept state,
    optionally scoped to a specific subject (e.g. Computer Science, Mathematics).
    """
    # Fetch all skills
    all_skills = db.query(models.Skill).all()
    
    target_subject = subject.strip() if subject and str(subject).strip().lower() != "all" else None
    
    # Filter skills if subject is specified
    if target_subject:
        skills = [s for s in all_skills if classify_skill_subject(s.skill_name, s.skill_id).lower() == target_subject.lower()]
        # If no skills registered yet for this subject, fall back to all
        if not skills:
            skills = all_skills
    else:
        skills = all_skills

    skill_dict = {s.skill_id: s.skill_name for s in skills}
    target_skill_ids = set(skill_dict.keys())

    # Fetch student masteries
    masteries = db.query(models.StudentSkillMastery).filter(
        models.StudentSkillMastery.student_id == student_id
    ).all()
    mastery_map = {m.skill_id: m.mastery for m in masteries}

    # Factor in QuizAttempts if available to ensure live sync
    quiz_attempts_query = db.query(models.QuizAttempt).filter(models.QuizAttempt.student_id == student_id)
    if target_subject:
        quiz_attempts_query = quiz_attempts_query.filter(func.lower(models.QuizAttempt.subject) == target_subject.lower())
    quiz_attempts = quiz_attempts_query.all()

    for att in quiz_attempts:
        for s_id, s_name in skill_dict.items():
            if s_name.lower() in att.topic_name.lower() or att.topic_name.lower() in s_name.lower():
                normalized_score = max(0.05, min(0.99, att.percentage / 100.0))
                if mastery_map.get(s_id, 0.0) < normalized_score:
                    mastery_map[s_id] = normalized_score

    # Fetch interactions for relevant skills
    int_query = db.query(models.Interaction).filter(models.Interaction.student_id == student_id)
    if target_subject:
        int_query = int_query.filter(models.Interaction.skill_id.in_(target_skill_ids))
    interactions = int_query.order_by(models.Interaction.created_at.desc()).all()

    # Pre-aggregate interactions per skill
    skill_practice_map = {}
    for i in interactions:
        skill_practice_map[i.skill_id] = skill_practice_map.get(i.skill_id, 0) + 1

    all_skills_data = []
    strong_concepts = []
    developing_concepts = []
    weak_concepts = []

    total_mastery_sum = 0.0
    attempted_skills_count = 0

    for s_id, s_name in skill_dict.items():
        m_val = mastery_map.get(s_id, 0.0)
        total_mastery_sum += m_val
        if m_val > 0.0:
            attempted_skills_count += 1
        status = get_mastery_label(m_val)
        subj = classify_skill_subject(s_name, s_id)
        p_count = skill_practice_map.get(s_id, 0)

        skill_info = {
            "skill_id": s_id,
            "skill_name": s_name,
            "subject": subj,
            "mastery": round(m_val * 100, 1),
            "status": status,
            "practice_count": p_count
        }

        all_skills_data.append(skill_info)

        if m_val >= MASTERY_HIGH_THRESHOLD:
            strong_concepts.append(skill_info)
        elif m_val >= MASTERY_MED_THRESHOLD:
            developing_concepts.append(skill_info)
        elif m_val > 0.0:
            weak_concepts.append(skill_info)

    overall_mastery = round((total_mastery_sum / max(1, len(skill_dict))) * 100, 1) if skill_dict else 0.0

    total_attempts = len(interactions) + len(quiz_attempts)
    correct_count = sum(1 for i in interactions if i.correct == 1) + sum(a.score for a in quiz_attempts)
    total_q_count = len(interactions) + sum(a.total_questions for a in quiz_attempts)
    recent_accuracy = round((correct_count / total_q_count * 100), 1) if total_q_count > 0 else 0.0

    avg_hints = round(sum(i.hint_count for i in interactions) / max(1, len(interactions)), 1) if interactions else 0.0
    avg_response_time = round(sum(i.ms_first_response for i in interactions) / max(1, len(interactions)), 0) if interactions else 0.0

    return {
        "student_id": student_id,
        "selected_subject": target_subject or "All Subjects",
        "overall_mastery": overall_mastery,
        "recent_accuracy": recent_accuracy,
        "total_questions_attempted": total_attempts,
        "avg_hints_per_question": avg_hints,
        "avg_response_time_ms": avg_response_time,
        "all_skills": all_skills_data,
        "strong_concepts": strong_concepts,
        "developing_concepts": developing_concepts,
        "weak_concepts": weak_concepts
    }
