import React, { useState, useEffect } from 'react';
import {
  Users, Search, Eye, BrainCircuit, ShieldAlert, Award,
  X, Sparkles, AlertTriangle, BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { teacherService, studentService } from '../services/api';
import LearningTwinNetwork from '../components/charts/LearningTwinNetwork';

export default function TeacherStudents({ user }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [classesList, setClassesList] = useState(['All Classes']);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const cls = await teacherService.getClasses();
      if (cls && cls.length > 0) {
        setClassesList(cls.map(c => c.name));
      }
    } catch (_) {}
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await teacherService.getStudents();
      setStudents(res || []);
    } catch (err) {
      console.error('Error fetching student roster:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const teacherSubject = user?.teacher_subject || user?.subject || 'Mathematics';

  const handleSelectStudent = async (st) => {
    setSelectedStudent(st);
    setStudentDetail(null);
    setLoadingDetail(true);
    try {
      const [twin, shap, recs] = await Promise.all([
        studentService.getLearningTwin(st.student_id || st.id, teacherSubject),
        studentService.getShap(st.student_id || st.id),
        studentService.getRecommendations(st.student_id || st.id, teacherSubject)
      ]);
      setStudentDetail({ twin, shap, recs });
    } catch (err) {
      console.error('[TeacherStudents] Error loading student detail:', err);
      setStudentDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || (s.class_name || 'Class 10-A') === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title Header matching Panel 6 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Students
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          View and manage students in your classes.
        </p>
      </div>

      {/* Filter Bar: Search + Class Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {classesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container matching Panel 6 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Class</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((st) => (
                <tr key={st.student_id || st.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{st.name}</td>
                  <td className="py-4 px-6 text-slate-600">{st.class_name || 'Class 10-A'}</td>
                  <td className="py-4 px-6 text-slate-500">{st.email}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleSelectStudent(st)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination matching Panel 6 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1-{filtered.length} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-xs">1</span>
            <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500">{selectedStudent.class_name || 'Class 10-A'} • {selectedStudent.email}</p>
              </div>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                Loading student Learning Twin & SHAP analytics...
              </div>
            ) : (
              <div className="space-y-5">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Overall Mastery</span>
                    <span className="text-2xl font-extrabold text-blue-600 mt-1 block">
                      {selectedStudent.overall_mastery || studentDetail?.twin?.overall_mastery || 65}%
                    </span>
                    <span className="text-xs text-slate-500">Bayesian Knowledge Tracing</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-400 block uppercase">Risk Evaluation</span>
                    <span className={`text-2xl font-extrabold mt-1 block ${
                      (selectedStudent.risk_level || studentDetail?.shap?.risk_level) === 'HIGH' ? 'text-rose-600' :
                      (selectedStudent.risk_level || studentDetail?.shap?.risk_level) === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {selectedStudent.risk_level || studentDetail?.shap?.risk_level || 'LOW'}
                    </span>
                    <span className="text-xs text-slate-500">XGBoost Live Model</span>
                  </div>
                </div>

                {/* Interactive Learning Twin Node Graph */}
                {studentDetail?.twin?.all_skills && (
                  <div className="pt-1">
                    <LearningTwinNetwork
                      studentName={selectedStudent.name}
                      concepts={(() => {
                        const subSkills = studentDetail.twin.all_skills.filter(sk => (sk.subject || '').toLowerCase() === teacherSubject.toLowerCase());
                        const displaySkills = subSkills.length > 0 ? subSkills : studentDetail.twin.all_skills;
                        return displaySkills.map(sk => ({
                          name: sk.skill_name,
                          status: sk.status,
                          mastery: sk.mastery
                        }));
                      })()}
                      title="Student Knowledge State Network"
                      subtitle={`Concept mastery connections in ${teacherSubject}`}
                      detailsLink={null}
                    />
                  </div>
                )}

                {/* Concept Mastery Breakdown for this teaching subject */}
                {studentDetail?.twin?.all_skills && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4 text-blue-600" />
                        Curriculum Concept Progress ({teacherSubject})
                      </h4>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {(() => {
                          const subSkills = studentDetail.twin.all_skills.filter(sk => (sk.subject || '').toLowerCase() === teacherSubject.toLowerCase());
                          return (subSkills.length > 0 ? subSkills : studentDetail.twin.all_skills).length;
                        })()} Concepts
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(() => {
                        const subSkills = studentDetail.twin.all_skills.filter(sk => (sk.subject || '').toLowerCase() === teacherSubject.toLowerCase());
                        const displaySkills = subSkills.length > 0 ? subSkills : studentDetail.twin.all_skills;
                        return displaySkills.map(sk => (
                          <div key={sk.skill_id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5">
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-800">{sk.skill_name}</span>
                              <span className={
                                sk.status === 'Mastered' ? 'text-emerald-600' :
                                sk.status === 'Developing' ? 'text-amber-600' :
                                sk.mastery > 0 ? 'text-rose-600' : 'text-slate-400'
                              }>
                                {sk.mastery > 0 ? `${sk.mastery}%` : '0%'}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  sk.status === 'Mastered' ? 'bg-emerald-500' :
                                  sk.status === 'Developing' ? 'bg-amber-500' :
                                  sk.mastery > 0 ? 'bg-rose-500' : 'bg-slate-300'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(sk.mastery > 0 ? 5 : 0, sk.mastery))}%` }}
                              />
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* SHAP Explanation */}
                {studentDetail?.shap?.top_bullets && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      SHAP Explainability Insights
                    </h4>
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      {studentDetail.shap.top_bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {studentDetail?.recs && studentDetail.recs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Recommended Learning Actions
                    </h4>
                    <div className="space-y-2">
                      {studentDetail.recs.map((rec, i) => (
                        <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                          <p className="font-bold text-slate-900">{rec.title}</p>
                          <p className="text-slate-500 mt-0.5">{rec.suggested_action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
