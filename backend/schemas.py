from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

# Auth Schemas
class TeacherItem(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "STUDENT"  # STUDENT, TEACHER, or ADMIN
    student_code: Optional[int] = None
    teacher_id: Optional[int] = None
    class_name: Optional[str] = "Class 10-A"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    student_id: Optional[int] = None
    name: str
    email: str
    has_activity: Optional[bool] = False
    teacher_subject: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: Optional[str] = "Active"
    class_name: Optional[str] = "Class 10-A"
    student_id: Optional[int] = None
    student_code: Optional[int] = None
    teacher_id: Optional[int] = None
    teacher_name: Optional[str] = None
    has_activity: Optional[bool] = False

    class Config:
        from_attributes = True

# Admin Schemas
class UserAdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = "password123"
    role: str = "STUDENT"
    status: str = "Active"
    class_name: Optional[str] = "Class 10-A"
    subject: Optional[str] = None
    teacher_id: Optional[int] = None

class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None
    class_name: Optional[str] = None
    subject: Optional[str] = None
    teacher_id: Optional[int] = None

class UserAdminItem(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str
    class_name: Optional[str] = None
    created_at: Optional[str] = None

# Learning Activity Schemas
class LearningActivityCreate(BaseModel):
    title: str
    subject: str
    topic: str
    status: str = "Published"
    time_limit: int = 20
    description: Optional[str] = None

class LearningActivityUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    status: Optional[str] = None
    time_limit: Optional[int] = None
    description: Optional[str] = None

class LearningActivityItem(BaseModel):
    id: int
    title: str
    subject: str
    topic: str
    status: str
    time_limit: int
    description: Optional[str] = None
    created_at: Optional[str] = None

# Teacher Quiz Question Schemas
class TeacherQuizQuestionCreate(BaseModel):
    skill_id: Optional[int] = None
    topic: Optional[str] = None
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str  # A, B, C, or D

# Quiz Submission Schema
class QuizSubmission(BaseModel):
    question_id: Optional[int] = None
    selected_option: Optional[str] = None
    attempt_count: int = 1
    hint_count: int = 0
    ms_first_response: float = 5000.0
    bottom_hint: int = 0
    actions: int = 1
    overlap_time: float = 5000.0

    # Fields for complete quiz submission
    activity_id: Optional[int] = None
    topic_id: Optional[str] = None
    topic_name: Optional[str] = None
    skill_id: Optional[Any] = None
    subject: Optional[str] = None
    score: Optional[int] = None
    total_questions: Optional[int] = None
    correct_count: Optional[int] = None
    time_spent_seconds: Optional[int] = 0
    answers: Optional[Dict[str, Any]] = None
    wrong_questions: Optional[List[Any]] = None

class QuizCompleteSubmission(BaseModel):
    activity_id: Optional[int] = None
    topic_id: Optional[str] = None
    topic_name: Optional[str] = None
    skill_id: Optional[Any] = None
    subject: Optional[str] = "Mathematics"
    score: int
    total_questions: int
    correct_count: Optional[int] = None
    time_spent_seconds: Optional[int] = 0
    answers: Optional[Dict[str, Any]] = None
    wrong_questions: Optional[List[Any]] = None

# Skill & Mastery Schemas
class SkillMasterySchema(BaseModel):
    skill_id: int
    skill_name: str
    mastery: float
    status: str  # Mastered, Developing, Needs Improvement

class WeakSkillSchema(BaseModel):
    skill_id: int
    skill_name: str
    mastery: float

class StrongSkillSchema(BaseModel):
    skill_id: int
    skill_name: str
    mastery: float

# Risk Prediction Schema
class RiskInfoSchema(BaseModel):
    model_config = {"protected_namespaces": ()}
    level: str  # HIGH, MEDIUM, LOW
    probability: float
    model_name: str = "XGBoost"

# SHAP Explanation Schema
class ShapFeatureContribution(BaseModel):
    feature_name: str
    friendly_label: str
    value: float
    shap_value: float
    impact: str  # "Increases Risk" or "Decreases Risk"

class ShapExplanationResponse(BaseModel):
    student_id: int
    title: str = "Why am I at risk?"
    risk_level: str
    risk_probability: float
    top_bullets: List[str]
    feature_contributions: List[ShapFeatureContribution]

# Recommendation Schema
class RecommendationSchema(BaseModel):
    id: Optional[int] = None
    recommendation_type: str
    title: str
    explanation: str
    priority: str  # HIGH, MEDIUM, LOW
    suggested_action: str
    skill_id: Optional[int] = None

# Recent Activity / History Schema
class RecentActivitySchema(BaseModel):
    id: int
    skill_name: str
    correct: bool
    attempt_count: int
    hint_count: int
    created_at: str

# Student Dashboard Response Schema
class StudentInfo(BaseModel):
    id: int
    student_code: int
    name: str
    email: str

class StudentDashboardResponse(BaseModel):
    student: StudentInfo
    overall_mastery: float
    questions_attempted: int
    risk: RiskInfoSchema
    skills: List[SkillMasterySchema]
    weak_skills: List[WeakSkillSchema]
    strong_skills: List[StrongSkillSchema]
    recommendations: List[RecommendationSchema]
    recent_performance: List[RecentActivitySchema]

# AI Quiz Generation Schemas
class AIQuizGenerateRequest(BaseModel):
    subject: str = "Computer Science"
    topic: str = "Variables, Loops & Data Structures"
    difficulty: str = "Medium"  # Easy, Medium, Hard
    num_questions: int = 5
    focus: Optional[str] = "balanced"  # balanced, conceptual, problem_solving, rapid_drill
