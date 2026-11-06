import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Plus, Edit2, Trash2, Search, CheckCircle2,
  X, Filter, ChevronLeft, ChevronRight, Layers, BookOpen
} from 'lucide-react';
import { teacherService } from '../services/api';

export default function TeacherActivities({ user, showToast }) {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formTopic, setFormTopic] = useState('Algebra');
  const [formStatus, setFormStatus] = useState('Published');
  const [formTimeLimit, setFormTimeLimit] = useState(20);
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await teacherService.getActivities();
      setActivities(res || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormSubject('Mathematics');
    setFormTopic('Algebra');
    setFormStatus('Published');
    setFormTimeLimit(20);
    setFormDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (act) => {
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormSubject(act.subject);
    setFormTopic(act.topic);
    setFormStatus(act.status);
    setFormTimeLimit(act.time_limit || 20);
    setFormDescription(act.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        // Update
        const updated = await teacherService.updateActivity(editingActivity.id, {
          title: formTitle,
          subject: formSubject,
          topic: formTopic,
          status: formStatus,
          time_limit: Number(formTimeLimit),
          description: formDescription
        });
        setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...a, ...updated } : a));
        showToast && showToast('Activity updated successfully', 'success');
      } else {
        // Create
        const created = await teacherService.createActivity({
          title: formTitle,
          subject: formSubject,
          topic: formTopic,
          status: formStatus,
          time_limit: Number(formTimeLimit),
          description: formDescription
        });
        setActivities(prev => [created, ...prev]);
        showToast && showToast('Activity added successfully', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      console.error('[TeacherActivities] Save error:', err);
      showToast && showToast('Failed to save activity. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await teacherService.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
      showToast && showToast('Activity deleted', 'info');
    } catch (err) {
      setActivities(prev => prev.filter(a => a.id !== id));
    }
  };

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject.toLowerCase().includes(search.toLowerCase()) ||
    a.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Title & Top Action Button matching Panel 5 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning Activities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Create, edit and manage your learning activities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Topic</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{act.title}</td>
                  <td className="py-4 px-6 text-slate-600">{act.subject}</td>
                  <td className="py-4 px-6 text-slate-600">{act.topic}</td>
                  <td className="py-4 px-6">
                    {act.status === 'Published' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(act)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(act.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination matching Panel 5 */}
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

      {/* Add / Edit Activity Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900">
              {editingActivity ? 'Edit Learning Activity' : 'Add New Activity'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Activity Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Algebra Basics"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    placeholder="e.g. Algebra"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time Limit (mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={formTimeLimit}
                    onChange={(e) => setFormTimeLimit(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  {editingActivity ? 'Save Changes' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
