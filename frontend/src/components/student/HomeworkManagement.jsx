import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaClock, FaFileUpload, FaBook, FaUserTie } from 'react-icons/fa';

const HomeworkManagement = () => {
  const [homeworkData, setHomeworkData] = useState({
    pending: [],
    overdue: [],
    submitted: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    content: '',
    attachment: null,
  });

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const { data } = await studentService.getHomework();
      setHomeworkData(data.data || { pending: [], overdue: [], submitted: [] });
    } catch (error) {
      toast.error('Failed to fetch homework');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('homeworkId', selectedHomework._id);
    formData.append('content', submitForm.content);
    if (submitForm.attachment) {
      formData.append('attachment', submitForm.attachment);
    }

    try {
      await studentService.submitHomework(formData);
      toast.success('Homework submitted successfully!');
      setShowSubmitModal(false);
      setSelectedHomework(null);
      setSubmitForm({ content: '', attachment: null });
      fetchHomework();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit homework');
    }
  };

  const openSubmitModal = (homework) => {
    setSelectedHomework(homework);
    setShowSubmitModal(true);
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const stats = {
    pending: homeworkData.pending.length,
    overdue: homeworkData.overdue.length,
    submitted: homeworkData.submitted.length,
    total: homeworkData.pending.length + homeworkData.overdue.length + homeworkData.submitted.length,
  };

  const renderHomeworkCard = (homework) => {
    const isOverdue = activeTab === 'overdue';
    const isPending = activeTab === 'pending';
    const isSubmitted = activeTab === 'submitted';
    const daysRemaining = getDaysRemaining(homework.dueDate);

    return (
      <div key={homework._id} className={`p-6 border-l-4 ${
        isOverdue ? 'border-red-500 bg-red-50' : 
        isPending ? 'border-yellow-500 bg-yellow-50' : 
        'border-green-500 bg-green-50'
      }`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FaBook className={`text-xl ${
                isOverdue ? 'text-red-600' : 
                isPending ? 'text-yellow-600' : 
                'text-green-600'
              }`} />
              <h3 className="text-lg font-semibold text-gray-800">
                {homework.title}
              </h3>
            </div>
            
            <p className="text-gray-700 mb-3">{homework.description}</p>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <FaUserTie className="text-blue-500" />
                <span>{homework.teacher?.userId?.name || 'Teacher'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className={isOverdue ? 'text-red-500' : 'text-blue-500'} />
                <span>Due: {new Date(homework.dueDate).toLocaleDateString()}</span>
              </div>
              {isPending && (
                <div className={`flex items-center gap-2 font-medium ${
                  daysRemaining <= 1 ? 'text-red-600' : 
                  daysRemaining <= 3 ? 'text-orange-600' : 
                  'text-green-600'
                }`}>
                  <FaClock />
                  <span>
                    {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
                  </span>
                </div>
              )}
            </div>

            {homework.attachmentUrl && (
              <a
                href={homework.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center gap-2"
              >
                <FaFileUpload />
                View Assignment Document
              </a>
            )}

            {isSubmitted && homework.submission && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Your Submission</h4>
                <p className="text-sm text-gray-600 mb-2">{homework.submission.content}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    Submitted on: {new Date(homework.submission.submittedAt).toLocaleDateString()}
                  </span>
                  {homework.submission.marks !== undefined && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      Marks: {homework.submission.marks} / {homework.submission.totalMarks || 100}
                    </span>
                  )}
                  {homework.submission.feedback && (
                    <span className="text-blue-600">📝 Feedback available</span>
                  )}
                </div>
                {homework.submission.feedback && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Teacher's Feedback:</strong> {homework.submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {(isPending || isOverdue) && (
            <button
              onClick={() => openSubmitModal(homework)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isOverdue 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Submit Now
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Homework & Assignments</h1>
        <p className="text-gray-600 mt-1">Complete and submit your homework on time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total Assignments</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Overdue</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Submitted</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.submitted}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-2">
          {['pending', 'overdue', 'submitted'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab} {tab === 'pending' && `(${stats.pending})`}
              {tab === 'overdue' && `(${stats.overdue})`}
              {tab === 'submitted' && `(${stats.submitted})`}
            </button>
          ))}
        </div>
      </div>

      {/* Homework List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading homework...</p>
          </div>
        ) : (
          <div className="divide-y">
            {activeTab === 'pending' && homeworkData.pending.length === 0 && (
              <div className="p-8 text-center">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">Great! No pending homework</p>
              </div>
            )}
            {activeTab === 'overdue' && homeworkData.overdue.length === 0 && (
              <div className="p-8 text-center">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">No overdue homework!</p>
              </div>
            )}
            {activeTab === 'submitted' && homeworkData.submitted.length === 0 && (
              <div className="p-8 text-center">
                <FaExclamationTriangle className="text-6xl text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-500">No submissions yet</p>
              </div>
            )}
            
            {homeworkData[activeTab].map(renderHomeworkCard)}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Submit Homework</h2>
              <p className="text-gray-600 mt-1">{selectedHomework.title}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer/Solution</label>
                <textarea
                  value={submitForm.content}
                  onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your answer or solution here..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setSubmitForm({ ...submitForm, attachment: e.target.files[0] })}
                    className="hidden"
                    id="homework-file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="homework-file-upload" className="cursor-pointer">
                    <FaFileUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {submitForm.attachment ? submitForm.attachment.name : 'Click to upload your work (PDF, DOC, Images)'}
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Homework
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedHomework(null);
                    setSubmitForm({ content: '', attachment: null });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkManagement;
