import React, { useState, useMemo } from 'react';
import { useData } from '../App';
import { User, View } from '../types';
import { Plus, X, Edit, Trash2, Shield, Building, User as UserIcon, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { CLIENT_ACCESSIBLE_VIEWS } from '../constants';

const ConfirmationModal: React.FC<{
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    confirmText?: string;
    cancelText?: string;
}> = ({ title, message, onConfirm, onClose, confirmText = "Confirmar", cancelText = "Cancelar" }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-red-700/50">
                <header className="flex items-center gap-4 p-4 border-b border-red-800/50">
                    <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                    </div>
                </header>
                <main className="p-6">
                    <p className="text-sm text-gray-300">{message}</p>
                </main>
                <footer className="flex justify-end items-center p-4 border-t border-red-800/50 gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md"
                    >
                        {confirmText}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const SettingsView: React.FC = () => {
    const { users, clients, addUser, updateUser, deleteUser, currentUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const openAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        if (user.id === currentUser?.id) {
            alert("Você não pode excluir a si mesmo.");
            return;
        }
        setUserToDelete(user);
    };
    
    const handleConfirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => a.username.localeCompare(b.username));
    }, [users]);
    
    const getClientName = (clientId?: string) => {
        if (!clientId) return 'N/A';
        return clients.find(c => c.id === clientId)?.name || 'Cliente não encontrado';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Administração de Acessos</h2>
                    <p className="text-gray-400">Gerencie os usuários e suas permissões.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Adicionar Usuário
                </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Usuário</th>
                            <th scope="col" className="px-6 py-3">Função</th>
                            <th scope="col" className="px-6 py-3">Cliente Associado</th>
                            <th scope="col" className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map(user => (
                            <tr key={user.id} className="border-b border-indigo-800/30 hover:bg-gray-800/40">
                                <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                    <UserIcon size={16} />
                                    {user.username}
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === 'admin' ? (
                                        <span className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 rounded-full w-fit">
                                            <Shield size={14} /> Admin
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-sky-300 bg-sky-500/10 rounded-full w-fit">
                                            <Building size={14} /> Cliente
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">{getClientName(user.clientId)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 hover:text-white"><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteClick(user)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <UserModal
                    user={editingUser}
                    onClose={closeModal}
                />
            )}
            {userToDelete && (
                <ConfirmationModal
                    title="Confirmar Exclusão de Usuário"
                    message={`Tem certeza que deseja excluir o usuário "${userToDelete.username}"? Esta ação é permanente.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => setUserToDelete(null)}
                    confirmText="Excluir Usuário"
                />
            )}
        </div>
    );
};


const UserModal: React.FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
    const { clients, addUser, updateUser } = useData();
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'client'>(user?.role || 'client');
    const [clientId, setClientId] = useState(user?.clientId || (clients.length > 0 ? clients[0].id : ''));
    const [accessibleViews, setAccessibleViews] = useState<View[]>(user?.accessibleViews || ['dashboard', 'evolution']);
    const [error, setError] = useState('');

    const handleViewToggle = (viewId: View) => {
        setAccessibleViews(prev =>
            prev.includes(viewId) ? prev.filter(v => v !== viewId) : [...prev, viewId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!username.trim() || (!user && !password.trim())) {
            setError('Usuário e senha são obrigatórios.');
            return;
        }

        if (role === 'client' && !clientId) {
            setError('É necessário associar um cliente a este usuário.');
            return;
        }

        const userData = {
            username,
            password,
            role,
            clientId: role === 'client' ? clientId : undefined,
            accessibleViews: role === 'client' ? accessibleViews : undefined
        };

        if (user) {
            // Editing user
            const updateData: Partial<User> = {
                username,
                role,
                clientId: userData.clientId,
                accessibleViews: userData.accessibleViews,
            };
            if (password) {
                updateData.password = password;
            }
            updateUser(user.id, updateData);
        } else {
            // Adding new user
            const success = addUser(userData as Omit<User, 'id'>);
            if (!success) {
                setError('Este nome de usuário já existe.');
                return;
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-indigo-700/50">
                <form onSubmit={handleSubmit}>
                    <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                        <h2 className="text-xl font-bold">{user ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nome de Usuário</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={user ? "Deixe em branco para não alterar" : ""} required={!user} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Função</label>
                            <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'client')} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="admin">Admin</option>
                                <option value="client">Cliente</option>
                            </select>
                        </div>
                        {role === 'client' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Associar ao Cliente</label>
                                    <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Abas Acessíveis</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {CLIENT_ACCESSIBLE_VIEWS.map(view => (
                                            <label key={view.id} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-md cursor-pointer hover:bg-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={accessibleViews.includes(view.id)}
                                                    onChange={() => handleViewToggle(view.id)}
                                                    className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 rounded"
                                                />
                                                <span className="text-sm text-gray-300">{view.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {error && <p className="text-sm text-red-400">{error}</p>}
                    </main>
                     <footer className="flex justify-end items-center p-4 border-t border-indigo-800/50 gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


export default SettingsView;