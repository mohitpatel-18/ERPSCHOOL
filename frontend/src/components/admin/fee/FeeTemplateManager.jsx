import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const FeeTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const [formData, setFormData] = useState({
    templateName: '',
    class: '',
    academicYear: '',
    components: [
      { name: 'Tuition Fee', amount: 0, frequency: 'Monthly', isOptional: false, isTaxable: false, taxPercentage: 0 }
    ],
    installmentPlans: [
      {
        planName: 'Quarterly',
        numberOfInstallments: 4,
        dueDates: [
          { installmentNumber: 1, month: 4, date: 15, percentage: 25 },
          { installmentNumber: 2, month: 7, date: 15, percentage: 25 },
          { installmentNumber: 3, month: 10, date: 15, percentage: 25 },
          { installmentNumber: 4, month: 1, date: 15, percentage: 25 },
        ],
      }
    ],
    defaultInstallmentPlan: 'Quarterly',
    discountRules: [],
    lateFeeSettings: {
      enabled: true,
      type: 'Per Day',
      amountPerDay: 10,
      flatAmount: 100,
      percentage: 1,
      graceDays: 5,
      maxLateFee: 5000,
    },
    paymentSettings: {
      allowPartialPayment: true,
      minPartialAmount: 0,
      allowOnlinePayment: true,
      allowOfflinePayment: true,
      acceptedPaymentModes: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card'],
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [templatesRes, classesRes, yearsRes] = await Promise.all([
        axios.get(`${API_URL}/fees/templates`, { headers }),
        axios.get(`${API_URL}/class`, { headers }),
        axios.get(`${API_URL}/academic-years`, { headers }),
      ]);

      setTemplates(templatesRes.data.data || []);
      setClasses(classesRes.data.data || []);
      setAcademicYears(yearsRes.data.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingTemplate) {
        await axios.put(`${API_URL}/fees/templates/${editingTemplate._id}`, formData, { headers });
        toast.success('Template updated successfully!');
      } else {
        await axios.post(`${API_URL}/fees/templates`, formData, { headers });
        toast.success('Template created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/fees/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.templateName,
      class: template.class._id,
      academicYear: template.academicYear._id,
      components: template.components,
      installmentPlans: template.installmentPlans,
      defaultInstallmentPlan: template.defaultInstallmentPlan,
      discountRules: template.discountRules,
      lateFeeSettings: template.lateFeeSettings,
      paymentSettings: template.paymentSettings,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      templateName: '',
      class: '',
      academicYear: '',
      components: [
        { name: 'Tuition Fee', amount: 0, frequency: 'Monthly', isOptional: false, isTaxable: false, taxPercentage: 0 }
      ],
      installmentPlans: [
        {
          planName: 'Quarterly',
          numberOfInstallments: 4,
          dueDates: [
            { installmentNumber: 1, month: 4, date: 15, percentage: 25 },
            { installmentNumber: 2, month: 7, date: 15, percentage: 25 },
            { installmentNumber: 3, month: 10, date: 15, percentage: 25 },
            { installmentNumber: 4, month: 1, date: 15, percentage: 25 },
          ],
        }
      ],
      defaultInstallmentPlan: 'Quarterly',
      discountRules: [],
      lateFeeSettings: {
        enabled: true,
        type: 'Per Day',
        amountPerDay: 10,
        flatAmount: 100,
        percentage: 1,
        graceDays: 5,
        maxLateFee: 5000,
      },
      paymentSettings: {
        allowPartialPayment: true,
        minPartialAmount: 0,
        allowOnlinePayment: true,
        allowOfflinePayment: true,
        acceptedPaymentModes: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Card'],
      },
    });
  };

  const addComponent = () => {
    setFormData({
      ...formData,
      components: [
        ...formData.components,
        { name: 'Tuition Fee', amount: 0, frequency: 'Monthly', isOptional: false, isTaxable: false, taxPercentage: 0 }
      ],
    });
  };

  const removeComponent = (index) => {
    const newComponents = formData.components.filter((_, i) => i !== index);
    setFormData({ ...formData, components: newComponents });
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index][field] = value;
    setFormData({ ...formData, components: newComponents });
  };

  const addDiscount = () => {
    setFormData({
      ...formData,
      discountRules: [
        ...formData.discountRules,
        {
          name: '',
          type: 'Sibling Discount',
          applicableTo: ['Tuition Fee'],
          discountType: 'Percentage',
          value: 0,
          maxAmount: null,
          isActive: true,
        }
      ],
    });
  };

  const removeDiscount = (index) => {
    const newDiscounts = formData.discountRules.filter((_, i) => i !== index);
    setFormData({ ...formData, discountRules: newDiscounts });
  };

  const updateDiscount = (index, field, value) => {
    const newDiscounts = [...formData.discountRules];
    newDiscounts[index][field] = value;
    setFormData({ ...formData, discountRules: newDiscounts });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fee Template Manager</h1>
          <p className="text-gray-600 mt-1">Create and manage fee structures for different classes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <FaPlus /> Create Template
        </button>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-2xl font-bold">Fee Templates</h2>
          <p className="text-blue-100">Manage fee structures for all classes</p>
        </div>

        {templates.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No templates created yet</p>
            <p className="text-gray-400 mt-2">Click "Create Template" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Components</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{template.templateName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{template.class?.name} {template.class?.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{template.academicYear?.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">₹{template.totalAnnualFee?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{template.components?.length || 0} components</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{template.assignedStudentsCount || 0} students</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        template.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-600 hover:text-blue-700 p-2"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal (will continue in next message due to length) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTemplate ? 'Edit Template' : 'Create Fee Template'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                  <input
                    type="text"
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} {cls.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Year</option>
                    {academicYears.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.year} - {year.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fee Components */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Fee Components</h3>
                  <button
                    type="button"
                    onClick={addComponent}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                  >
                    <FaPlus /> Add Component
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.components.map((component, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Component Name</label>
                        <select
                          value={component.name}
                          onChange={(e) => updateComponent(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded text-sm"
                        >
                          <option>Tuition Fee</option>
                          <option>Admission Fee</option>
                          <option>Development Fee</option>
                          <option>Transport Fee</option>
                          <option>Library Fee</option>
                          <option>Sports Fee</option>
                          <option>Lab Fee</option>
                          <option>Computer Fee</option>
                          <option>Activity Fee</option>
                          <option>Exam Fee</option>
                          <option>Uniform Fee</option>
                          <option>Book Fee</option>
                          <option>Hostel Fee</option>
                          <option>Caution Money</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                        <input
                          type="number"
                          value={component.amount}
                          onChange={(e) => updateComponent(index, 'amount', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                          value={component.frequency}
                          onChange={(e) => updateComponent(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border rounded text-sm"
                        >
                          <option>Monthly</option>
                          <option>Quarterly</option>
                          <option>Half-Yearly</option>
                          <option>Annual</option>
                          <option>One-Time</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={component.isOptional}
                            onChange={(e) => updateComponent(index, 'isOptional', e.target.checked)}
                            className="mr-2"
                          />
                          Optional
                        </label>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="text-red-600 hover:text-red-700 px-3 py-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Late Fee Settings */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Late Fee Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.lateFeeSettings.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        lateFeeSettings: { ...formData.lateFeeSettings, type: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option>Per Day</option>
                      <option>Flat</option>
                      <option>Percentage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount/Day</label>
                    <input
                      type="number"
                      value={formData.lateFeeSettings.amountPerDay}
                      onChange={(e) => setFormData({
                        ...formData,
                        lateFeeSettings: { ...formData.lateFeeSettings, amountPerDay: parseFloat(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grace Days</label>
                    <input
                      type="number"
                      value={formData.lateFeeSettings.graceDays}
                      onChange={(e) => setFormData({
                        ...formData,
                        lateFeeSettings: { ...formData.lateFeeSettings, graceDays: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Late Fee</label>
                    <input
                      type="number"
                      value={formData.lateFeeSettings.maxLateFee}
                      onChange={(e) => setFormData({
                        ...formData,
                        lateFeeSettings: { ...formData.lateFeeSettings, maxLateFee: parseFloat(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Rules */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Discount Rules</h3>
                  <button
                    type="button"
                    onClick={addDiscount}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
                  >
                    <FaPlus /> Add Discount
                  </button>
                </div>

                {formData.discountRules.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No discounts added</p>
                ) : (
                  <div className="space-y-3">
                    {formData.discountRules.map((discount, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={discount.name}
                            onChange={(e) => updateDiscount(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="e.g. Sibling 10%"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={discount.type}
                            onChange={(e) => updateDiscount(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm"
                          >
                            <option>Sibling Discount</option>
                            <option>Merit Scholarship</option>
                            <option>Sports Quota</option>
                            <option>Staff Child</option>
                            <option>Financial Aid</option>
                            <option>Early Bird</option>
                            <option>Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                          <select
                            value={discount.discountType}
                            onChange={(e) => updateDiscount(index, 'discountType', e.target.value)}
                            className="w-full px-3 py-2 border rounded text-sm"
                          >
                            <option>Percentage</option>
                            <option>Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="number"
                            value={discount.value}
                            onChange={(e) => updateDiscount(index, 'value', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border rounded text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeDiscount(index)}
                            className="text-red-600 hover:text-red-700 px-3 py-2"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FaSave /> {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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

export default FeeTemplateManager;
