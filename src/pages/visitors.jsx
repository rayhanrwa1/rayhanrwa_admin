import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // kept for external GeoJS calls
import api from '../utils/api';
import Layout from '../components/layout';
import ReactCountryFlag from 'react-country-flag';
import { MapPin, Monitor, Wifi, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function Visitors() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState('All'); // 'All', 'Identified', 'Unknown'

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');

        const recentVisitors = response.data.data?.recent_visitors || [];

        // Enrich visitor data with GeoJS IP lookup
        const enrichedVisitors = await Promise.all(
          recentVisitors.map(async (visitor) => {
            if (visitor.ip_address && visitor.ip_address !== '127.0.0.1' && visitor.ip_address !== '::1') {
              try {
                const geoRes = await axios.get(`https://get.geojs.io/v1/ip/geo/${visitor.ip_address}.json`);
                return {
                  ...visitor,
                  geo: geoRes.data
                };
              } catch (e) {
                return visitor;
              }
            }
            return visitor;
          })
        );

        setVisitors(enrichedVisitors);
      } catch (err) {
        if (!err.response || (err.response.status !== 401 && err.response.status !== 403)) {
          console.error('Failed to fetch visitors data:', err);
        }
        // 401/403 is handled globally by api.js interceptor (redirect to /login)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Derived state: Sorted
  const sortedVisitors = useMemo(() => {
    return [...visitors].reverse();
  }, [visitors]);

  // Derived state: Filtered
  const filteredVisitors = useMemo(() => {
    return sortedVisitors.filter(visitor => {
      if (filterMode === 'All') return true;
      if (filterMode === 'Unknown') return visitor.country === 'Unknown' || !visitor.geo;
      if (filterMode === 'Identified') return visitor.country !== 'Unknown' && visitor.geo;
      return true;
    });
  }, [sortedVisitors, filterMode]);

  // Derived state: Paginated
  const totalPages = pageSize === 'All' ? 1 : Math.ceil(filteredVisitors.length / pageSize);

  const displayedVisitors = useMemo(() => {
    if (pageSize === 'All') return filteredVisitors;
    const start = (currentPage - 1) * pageSize;
    return filteredVisitors.slice(start, start + pageSize);
  }, [filteredVisitors, currentPage, pageSize]);

  const handlePageSizeChange = (e) => {
    const val = e.target.value === 'All' ? 'All' : Number(e.target.value);
    setPageSize(val);
    setCurrentPage(1); // Reset to first page
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Network Logs</h1>
          <p className="text-[13px] text-gray-500 mt-1">Detailed tracking of visitor IPs and extracted locations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#FAFAFA] gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-bold text-gray-900">Detailed Access Records</h2>
            <span className="text-[12px] font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              {filteredVisitors.length} Logs
            </span>
          </div>

          <div className="flex bg-gray-200 p-1 rounded-lg border border-gray-300 shadow-inner">
            <button
              onClick={() => handleFilterChange('All')}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${filterMode === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Logs
            </button>
            <button
              onClick={() => handleFilterChange('Identified')}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${filterMode === 'Identified' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Identified
            </button>
            <button
              onClick={() => handleFilterChange('Unknown')}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${filterMode === 'Unknown' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Unknown Loc
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-mono text-[13px] animate-pulse">Extracting IP Geolocations...</p>
          </div>
        ) : (
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FAFAFA] text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold w-[40%]">Visitor & Location</th>
                  <th className="px-6 py-4 font-semibold w-[30%]">Network (ISP)</th>
                  <th className="px-6 py-4 font-semibold w-[30%]">Device / Browser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedVisitors.map((visitor, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <div className="flex gap-3">
                        <div className="mt-1 shrink-0">
                          {visitor.country !== 'Unknown' && visitor.geo?.country_code ? (
                            <ReactCountryFlag countryCode={visitor.geo.country_code} svg style={{ width: '1.8em', height: '1.8em', borderRadius: '4px' }} />
                          ) : (
                            <div className="w-[1.8em] h-[1.8em] bg-gray-100 border border-gray-200 flex items-center justify-center rounded text-[10px] text-gray-400">?</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 font-mono">{visitor.ip_address}</div>
                          {visitor.geo ? (
                            <div className="mt-1">
                              <p className="text-gray-600 font-medium truncate">
                                {visitor.geo.city ? `${visitor.geo.city}, ` : ''}{visitor.geo.region ? `${visitor.geo.region}, ` : ''}{visitor.geo.country}
                              </p>
                              {visitor.geo.latitude && visitor.geo.longitude && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${visitor.geo.latitude},${visitor.geo.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-1 text-blue-600 hover:text-blue-800 text-[12px] font-semibold transition-colors"
                                >
                                  <MapPin size={12} /> View on Map
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic mt-1 text-[12px]">Location unknown</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-gray-600">
                      <div className="flex items-start gap-2">
                        <Wifi size={14} className="mt-0.5 text-gray-400 shrink-0" />
                        <div className="min-w-0 wrap-break-word">
                          <span className="font-medium">{visitor.geo?.organization_name || visitor.geo?.organization || 'Unknown ISP'}</span>
                          <p className="text-gray-400 text-[11px] mt-1 font-mono">{visitor.geo?.asn ? `ASN: ${visitor.geo.asn}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-gray-500">
                      <div className="flex items-start gap-2">
                        <Monitor size={14} className="mt-0.5 text-gray-400 shrink-0" />
                        <span className="line-clamp-3 leading-relaxed wrap-break-word" title={visitor.user_agent}>
                          {visitor.user_agent}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedVisitors.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 italic">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter size={24} className="text-gray-300" />
                        <p>No network logs match this filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredVisitors.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-gray-600 bg-white">
                <div className="flex items-center gap-3">
                  <span className="font-medium">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border border-gray-200 rounded-md px-2 py-1 bg-white outline-none hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value="All">All</option>
                  </select>
                </div>

                {pageSize !== 'All' && (
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredVisitors.length)} of {filteredVisitors.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-1.5 border border-transparent rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="p-1.5 border border-transparent rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                        aria-label="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}