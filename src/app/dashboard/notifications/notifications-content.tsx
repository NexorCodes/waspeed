'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Bell, ChevronDown, Info, Loader2, MessageCircle, PlusCircle, RefreshCw, Send, Trash2 } from 'lucide-react';
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

interface Notification {
  id: string;
  wl_id: string;
  data: number;
  title: string;
  viewer: string;
  client: string;
  type: string;
  statement: string;
  link: string;
  btnName: string;
}

export default function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const wl_id = searchParams.get('wl_id') || '1';

  const [newNotification, setNewNotification] = useState({
    wl_id: wl_id,
    title: '',
    viewer: 'NOTIFY',
    client: 'ALL',
    type: 'INFO',
    statement: '',
    link: '',
    btnName: ''
  });

  const columns = [
    { 
      key: 'title', 
      title: 'Título',
      render: (notification: Notification) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>{notification.title}</span>
        </div>
      )
    },
    { 
      key: 'type', 
      title: 'Tipo',
      render: (notification: Notification) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-950/50 text-blue-400">
          {notification.type}
        </span>
      )
    },
    { 
      key: 'client', 
      title: 'Cliente',
      render: (notification: Notification) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          notification.client === 'ALL' ? 'bg-gray-800 text-gray-400' : 'bg-purple-950/50 text-purple-400'
        }`}>
          {notification.client}
        </span>
      )
    },
    {
      key: 'viewer',
      title: 'Visualização',
      render: (notification: Notification) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          notification.viewer === 'NOTIFY' ? 'bg-teal-950/50 text-teal-400' : 'bg-indigo-950/50 text-indigo-400'
        }`}>
          {notification.viewer}
        </span>
      )
    },
    {
      key: 'data',
      title: 'Data',
      render: (notification: Notification) => (
        <span className="text-gray-400">
          {new Date(notification.data).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      render: (notification: Notification) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a notificação.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteNotification(notification.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }
  ];

  const fetchNotifications = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const response = await fetch(`/api/notifications/get?wl_id=${wl_id}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter only INFO type notifications
        setNotifications(data.notifications.filter((n: Notification) => n.type === 'INFO'));
      } else {
        setError(data.message || 'Erro ao carregar notificações');
      }
    } catch (err) {
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNotification),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewNotification({
          wl_id,
          title: '',
          viewer: 'NOTIFY',
          client: 'ALL',
          type: 'INFO',
          statement: '',
          link: '',
          btnName: ''
        });
        fetchNotifications();
      } else {
        setError(data.message || 'Erro ao criar notificação');
      }
    } catch (err) {
      setError('Erro ao criar notificação');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchNotifications();
      } else {
        setError(data.message || 'Erro ao excluir notificação');
      }
    } catch (err) {
      setError('Erro ao excluir notificação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [wl_id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Notificações</h2>
          <p className="text-gray-400">Gerenciar notificações do White Label {wl_id}</p>
        </div>
        
        <button 
          onClick={() => fetchNotifications(true)}
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
        {/* Create Notification Card */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-800/70 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium">Adicionar Nova Notificação</h3>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center">
              <PlusCircle className="h-3.5 w-3.5 text-blue-500" />
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={createNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Título</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    placeholder="Título da notificação"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Visualização</label>
                  <select
                    value={newNotification.viewer}
                    onChange={(e) => setNewNotification({ ...newNotification, viewer: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                  >
                    <option value="NOTIFY">Notificação</option>
                    <option value="MESSAGE">Mensagem</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Cliente</label>
                  <select
                    value={newNotification.client}
                    onChange={(e) => setNewNotification({ ...newNotification, client: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                  >
                    <option value="ALL">Todos</option>
                    <option value="SPECIFIC">Específico</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Mensagem</label>
                  <textarea
                    value={newNotification.statement}
                    onChange={(e) => setNewNotification({ ...newNotification, statement: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    placeholder="Mensagem da notificação"
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Link</label>
                  <input
                    type="text"
                    value={newNotification.link}
                    onChange={(e) => setNewNotification({ ...newNotification, link: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Nome do Botão</label>
                  <input
                    type="text"
                    value={newNotification.btnName}
                    onChange={(e) => setNewNotification({ ...newNotification, btnName: e.target.value })}
                    className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 
                              text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 
                              focus:border-transparent transition-shadow"
                    placeholder="Clique aqui"
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
                    'Criar Notificação'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-800/70 px-6 py-4">
            <h3 className="font-medium">Lista de Notificações</h3>
          </div>
          <div className="p-6">
            <DataTable
              columns={columns}
              data={notifications}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 