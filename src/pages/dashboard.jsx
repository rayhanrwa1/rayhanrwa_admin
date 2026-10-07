import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [projRes, statRes] = await Promise.all([
          axios.get(`${BASE_URL}/projects`),
          axios.get(`${BASE_URL}/stats`)
        ]);
        setProjects(projRes.data.data || []);
        setStats(statRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-[13px] text-gray-500 mt-1">Operational overview.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Total Projects</h3>
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Total Stats</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">System Status</h3>
          <p className="text-2xl font-bold text-green-600">Online</p>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-end">
        <h2 className="text-[15px] font-bold text-gray-900">Recent Projects</h2>
        <a href="/projects" className="text-[13px] font-semibold text-gray-900 hover:underline">View All</a>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-5 py-6 text-center text-[13px] text-gray-500">Loading data...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-5 py-6 text-center text-[13px] text-gray-500">No records found.</td>
                </tr>
              ) : (
                projects.slice(0, 5).map((proj) => (
                  <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-[13px] font-semibold text-gray-900">{proj.title}</td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">{proj.category}</td>
                    <td className="px-5 py-4 text-[13px]">
                      <span className="text-gray-600">Published</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </Layout>
  );
}