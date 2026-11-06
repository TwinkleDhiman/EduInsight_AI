import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import models

load_dotenv()

REC_HIGH_ATTEMPTS = float(os.getenv("REC_HIGH_ATTEMPTS", "2.5"))
REC_HIGH_HINTS = float(os.getenv("REC_HIGH_HINTS", "1.5"))
REC_HIGH_RESPONSE_TIME_MS = float(os.getenv("REC_HIGH_RESPONSE_TIME_MS", "10000.0"))
REC_MASTERY_LOW = float(os.getenv("REC_MASTERY_LOW", "0.40"))
REC_MASTERY_MED = float(os.getenv("REC_MASTERY_MED", "0.60"))
REC_MASTERY_HIGH = float(os.getenv("REC_MASTERY_HIGH", "0.80"))

def classify_skill_subject(skill_name: str, skill_id: int = 0) -> str:
    name = (skill_name or "").lower()
    if skill_id in (201, 202) or any(w in name for w in ['photosynthesis', 'respiration', 'biology', 'chemistry', 'cell', 'organelle', 'ecology', 'genetics', 'bonding', 'atomic']):
        return "Science"
    if skill_id in (301, 302) or any(w in name for w in ['grammar', 'sentence', 'comprehension', 'vocabulary', 'preposition', 'literature', 'poetry', 'essay', 'punctuation']):
        return "English"
    if skill_id in (401, 402) or any(w in name for w in ['algorithm', 'data structure', 'tree', 'complexity', 'programming', 'binary', 'database', 'network', 'cybersecurity', 'software']):
        return "Computer Science"
    if skill_id in (501, 502) or any(w in name for w in ['mechanics', 'energy conservation', 'kinematics', 'newton', 'joules', 'velocity', 'acceleration', 'thermodynamics', 'optics', 'electromagnetism']):
        return "Physics"
    if skill_id in (601, 602) or any(w in name for w in ['history', 'geography', 'civics', 'economics', 'civilization', 'cartography', 'governance']):
        return "Social Studies"
    return "Mathematics"

