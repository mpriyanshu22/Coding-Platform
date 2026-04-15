import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { Code2, Trophy, ArrowRight, CheckCircle2, Search, Filter, Sparkles } from 'lucide-react';

const HomePage = () => {
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const directoryRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [problemsRes, solvedRes] = await Promise.all([
          axiosClient.get('/admin/fetchAll/1/50'),
          axiosClient.get('/admin/solvedByUser'),
        ]);
        setProblems(problemsRes.data || []);
        const solved = new Set((solvedRes.data || []).map((p) => p._id));
        setSolvedIds(solved);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProblems = useMemo(() => {
    return problems.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [problems, searchQuery]);

  const scrollToDirectory = () => {
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-success bg-success/10 border-success/20',
      medium: 'text-warning bg-warning/10 border-warning/20',
      hard: 'text-error bg-error/10 border-error/20'
    };
    return colors[difficulty?.toLowerCase()] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  };

  const solvedCount = solvedIds.size;
  const progressPercent = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-base-200/50 pb-20">
      {/* Hero Section */}
      <div className="hero bg-base-100 pt-16 pb-32 border-b border-base-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-60"></div>

        <div className="hero-content text-center relative z-10 w-full max-w-4xl">
          <div className="w-full">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-base-content mb-6">
              Master Your <span className="text-primary italic">Craft.</span>
            </h1>
            <p className="py-2 text-lg text-base-content/60 mb-10 max-w-2xl mx-auto">
              Level up your coding game with our hand-picked algorithmic challenges.
            </p>

            {!loading && (
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 w-full max-w-3xl mx-auto">
                <div className="flex-1 bg-base-100 border border-base-300 shadow-xl shadow-primary/5 rounded-3xl p-6 text-left">
                  <div className="text-[10px] uppercase tracking-[0.2em] font-black text-base-content/40 mb-2">My Stats</div>
                  <div className="flex items-end gap-3 mb-4">
                    <div className="text-4xl font-black text-primary font-mono">{solvedCount}</div>
                    <div className="text-xs font-black text-success mb-1 uppercase tracking-wider">↑ {progressPercent}% Done</div>
                  </div>
                  <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <button
                  onClick={scrollToDirectory}
                  className="flex-1 btn btn-primary h-auto py-8 text-xl shadow-primary/30 shadow-2xl group rounded-3xl border-none"
                >
                  <span className="font-bold">Browse Challenges</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform ml-2" size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Section */}
      <div ref={directoryRef} className="max-w-6xl mx-auto p-4 md:p-8 -mt-12 relative z-20">

        {/* ONE UNIFIED DIRECTORY CARD */}
        <div className="bg-base-100 rounded-[2.5rem] shadow-2xl border border-base-200 overflow-hidden">

          {/* STICKY HEADER WITH SEARCH & FILTERS INSIDE */}
          <div className="p-6 md:p-8 border-b border-base-200 bg-base-100/80 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Code2 className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Challenge Directory</h2>
                  <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                    {filteredProblems.length} available tasks
                  </p>
                </div>
              </div>

              {/* SEARCH & FILTERS ROW */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Internal Searchbar */}
                <div className="relative group flex-1 sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    className="input input-sm w-full pl-10 bg-base-200/50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex bg-base-200/50 rounded-xl p-1 items-center px-3 gap-2 overflow-x-auto no-scrollbar">
                  <Filter size={14} className="text-base-content/30 shrink-0" />
                  {['Array', 'String', 'Math', 'DP'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag === searchQuery ? '' : tag)}
                      className={`btn btn-xs rounded-lg border-none shadow-none ${searchQuery === tag ? 'bg-primary text-white' : 'bg-transparent text-base-content/60 hover:bg-base-300'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-24">
                <span className="loading loading-ring loading-lg text-primary"></span>
              </div>
            ) : (
              <table className="table table-lg w-full">
                <thead>
                  <tr className="text-base-content/30 uppercase text-[10px] tracking-[0.2em] font-black border-none">
                    <th className="w-24 text-center">Status</th>
                    <th>Title</th>
                    <th className="w-32">Difficulty</th>
                    <th>Topics</th>
                  </tr>
                </thead>
                <tbody className="text-base-content/80">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((prob) => {
                      const isSolved = solvedIds.has(prob._id);
                      return (
                        <tr
                          key={prob._id}
                          className="hover:bg-primary/[0.03] transition-colors cursor-pointer group border-base-200/50"
                          onClick={() => navigate(`/problem/${prob._id}`)}
                        >
                          <td className="text-center">
                            {isSolved ? (
                              <CheckCircle2 className="text-success w-6 h-6 mx-auto" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-base-content/10 mx-auto group-hover:border-primary/40 transition-colors"></div>
                            )}
                          </td>
                          <td className="font-bold text-base group-hover:text-primary transition-colors py-6">
                            {prob.title}
                          </td>
                          <td>
                            <div className={`badge badge-sm border py-2.5 px-3 font-bold uppercase text-[10px] ${getDifficultyColor(prob.difficulty)}`}>
                              {prob.difficulty}
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {prob.tags?.split(',').map((tag, i) => (
                                <span key={i} className="badge badge-ghost badge-xs text-[9px] font-black uppercase opacity-50">{tag.trim()}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-32">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <Search size={48} />
                          <p className="font-bold uppercase tracking-widest text-xs">No matching problems found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;