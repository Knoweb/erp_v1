import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Alert from '../Alert/Alert';
import { FaSyncAlt, FaEye, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', cls: 'bg-blue-100 text-blue-700' },
  WORKING: { label: 'Working', cls: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
};

const PRIORITY_CONFIG = {
  HIGH: { label: 'High', cls: 'bg-red-100 text-red-700' },
  MEDIUM: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700' },
  LOW: { label: 'Low', cls: 'bg-green-100 text-green-700' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || { label: status || '—', cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>;
};

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority?.toUpperCase()] || { label: priority || '—', cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>;
};

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [viewProject, setViewProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editCustomerId, setEditCustomerId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTotalCost, setEditTotalCost] = useState('');

  const companyId = localStorage.getItem('companyId');

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/companies/${companyId}/projects`);
      const data = response.data || response || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      Alert.error('Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/api/customers/companies/${companyId}`);
      const data = response.data || response || [];
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    fetchProjects();
    fetchCustomers();
  }, []);

  // ===== OPEN EDIT MODAL =====
  const openEdit = (project) => {
    setEditProject(project);
    setEditName(project.name || '');
    setEditStartDate(project.startDate || '');
    setEditStatus(project.workingStatus || 'ACTIVE');
    setEditPriority(project.priority || 'MEDIUM');
    setEditCustomerId(project.customerId ? String(project.customerId) : '');
    setEditDescription(project.description || '');
    setEditTotalCost(project.totalCost != null ? String(project.totalCost) : '');
  };

  const closeEdit = () => {
    setEditProject(null);
  };

  // ===== SAVE EDIT =====
  const handleSaveEdit = async () => {
    if (!editName.trim()) { Alert.error('Project name is required.'); return; }
    try {
      setIsSaving(true);
      await api.put(`/api/companies/${companyId}/projects/${editProject.id}`, {
        name: editName.trim(),
        startDate: editStartDate,
        workingStatus: editStatus,
        priority: editPriority,
        customerId: editCustomerId ? parseInt(editCustomerId) : null,
        description: editDescription,
        totalCost: editTotalCost ? parseInt(editTotalCost) : null,
      });
      Alert.success('Project updated successfully!');
      closeEdit();
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.error(error.response?.data?.error || 'Failed to update project.');
    } finally {
      setIsSaving(false);
    }
  };

  // ===== CONFIRM DELETE =====
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/companies/${companyId}/projects/${deleteProject.id}`);
      Alert.success('Project deleted successfully!');
      setDeleteProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.error(error.response?.data?.error || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">All Projects</h2>
        <button
          onClick={fetchProjects}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Project Code</th>
              <th className="py-3 px-4 text-left">Project Name</th>
              <th className="py-3 px-4 text-left">Start Date</th>
              <th className="py-3 px-4 text-left">Priority</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Customer</th>
              <th className="py-3 px-4 text-left">Total Cost</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.id} className="border-t hover:bg-gray-50 transition text-sm">
                <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                <td className="py-3 px-4 font-mono text-blue-700">{project.code || '—'}</td>
                <td className="py-3 px-4 font-medium text-gray-800">{project.name}</td>
                <td className="py-3 px-4 text-gray-600">{project.startDate || '—'}</td>
                <td className="py-3 px-4"><PriorityBadge priority={project.priority} /></td>
                <td className="py-3 px-4"><StatusBadge status={project.workingStatus} /></td>
                <td className="py-3 px-4 text-gray-600">{project.customerName || '—'}</td>
                <td className="py-3 px-4 text-gray-800">
                  {project.totalCost != null ? `Rs. ${Number(project.totalCost).toLocaleString()}` : '—'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center items-center gap-2">
                    {/* VIEW */}
                    <button
                      onClick={() => setViewProject(project)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                      title="View"
                    >
                      <FaEye size={12} /> View
                    </button>
                    {/* EDIT */}
                    <button
                      onClick={() => openEdit(project)}
                      className="flex items-center gap-1 px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white text-xs rounded transition"
                      title="Edit"
                    >
                      <FaEdit size={12} /> Edit
                    </button>
                    {/* DELETE */}
                    <button
                      onClick={() => setDeleteProject(project)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition"
                      title="Delete"
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td className="py-10 px-4 text-center text-gray-500" colSpan="9">
                  No projects found. Create your first project using the sidebar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== VIEW MODAL ===== */}
      {viewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setViewProject(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FaTimes size={18} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">Project Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs mb-1">Project Code</p><p className="font-mono font-semibold text-blue-700">{viewProject.code}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Project Name</p><p className="font-semibold">{viewProject.name}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Start Date</p><p>{viewProject.startDate || '—'}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Priority</p><PriorityBadge priority={viewProject.priority} /></div>
              <div><p className="text-gray-500 text-xs mb-1">Status</p><StatusBadge status={viewProject.workingStatus} /></div>
              <div><p className="text-gray-500 text-xs mb-1">Customer</p><p>{viewProject.customerName || '—'}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Total Cost</p><p className="font-semibold">{viewProject.totalCost != null ? `Rs. ${Number(viewProject.totalCost).toLocaleString()}` : '—'}</p></div>
              {viewProject.description && (
                <div className="col-span-2"><p className="text-gray-500 text-xs mb-1">Description</p><p className="text-gray-700">{viewProject.description}</p></div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewProject(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeEdit} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FaTimes size={18} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">Edit Project</h3>

            <div className="space-y-4 text-sm">
              {/* Code - read only */}
              <div>
                <label className="block text-gray-500 text-xs mb-1">Project Code</label>
                <input value={editProject.code} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100 font-mono cursor-not-allowed text-gray-600" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Project Name <span className="text-red-500">*</span></label>
                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                  <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
                    <option value="ACTIVE">Active</option>
                    <option value="WORKING">Working</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Priority</label>
                  <select value={editPriority} onChange={e => setEditPriority(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Customer</label>
                  <select value={editCustomerId} onChange={e => setEditCustomerId(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400">
                    <option value="">None</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Total Cost (Rs.)</label>
                <input type="number" min="0" value={editTotalCost} onChange={e => setEditTotalCost(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="0" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Project description..." />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeEdit} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm" disabled={isSaving}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={isSaving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 transition">
                <FaSave size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {deleteProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setDeleteProject(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <FaTimes size={18} />
            </button>
            <div className="text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <FaTrash className="text-red-500" size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Project?</h3>
              <p className="text-gray-600 text-sm mb-1">You are about to delete:</p>
              <p className="font-semibold text-gray-800 mb-1">{deleteProject.name}</p>
              <p className="font-mono text-blue-600 text-sm mb-4">{deleteProject.code}</p>
              <p className="text-red-500 text-sm mb-6">⚠️ This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteProject(null)} disabled={isDeleting} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-50 transition">
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProjects;
