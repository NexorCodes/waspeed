'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Eye, EyeOff, Loader2, PlusCircle, RefreshCw, UserPlus, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  nome: string;
  telefone: string;
  wl_id: string;
  createdAt: string;
  expirationDate?: string;
}

export default function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const wl_id = searchParams.get('wl_id') || '1';

  const [newUser, setNewUser] = useState({
    email: '',
    senha: '',
    nome: '',
    telefone: '',
    wl_id: wl_id,
    expirationDate: ''
  });

  const columns = [
    { key: 'nome', title: 'Nome' },
    { key: 'email', title: 'Email' },
    { key: 'telefone', title: 'Telefone' },
    {
      key: 'createdAt',
      title: 'Criado em',
      render: (user: User) => (
        <span className="text-gray-400">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'expirationDate',
      title: 'Expira em',
      render: (user: User) => (
        <span className="text-gray-400">
          {user.expirationDate ? new Date(user.expirationDate).toLocaleDateString() : 'Não definido'}
        </span>
      )
    }
  ];

  const fetchUsers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const response = await fetch(`/api/users/get?wl_id=${wl_id}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewUser({ email: '', senha: '', nome: '', telefone: '', wl_id, expirationDate: '' });
        fetchUsers();
      } else {
        setError(data.message || 'Erro ao criar usuário');
      }
    } catch (err) {
      setError('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [wl_id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
          <p className="text-gray-400">Gerenciar usuários do White Label {wl_id}</p>
        </div>
        
        <button 
          onClick={() => fetchUsers(true)}
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

      <div className="grid gap-6">
        {/* Create User Card */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-800/70 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium">Adicionar Novo Usuário</h3>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center">
              <PlusCircle className="h-3.5 w-3.5 text-blue-500" />
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Nome</label>
                  <input
                    type="text"
                    value={newUser.nome}
                    onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    placeholder="Nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Telefone</label>
                  <input
                    type="tel"
                    value={newUser.telefone}
                    onChange={(e) => setNewUser({ ...newUser, telefone: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.senha}
                      onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
                      className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 pr-10
                                text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                                focus:border-transparent transition-shadow"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Data de Expiração</label>
                  <input
                    type="date"
                    value={newUser.expirationDate}
                    onChange={(e) => setNewUser({ ...newUser, expirationDate: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg
                            font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                            focus:ring-offset-2 focus:ring-offset-gray-900
                            disabled:bg-blue-800/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Criando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Criar Usuário</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-800/70 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium">Lista de Usuários</h3>
              </div>
              <div className="text-sm text-gray-400">
                {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
              </div>
            </div>
          </div>
          
          {users.length > 0 ? (
            <div className="p-0">
              <DataTable columns={columns} data={users} />
            </div>
          ) : (
            <div className="p-8 text-center">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-400">Carregando usuários...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Users className="h-12 w-12 text-gray-700" />
                  <p className="text-gray-400">Nenhum usuário encontrado.</p>
                  <p className="text-xs text-gray-500">
                    Crie um usuário para começar
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