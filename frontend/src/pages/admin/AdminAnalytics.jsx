import React, { useState, useEffect } from 'react';
import {
  Brain,
  Cpu,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const { success, error, info } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interactions/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRetrainAI = async () => {
    setRetraining(true);
    info('Triggering AI training on Python FastAPI service...');
    try {
      const res = await api.post('/recommendations/train');
      if (res.data.success) {
        success('AI Recommender successfully retrained and cached!');
        fetchAnalytics();
      } else {
        error(res.data.message || 'Retraining failed');
      }
    } catch (err) {
      error(err.response?.data?.message || 'AI service retrain failed. Please ensure the Python service is running.');
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Retrain Trigger */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Brain className="w-3.5 h-3.5" />
            <span>AI Model Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Recommendation Analytics & Retraining
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-light">
            Monitor real-time behavioral telemetry and trigger model artifact rebuilds
          </p>
        </div>

        <button
          onClick={handleRetrainAI}
          disabled={retraining}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-102 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
          <span>{retraining ? 'Training AI...' : 'Retrain AI Models Now'}</span>
        </button>
      </div>

      {/* Behavioral Signals Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-brand-600" />
          <span>Logged Behavioral Signals in MongoDB</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {analytics?.actionCounts?.map((act) => (
            <div key={act._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {act._id}
              </span>
              <p className="text-xl font-black text-slate-900">{act.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Viewed Products */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Top Viewed Products (Telemetry)</span>
          </div>

          <div className="divide-y divide-slate-100">
            {analytics?.topViewedProducts?.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-slate-50"
                  />
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.categoryName} • \${item.finalPrice}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md font-extrabold text-[11px]">
                  {item.viewCount} views
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Queries */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <Search className="w-4 h-4 text-brand-600" />
            <span>Top Search Keywords</span>
          </div>

          <div className="divide-y divide-slate-100">
            {analytics?.topSearchedTerms?.map((term) => (
              <div key={term._id} className="py-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 font-mono">
                  "{term._id}"
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px]">
                  {term.count} queries
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
