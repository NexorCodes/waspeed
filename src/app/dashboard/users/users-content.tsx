'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Eye, EyeOff, Loader2, PlusCircle, RefreshCw, UserPlus, Users, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
          {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
        </span>
      )
    },
    {
      key: 'expirationDate',
      title: 'Expira em',
      render: (user: User) => (
        <span className="text-gray-400">
          {user.expirationDate ? format(new Date(user.expirationDate), 'dd/MM/yyyy', { locale: ptBR }) : 'Não definido'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingUser(user)}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-800/50 transition-colors"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
      } else {
        setError(data.message || 'Erro ao excluir usuário');
      }
    } catch (err) {
      setError('Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEditingUser(null);
        fetchUsers();
      } else {
        setError(data.message || 'Erro ao atualizar usuário');
      }
    } catch (err) {
      setError('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
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
                      className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                                text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                                focus:border-transparent transition-shadow pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                            transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Criar Usuário'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-800/70 px-6 py-4">
            <h3 className="font-medium">Lista de Usuários</h3>
          </div>
          <div className="p-6">
            <DataTable
              columns={columns}
              data={users}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900/90 border border-gray-800/50 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="border-b border-gray-800/70 px-6 py-4 flex items-center justify-between">
              <h3 className="font-medium">Editar Usuário</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Nome</label>
                  <input
                    type="text"
                    value={editingUser.nome}
                    onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Telefone</label>
                  <input
                    type="tel"
                    value={editingUser.telefone}
                    onChange={(e) => setEditingUser({ ...editingUser, telefone: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Data de Expiração</label>
                  <input
                    type="date"
                    value={editingUser.expirationDate || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, expirationDate: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 
                              transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                              transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 