def generate_recommendations(
    db: Session,
    student_id: int,
    recent_interactions: List[models.Interaction] = None,
    subject: str = None
) -> List[Dict[str, Any]]:
    """
    Generates personalized learning recommendations based on:
    - BKT mastery levels
    - Recent accuracy
    - Attempt count
    - Hint usage
    - Response time
    - Model risk level
    - Strictly scoped to 'subject' when provided
    """
    recommendations = []

    # Fetch skill masteries
    masteries = db.query(models.StudentSkillMastery).filter(
        models.StudentSkillMastery.student_id == student_id
    ).all()

    skills = db.query(models.Skill).all()
    skill_map = {s.skill_id: s.skill_name for s in skills}

    if not recent_interactions:
        recent_interactions = db.query(models.Interaction).filter(
            models.Interaction.student_id == student_id
        ).order_by(models.Interaction.created_at.desc()).limit(10).all()

    target_subject = subject.strip() if subject and subject.strip().lower() != "all" else None

    avg_hints = sum(i.hint_count for i in recent_interactions) / max(1, len(recent_interactions))
    avg_attempts = sum(i.attempt_count for i in recent_interactions) / max(1, len(recent_interactions))
    avg_response_time = sum(i.ms_first_response for i in recent_interactions) / max(1, len(recent_interactions))

    # Check student quiz attempts to sync live attempts
    quiz_attempts_query = db.query(models.QuizAttempt).filter(models.QuizAttempt.student_id == student_id)
    if target_subject:
        quiz_attempts_query = quiz_attempts_query.filter(models.QuizAttempt.subject.ilike(f"%{target_subject}%"))
    quiz_attempts = quiz_attempts_query.all()

    # Pre-map attempts and interactions per skill
    attempted_skills = set()
    for att in quiz_attempts:
        for s_id, s_name in skill_map.items():
            if s_name.lower() in att.topic_name.lower() or att.topic_name.lower() in s_name.lower():
                attempted_skills.add(s_id)

    interactions_count_map = {}
    all_interactions = db.query(models.Interaction).filter(models.Interaction.student_id == student_id).all()
    for i in all_interactions:
        interactions_count_map[i.skill_id] = interactions_count_map.get(i.skill_id, 0) + 1
        if i.skill_id:
            attempted_skills.add(i.skill_id)

    # Sync mastery_map from quiz attempts if higher
    mastery_dict = {m.skill_id: m.mastery for m in masteries}
    for att in quiz_attempts:
        for s_id, s_name in skill_map.items():
            if s_name.lower() in att.topic_name.lower() or att.topic_name.lower() in s_name.lower():
                norm = max(0.05, min(0.99, att.percentage / 100.0))
                if mastery_dict.get(s_id, 0.0) < norm:
                    mastery_dict[s_id] = norm

    # Rule 1: High attempts pattern (only if actual attempts logged)
    if recent_interactions and len(recent_interactions) >= 3 and avg_attempts > REC_HIGH_ATTEMPTS:
        subj_label = f" in {target_subject}" if target_subject else ""
        recommendations.append({
            "recommendation_type": "Strategy Improvement",
            "title": f"Refine Solution Strategy{subj_label}",
            "subject": target_subject or "General",
            "topic_name": target_subject or "General",
            "explanation": f"You are making multiple attempts before finding the correct answer{subj_label}. Focus on analyzing problem requirements before submitting.",
            "priority": "HIGH",
            "suggested_action": "Read the problem statement carefully and outline your steps before submitting your answer.",
            "skill_id": None,
            "mastery": None,
            "is_attempted": True
        })

    # Rule 2: High hint usage pattern
    if recent_interactions and len(recent_interactions) >= 3 and avg_hints > REC_HIGH_HINTS:
        subj_label = f" in {target_subject}" if target_subject else ""
        recommendations.append({
            "recommendation_type": "Hint Reduction",
            "title": f"Build Independent Problem Solving{subj_label}",
            "subject": target_subject or "General",
            "topic_name": target_subject or "General",
            "explanation": f"Your recent activities{subj_label} rely heavily on hint prompts. Try working through steps independently first.",
            "priority": "MEDIUM",
            "suggested_action": "Attempt solving the next 3 questions without opening hints until after your first attempt.",
            "skill_id": None,
            "mastery": None,
            "is_attempted": True
        })

    # Rule 3: High response time pattern
    if recent_interactions and len(recent_interactions) >= 3 and avg_response_time > REC_HIGH_RESPONSE_TIME_MS:
        subj_label = f" in {target_subject}" if target_subject else ""
        recommendations.append({
            "recommendation_type": "Timed Practice",
            "title": f"Speed & Fluency Drills{subj_label}",
            "subject": target_subject or "General",
            "topic_name": target_subject or "General",
            "explanation": f"Your average response time is higher than expected{subj_label}. Speed practice will build confidence and recall fluency.",
            "priority": "MEDIUM",
            "suggested_action": f"Complete a 5-minute timed fluency quiz on {target_subject or 'basic'} concepts.",
            "skill_id": None,
            "mastery": None,
            "is_attempted": True
        })

    # Rule 4: Skill-specific BKT recommendations (strictly filtered by subject if requested)
    for s_id, s_name in skill_map.items():
        sk_subject = classify_skill_subject(s_name, s_id)

        # STRICT SUBJECT FILTER: Skip if not matching requested subject
        if target_subject and sk_subject.lower() != target_subject.lower():
            continue

        m_val = mastery_dict.get(s_id, 0.0)
        mastery_pct = round(m_val * 100, 1)
        has_been_attempted = (s_id in attempted_skills) or (m_val > 0.0)

        if not has_been_attempted:
            # Topic has NEVER been attempted — Authentic guidance (ZERO bluff!)
            recommendations.append({
                "recommendation_type": "Explore Topic",
                "title": f"Start Learning: {s_name}",
                "subject": sk_subject,
                "topic_name": s_name,
                "explanation": f"You have not taken a quiz on {s_name} yet. Complete your first practice quiz to establish your baseline learning trajectory.",
                "priority": "MEDIUM",
                "suggested_action": f"Start a practice quiz on {s_name} to assess your fundamentals.",
                "skill_id": s_id,
                "mastery": 0,
                "is_attempted": False
            })
        elif m_val < REC_MASTERY_LOW:
            recommendations.append({
                "recommendation_type": "Concept Revision",
                "title": f"Revise {s_name}",
                "subject": sk_subject,
                "topic_name": s_name,
                "explanation": f"Your current accuracy for {s_name} is {mastery_pct}%. Review foundational concepts and formulas to build proficiency.",
                "priority": "HIGH",
                "suggested_action": f"Review key notes and attempt 5 targeted practice questions on {s_name}.",
                "skill_id": s_id,
                "mastery": mastery_pct,
                "is_attempted": True
            })
        elif REC_MASTERY_LOW <= m_val < REC_MASTERY_HIGH:
            recommendations.append({
                "recommendation_type": "Targeted Practice",
                "title": f"Practice {s_name}",
                "subject": sk_subject,
                "topic_name": s_name,
                "explanation": f"Your mastery for {s_name} is developing at {mastery_pct}%. A few more practice sessions will achieve full mastery.",
                "priority": "MEDIUM",
                "suggested_action": f"Complete a 5-question practice set on {s_name} to push above 80%.",
                "skill_id": s_id,
                "mastery": mastery_pct,
                "is_attempted": True
            })
        elif m_val >= REC_MASTERY_HIGH:
            recommendations.append({
                "recommendation_type": "Mastery Challenge",
                "title": f"Mastery Challenge: {s_name}",
                "subject": sk_subject,
                "topic_name": s_name,
                "explanation": f"Outstanding! You've achieved high mastery ({mastery_pct}%) in {s_name}. Challenge yourself with advanced multi-step problems.",
                "priority": "LOW",
                "suggested_action": f"Attempt advanced level challenge questions in {s_name}.",
                "skill_id": s_id,
                "mastery": mastery_pct,
                "is_attempted": True
            })

    # Default fallback if no specific recommendations generated for this subject
    if not recommendations:
        active_subj = target_subject or "Curriculum"
        recommendations.append({
            "recommendation_type": "Regular Practice",
            "title": f"Take a {active_subj} Practice Quiz",
            "subject": active_subj,
            "explanation": f"Start solving quizzes in {active_subj} to initialize your personalized AI learning twin and diagnostic analytics.",
            "priority": "MEDIUM",
            "suggested_action": f"Take a 5-question quiz in {active_subj}.",
            "skill_id": None
        })

    # Sort recommendations by priority order (HIGH -> MEDIUM -> LOW)
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))

    return recommendations

