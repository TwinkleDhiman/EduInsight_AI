"""
Test Topic Endpoints and Topic Filtering
"""
from fastapi.testclient import TestClient
import main
from main import app
from database import SessionLocal
import models
from auth import create_access_token

client = TestClient(app)
db = SessionLocal()

# Ensure we have a student and skills in DB
student = db.query(models.Student).first()
if student:
    token = create_access_token(data={"sub": student.user.email, "role": "STUDENT"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Test topics endpoint
    res_topics = client.get(f"/api/student/{student.id}/topics", headers=headers)
    print("Topics Status:", res_topics.status_code)
    topics_data = res_topics.json()
    print(f"Total topics returned: {len(topics_data.get('topics', []))}")
    assert res_topics.status_code == 200
    assert len(topics_data.get('topics', [])) > 0

    first_topic = topics_data['topics'][0]
    print(f"First topic: {first_topic['skill_name']} (ID: {first_topic['skill_id']}) with {first_topic['question_count']} questions")

    # 2. Test quiz filtered by skill_id
    res_filtered = client.get(f"/api/student/{student.id}/quiz?skill_id={first_topic['skill_id']}", headers=headers)
    print("Filtered Quiz Status:", res_filtered.status_code)
    filtered_qs = res_filtered.json()
    print(f"Filtered questions returned: {len(filtered_qs)}")
    assert res_filtered.status_code == 200
    for q in filtered_qs:
        assert q['skill_id'] == first_topic['skill_id']

    # 3. Test quiz all questions
    res_all = client.get(f"/api/student/{student.id}/quiz", headers=headers)
    print(f"All questions returned: {len(res_all.json())}")
    assert res_all.status_code == 200

    print("\n[SUCCESS] Topics and skill-based quiz filtering verified 100%!")
else:
    print("No student found in DB. Seeding may be needed first.")

db.close()
