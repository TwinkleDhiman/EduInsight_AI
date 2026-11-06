from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="STUDENT")  # STUDENT, TEACHER, or ADMIN
    status = Column(String(20), nullable=False, default="Active")  # Active, Inactive
    class_name = Column(String(50), nullable=True, default="Class 10-A")
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False, foreign_keys="[Student.user_id]")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_code = Column(Integer, unique=True, index=True, nullable=False)
    class_name = Column(String(50), nullable=True, default="Class 10-A")

    user = relationship("User", back_populates="student_profile", foreign_keys=[user_id])
    teacher = relationship("User", foreign_keys=[teacher_id])
    interactions = relationship("Interaction", back_populates="student")
    masteries = relationship("StudentSkillMastery", back_populates="student")
    predictions = relationship("Prediction", back_populates="student")
    recommendations = relationship("Recommendation", back_populates="student")
    quiz_attempts = relationship("QuizAttempt", back_populates="student")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, unique=True, index=True, nullable=False)
    skill_name = Column(String(255), nullable=False)

    questions = relationship("QuizQuestion", back_populates="skill")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.skill_id"), nullable=False)
    created_by_teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question = Column(Text, nullable=False)
    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)
    correct_answer = Column(String(10), nullable=False)

    skill = relationship("Skill", back_populates="questions")
    creator = relationship("User", foreign_keys=[created_by_teacher_id])

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.skill_id"), nullable=False)
    correct = Column(Integer, nullable=False)  # 0 or 1
    attempt_count = Column(Integer, default=1)
    hint_count = Column(Integer, default=0)
    ms_first_response = Column(Float, default=5000.0)
    bottom_hint = Column(Integer, default=0)
    actions = Column(Integer, default=1)
    overlap_time = Column(Float, default=5000.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="interactions")

class StudentSkillMastery(Base):
    __tablename__ = "student_skill_mastery"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.skill_id"), nullable=False)
    mastery = Column(Float, nullable=False, default=0.20)  # 0.0 to 1.0 (or percentage)

    student = relationship("Student", back_populates="masteries")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    risk_probability = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH
    model_name = Column(String(50), nullable=False, default="XGBoost")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="predictions")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.skill_id"), nullable=True)
    recommendation_type = Column(String(100), nullable=False)
    explanation = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="MEDIUM")  # HIGH, MEDIUM, LOW
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="recommendations")
 
class LearningActivity(Base):
    __tablename__ = "learning_activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)  # e.g., Mathematics, Science, English
    topic = Column(String(100), nullable=False)    # e.g., Algebra, Geometry, Biology, Grammar
    status = Column(String(20), nullable=False, default="Published")  # Published, Draft
    time_limit = Column(Integer, default=20)       # In minutes
    description = Column(Text, nullable=True)
    created_by_teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by_teacher_id])

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("learning_activities.id"), nullable=True)
    topic_id = Column(String(100), nullable=True)
    topic_name = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    time_spent_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="quiz_attempts")
    activity = relationship("LearningActivity")
