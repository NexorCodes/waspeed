'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Loader2, RefreshCw, Save } from 'lucide-react';

interface WhiteLabel {
  id: string;
  checkout: string;
  tutorial: string;
  webhook: string;
  cor_primaria: number;
  banner?: string;
  status: string;
  install: string;
  uninstall: string;
  rewards: string;
}

export default function SettingsContent() {
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabel | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const wl_id = searchParams.get('wl_id') || '1';

  const fetchWhiteLabel = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/white-label/get?wl_id=${wl_id}`);
      const data = await response.json();
      
      if (data.success) {
        setWhiteLabel(data.whiteLabel);
      } else {
        setError(data.message || 'Erro ao carregar configurações');
      }
    } catch (err) {
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveWhiteLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      
      const response = await fetch('/api/white-label/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whiteLabel),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchWhiteLabel();
      } else {
        setError(data.message || 'Erro ao salvar configurações');
      }
    } catch (err) {
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const downloadExtension = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/extension/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wl_id })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waspeed-extension-${wl_id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Erro ao baixar extensão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhiteLabel();
  }, [wl_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!whiteLabel) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Nenhuma configuração encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
          <p className="text-gray-400">Gerenciar configurações do White Label {wl_id}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchWhiteLabel}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm 
                      bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white 
                      transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Atualizar</span>
          </button>

          <button 
            onClick={downloadExtension}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm 
                      bg-blue-600 hover:bg-blue-700 text-white 
                      transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Baixar Extensão</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3 text-red-300">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-800/70 px-6 py-4">
          <h3 className="font-medium">Configurações do White Label</h3>
        </div>
        
        <div className="p-6">
          <form onSubmit={saveWhiteLabel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Checkout URL</label>
                <input
                  type="text"
                  value={whiteLabel.checkout}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, checkout: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="https://exemplo.com/checkout"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Tutorial URL</label>
                <input
                  type="text"
                  value={whiteLabel.tutorial}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, tutorial: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="https://exemplo.com/tutorial"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Webhook URL</label>
                <input
                  type="text"
                  value={whiteLabel.webhook}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, webhook: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="https://exemplo.com/webhook"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Cor Primária</label>
                <input
                  type="number"
                  value={whiteLabel.cor_primaria}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, cor_primaria: parseInt(e.target.value) })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Banner URL</label>
                <input
                  type="text"
                  value={whiteLabel.banner || ''}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, banner: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="https://exemplo.com/banner.png"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Status</label>
                <select
                  value={whiteLabel.status}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, status: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Install URL</label>
                <input
                  type="text"
                  value={whiteLabel.install}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, install: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="https://exemplo.com/install"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Uninstall URL</label>
                <input
                  type="text"
                  value={whiteLabel.uninstall}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, uninstall: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="https://exemplo.com/uninstall"
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-gray-400 block">Rewards URL</label>
                <input
                  type="text"
                  value={whiteLabel.rewards}
                  onChange={(e) => setWhiteLabel({ ...whiteLabel, rewards: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="https://exemplo.com/rewards"
                  required
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg
                          font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                          focus:ring-offset-2 focus:ring-offset-gray-900
                          disabled:bg-blue-800/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 