def generate_class_recommendations(
    db: Session,
    subject: str = None
) -> List[Dict[str, Any]]:
    """
    Generates class-level pedagogical recommendations for teachers based on class mastery:
    - Identifies weak topics for the selected subject
    - Suggests actionable intervention strategies
    - Strictly scoped to 'subject'
    """
    target_subject = subject.strip() if subject and subject.strip().lower() != "all" else None
    skills = db.query(models.Skill).all()

    class_recs = []

    for sk in skills:
        sk_subject = classify_skill_subject(sk.skill_name, sk.skill_id)
        if target_subject and sk_subject.lower() != target_subject.lower():
            continue

        masteries = db.query(models.StudentSkillMastery).filter(
            models.StudentSkillMastery.skill_id == sk.skill_id
        ).all()

        if masteries:
            active_m = [m.mastery for m in masteries if m.mastery > 0.0]
            avg_m = (sum(active_m) / len(active_m)) if active_m else 0.0
            struggling_count = sum(1 for m in masteries if m.mastery < 0.60 and m.mastery > 0.0)

            if struggling_count >= 2 or (avg_m > 0 and avg_m < 0.50):
                class_recs.append({
                    "recommendation_type": "Class Intervention",
                    "title": f"Review Core Concepts: {sk.skill_name}",
                    "subject": sk_subject,
                    "priority": "HIGH",
                    "explanation": f"{struggling_count} student(s) have mastery below 60% in {sk.skill_name}. Average class mastery is {round(avg_m * 100, 1)}%.",
                    "suggested_action": f"Schedule a 15-minute concept review on {sk.skill_name} and assign a targeted 10-question practice set.",
                    "skill_id": sk.skill_id
                })
            elif avg_m >= 0.75:
                class_recs.append({
                    "recommendation_type": "Enrichment",
                    "title": f"Advance Class to High-Order Problems: {sk.skill_name}",
                    "subject": sk_subject,
                    "priority": "LOW",
                    "explanation": f"Class has achieved strong mastery ({round(avg_m * 100, 1)}%) in {sk.skill_name}.",
                    "suggested_action": f"Introduce multi-concept application problems for {sk.skill_name}.",
                    "skill_id": sk.skill_id
                })

    if not class_recs:
        active_subj = target_subject or "Mathematics"
        class_recs.append({
            "recommendation_type": "Quiz Assignment",
            "title": f"Assign Baseline Quiz in {active_subj}",
            "subject": active_subj,
            "priority": "MEDIUM",
            "explanation": f"Assign your class a diagnostic quiz in {active_subj} to identify individual knowledge gaps and at-risk students.",
            "suggested_action": f"Use Quiz Manager to publish a new {active_subj} quiz.",
            "skill_id": None
        })

    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    class_recs.sort(key=lambda x: priority_order.get(x["priority"], 3))
    return class_recs
