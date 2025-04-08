'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Database, File, FileText, Loader2, PlusCircle, RefreshCw, Upload } from 'lucide-react';

interface ModeloCRM {
  id: string;
  nome: string;
  arquivo: string;
  descricao: string;
  createdAt: string;
  updatedAt: string;
}

export default function ModelosContent() {
  const [modelos, setModelos] = useState<ModeloCRM[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const searchParams = useSearchParams();
  const wl_id = searchParams.get('wl_id') || '1';

  const [newModelo, setNewModelo] = useState({
    nome: '',
    descricao: '',
    arquivo: ''
  });

  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');

  const columns = [
    { 
      key: 'nome', 
      title: 'Nome',
      render: (modelo: ModeloCRM) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>{modelo.nome}</span>
        </div>
      )
    },
    { key: 'descricao', title: 'Descrição' },
    {
      key: 'arquivo',
      title: 'Arquivo',
      render: (modelo: ModeloCRM) => (
        <div className="flex items-center gap-2">
          <File className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">{modelo.arquivo}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      render: (modelo: ModeloCRM) => (
        <span className="text-gray-400">
          {new Date(modelo.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (modelo: ModeloCRM) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => downloadModelo(modelo.id)}
            className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-md text-xs hover:bg-blue-900/50 transition-colors"
          >
            Download
          </button>
        </div>
      )
    }
  ];

  const fetchModelos = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const response = await fetch('/api/modelos/listar');
      const data = await response.json();
      
      if (data.success) {
        setModelos(data.modelos || []);
      } else {
        setError(data.message || 'Erro ao carregar modelos');
      }
    } catch (err) {
      setError('Erro ao carregar modelos');
      console.error('Erro ao buscar modelos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      try {
        const fileContent = await selectedFile.text();
        setNewModelo({
          ...newModelo,
          arquivo: fileContent
        });
      } catch (error) {
        console.error("Erro ao ler arquivo:", error);
        setError("Erro ao ler arquivo JSON");
      }
    }
  };

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewModelo({
      ...newModelo,
      arquivo: e.target.value
    });
  };

  const validateJsonText = (): boolean => {
    if (!newModelo.arquivo) return false;
    
    try {
      JSON.parse(newModelo.arquivo);
      return true;
    } catch (error) {
      setError("JSON inválido. Verifique a formatação.");
      return false;
    }
  };

  const uploadModelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelo.arquivo) {
      setError('Por favor, insira o conteúdo JSON');
      return;
    }

    if (!newModelo.nome) {
      setError('Por favor, informe um nome para o modelo');
      return;
    }

    // Validar JSON se estiver no modo texto
    if (inputMode === 'text' && !validateJsonText()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/modelos/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: newModelo.nome,
          descricao: newModelo.descricao,
          arquivo: newModelo.arquivo
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewModelo({
          nome: '',
          descricao: '',
          arquivo: ''
        });
        setFile(null);
        fetchModelos();
      } else {
        setError(data.message || 'Erro ao criar modelo');
      }
    } catch (err) {
      console.error('Erro ao criar modelo:', err);
      setError('Erro ao criar modelo');
    } finally {
      setLoading(false);
    }
  };

  const downloadModelo = async (id: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/modelos/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const blob = new Blob([data.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `modelo-${id}.json`;
        document.body.appendChild(a);
        a.click();
        
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError(data.message || 'Erro ao baixar modelo');
      }
    } catch (err) {
      console.error('Erro ao baixar modelo:', err);
      setError('Erro ao baixar modelo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelos();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Modelos CRM</h2>
          <p className="text-gray-400">Gerenciar modelos para emails e formulários</p>
        </div>
        
        <button 
          onClick={() => fetchModelos(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm 
                    bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white 
                    transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Atualizar</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3 text-red-300">
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Form */}
        <div className="lg:col-span-1 bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-800/70 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium">Novo Modelo</h3>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center">
              <PlusCircle className="h-3.5 w-3.5 text-blue-500" />
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={uploadModelo} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Nome</label>
                <input
                  type="text"
                  value={newModelo.nome}
                  onChange={(e) => setNewModelo({ ...newModelo, nome: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="Nome do modelo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">Descrição</label>
                <textarea
                  value={newModelo.descricao}
                  onChange={(e) => setNewModelo({ ...newModelo, descricao: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 min-h-20
                            text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:border-transparent transition-shadow"
                  placeholder="Descrição do modelo"
                />
              </div>
              
              {/* Opções de entrada */}
              <div className="flex border border-gray-700/50 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`flex-1 py-2 text-center text-sm ${
                    inputMode === 'file' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2 text-center text-sm ${
                    inputMode === 'text' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800/60 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  Texto
                </button>
              </div>
              
              {/* Conteúdo JSON */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400 block">
                  {inputMode === 'file' ? 'Arquivo JSON' : 'JSON (texto)'}
                </label>
                
                {inputMode === 'file' ? (
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      accept=".json"
                    />
                    <div className="border border-dashed border-gray-700/70 rounded-lg px-4 py-8 text-center">
                      <Database className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400">
                        {file ? file.name : "Arraste um arquivo JSON ou clique para selecionar"}
                      </p>
                      {file && (
                        <p className="text-xs text-blue-400 mt-1">Arquivo selecionado</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={newModelo.arquivo}
                    onChange={handleJsonTextChange}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 min-h-32
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow font-mono text-sm"
                    placeholder='{\n  "campo": "valor",\n  "outrocampo": "outrovalor"\n}'
                    required
                  />
                )}
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || (inputMode === 'file' && !file)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg
                            font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:ring-offset-2 focus:ring-offset-gray-900
                            disabled:bg-blue-800/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modelos Table */}
        <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-800/70 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium">Lista de Modelos</h3>
              </div>
              <div className="text-sm text-gray-400">
                {modelos.length} {modelos.length === 1 ? 'modelo' : 'modelos'}
              </div>
            </div>
          </div>
          
          {modelos.length > 0 ? (
            <div className="p-0">
              <DataTable columns={columns} data={modelos} />
            </div>
          ) : (
            <div className="p-8 text-center">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-400">Carregando modelos...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="h-12 w-12 text-gray-700" />
                  <p className="text-gray-400">Nenhum modelo encontrado.</p>
                  <p className="text-xs text-gray-500">
                    Faça upload de um modelo para começar
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 