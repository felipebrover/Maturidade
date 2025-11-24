import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useData } from '../App';
import {
    LayoutDashboard, BarChart3, Clock, Briefcase, BotMessageSquare, Library, LogOut, Menu, X, Plus, ChevronsUpDown, Check, FileDown, Rocket, Target, Minus, AlertTriangle, Building, Package, Megaphone, Handshake, Users, SlidersHorizontal, Building2, Compass, Goal, Network, Workflow, BarChartBig, HandCoins, Database, Edit, ChevronDown, ChevronUp, Info, Sheet,
    UploadCloud, Trash2, FileText, ClipboardCheck, User, Paperclip, File as FileIcon, Pencil, SendHorizonal, BrainCircuit, CheckSquare, Square, MessageSquarePlus, Settings, Grip, CircleDot, Milestone, ListChecks, DownloadCloud, Star, ShieldCheck, Gem, Link as LinkIcon, ExternalLink, ChevronRight, ListTodo, Activity, Sparkles, Lightbulb, Calendar, TrendingUp, TrendingDown
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PILLAR_DATA, PILLARS, INITIAL_PILLAR_SCORE, PILLAR_QUESTIONS, CLIENT_INFO_SECTIONS_ORDER, CONSULTING_JOURNEY_TEMPLATE } from '../constants';
import { generateExecutiveSummary, generateChatResponseWithContext, generateGeneralAssessmentNote } from '../services/geminiService';
import { formatDate, calculatePillarScore, calculateOverallMaturity, fileToDataUrl } from '../utils';
import { Pillar, type PillarScore, type PillarScores, type View, type Assessment, type Deliverable, ClientInfoSectionId, ClientInfoQuestion, Attachment, Client, ChatMessage, ChatSession, Journey, Objective, KeyResult, Initiative, Action } from '../types';
import SettingsView from './SettingsView';


const ICON_MAP: Record<Pillar, React.ElementType> = {
    [Pillar.STRATEGY]: Compass,
    [Pillar.GOALS]: Goal,
    [Pillar.CHANNELS]: Network,
    [Pillar.PROCESS]: Workflow,
    [Pillar.METRICS]: BarChartBig,
    [Pillar.COMPENSATION]: HandCoins,
    [Pillar.SYSTEMS]: Database
};

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

const PrintHeader: React.FC = () => {
    const { activeClient } = useData();
    if (!activeClient) return null;

    return (
        <div className="print-header mb-8">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-black">BSLabs</h1>
                    <p className="text-lg text-gray-600">Relatório de Maturidade Comercial</p>
                </div>
                <div className="text-right text-sm">
                    <p className="font-bold text-lg">{activeClient.name}</p>
                    <p>Data de Emissão: {formatDate(new Date().toISOString())}</p>
                </div>
            </div>
            <hr className="my-4 border-gray-300" />
        </div>
    );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
    const { activeClient, addAssessment, updateAssessment, currentUser } = useData();
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // State for the assessment being edited
    const [assessmentToEdit, setAssessmentToEdit] = useState<{assessment: Assessment, initialPillar?: Pillar} | null>(null);

    // State for the new assessment creation modal
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const handleStartEditing = (assessment: Assessment) => {
        if (currentUser?.role !== 'admin') return;
        setAssessmentToEdit({ assessment });
    };

    const handleEditPillarOfLatestAssessment = (pillar: Pillar) => {
        if (!activeClient || activeClient.assessments.length === 0 || currentUser?.role !== 'admin') return;
        const latestAssessment = activeClient.assessments[activeClient.assessments.length - 1];
        setAssessmentToEdit({ assessment: latestAssessment, initialPillar: pillar });
    };

    const handleOpenCreateModal = () => {
        if (currentUser?.role !== 'admin') return;
        setCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => setCreateModalOpen(false);

    const handleCreateNewAssessment = (scores: PillarScores, generalNote?: string, date?: string) => {
        if (activeClient) {
            addAssessment(activeClient.id, scores, generalNote, date);
            setCreateModalOpen(false);
            setCurrentView('timeline');
        }
    };

    if (!activeClient && currentUser?.role === 'admin') {
        return <div className="p-8">Selecione ou crie um cliente para começar.</div>
    }
    
    if (!activeClient && currentUser?.role === 'client') {
        return <div className="p-8">Você não está associado a nenhum cliente. Entre em contato com o administrador.</div>
    }

    const latestAssessment = useMemo(() => {
        if (!activeClient || activeClient.assessments.length === 0) return null;
        return activeClient.assessments[activeClient.assessments.length - 1];
    }, [activeClient]);

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardHome onPillarClick={handleEditPillarOfLatestAssessment} onNewAssessmentClick={handleOpenCreateModal} />;
            case 'evolution': return <EvolutionView />;
            case 'clientInfo': return <ClientInfoView />;
            case 'timeline': return <TimelineView onStartEditing={handleStartEditing} onNewAssessmentClick={handleOpenCreateModal} />;
            case 'meeting': return <MeetingPrepView />;
            case 'library': return <ResourceLibraryView />;
            case 'planning': return <PlanningView />;
            case 'chatbot': return <ChatbotView />;
            case 'settings': return currentUser?.role === 'admin' ? <SettingsView /> : <DashboardHome onPillarClick={() => {}} onNewAssessmentClick={() => {}} />;
            default: return <DashboardHome onPillarClick={handleEditPillarOfLatestAssessment} onNewAssessmentClick={handleOpenCreateModal} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-4 sm:p-6 lg:p-8 print-bg-white print-text-black">
                   <PrintHeader />
                   <div className="print-container">
                    {renderView()}
                   </div>
                </main>
            </div>
            {isCreateModalOpen && (
                <CreateAssessmentModal 
                    onClose={handleCloseCreateModal} 
                    onCreate={handleCreateNewAssessment} 
                    initialAssessment={latestAssessment} 
                />
            )}
            {assessmentToEdit && (
                <EditAssessmentModal 
                    key={assessmentToEdit.assessment.id}
                    assessment={assessmentToEdit.assessment}
                    initialPillar={assessmentToEdit.initialPillar}
                    onClose={() => setAssessmentToEdit(null)} 
                />
            )}
        </div>
    );
};

const Sidebar: React.FC<{ currentView: View, setCurrentView: (view: View) => void, isSidebarOpen: boolean, setSidebarOpen: (isOpen: boolean) => void }> = ({ currentView, setCurrentView, isSidebarOpen, setSidebarOpen }) => {
    const { logout, currentUser } = useData();
    
    const allMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'client'] },
        { id: 'evolution', label: 'Evolução', icon: BarChart3, roles: ['admin', 'client'] },
        { id: 'clientInfo', label: 'Informações', icon: User, roles: ['admin'] },
        { id: 'timeline', label: 'Timeline', icon: Clock, roles: ['admin', 'client'] },
        { id: 'planning', label: 'Planejamento', icon: ClipboardCheck, roles: ['admin', 'client'] },
        { id: 'meeting', label: 'Diagnóstico IA', icon: BotMessageSquare, roles: ['admin'] },
        { id: 'library', label: 'Biblioteca', icon: Library, roles: ['admin', 'client'] },
        { id: 'chatbot', label: 'Chat IA', icon: BrainCircuit, roles: ['admin', 'client'] },
        { id: 'settings', label: 'Admin', icon: Settings, roles: ['admin'] },
    ];

    const menuItems = useMemo(() => {
        if (!currentUser) return [];

        if (currentUser.role === 'admin') {
            return allMenuItems.filter(item => item.roles.includes('admin'));
        }

        if (currentUser.role === 'client') {
            const allowedViews = currentUser.accessibleViews?.length ? currentUser.accessibleViews : ['dashboard', 'evolution'];
            return allMenuItems.filter(item => 
                item.roles.includes('client') && allowedViews.includes(item.id as View)
            );
        }
        
        return [];
    }, [currentUser]);

    return (
        <>
        <aside className={`no-print absolute z-30 md:relative w-64 h-full bg-gray-800/50 backdrop-blur-lg border-r border-indigo-800/30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <div className="flex items-center justify-between p-4 border-b border-indigo-800/30">
                 <span className="text-2xl font-extrabold text-white tracking-tight">BSLabs</span>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCurrentView(item.id as View); setSidebarOpen(false); }}
                        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${currentView === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                    </a>
                ))}
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t border-indigo-800/30">
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); logout(); }}
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-red-600/50 hover:text-white transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sair
                </a>
            </div>
        </aside>
        {isSidebarOpen && <div className="no-print fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
        </>
    );
};

const EditClientModal: React.FC<{ client: Client; onClose: () => void; onSave: (data: Partial<Client>) => void; }> = ({ client, onClose, onSave }) => {
    const [name, setName] = useState(client.name);
    const [logoUrl, setLogoUrl] = useState<string | null>(client.logoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("O arquivo é muito grande. O limite é de 2MB.");
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                alert("Formato de arquivo inválido. Use JPG, PNG, GIF ou WEBP.");
                return;
            }
            const dataUrl = await fileToDataUrl(file);
            setLogoUrl(dataUrl);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name: name.trim(), logoUrl: logoUrl });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-indigo-700/50">
                <form onSubmit={handleSubmit}>
                    <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                        <h2 className="text-xl font-bold">Editar Cliente</h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
                    </header>
                    <main className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Logo do Cliente</label>
                            <div className="flex items-center gap-4">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover bg-gray-700" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                                        <Building size={32} className="text-gray-500" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center gap-2">
                                    <UploadCloud size={16} />
                                    <span>Alterar Foto</span>
                                </button>
                                {logoUrl && (
                                    <button type="button" onClick={() => setLogoUrl(null)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full" title="Remover foto">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="client-name" className="block text-sm font-medium text-gray-300 mb-2">Nome do Cliente</label>
                            <input
                                id="client-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </main>
                    <footer className="flex justify-end items-center p-4 border-t border-indigo-800/50 gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar Alterações</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const DeleteClientModal: React.FC<{ client: Client; onClose: () => void; onConfirm: () => void; }> = ({ client, onClose, onConfirm }) => {
    const [clientNameInput, setClientNameInput] = useState('');
    const [deleteInput, setDeleteInput] = useState('');

    const isConfirmed = clientNameInput === client.name && deleteInput.toLowerCase() === 'delete';

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-red-700/50">
                <header className="flex items-center gap-4 p-4 border-b border-red-800/50">
                    <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
                        <p className="text-sm text-gray-400">Esta ação não pode ser desfeita.</p>
                    </div>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-sm text-gray-300">
                        Você está prestes a excluir permanentemente o cliente <strong className="font-bold text-red-400">{client.name}</strong> e todos os seus dados, incluindo avaliações, planos e documentos.
                    </p>
                    <div>
                        <label htmlFor="client-name-confirm" className="block text-sm font-medium text-gray-300 mb-1">
                            Digite <strong className="text-red-400">{client.name}</strong> para confirmar
                        </label>
                        <input
                            id="client-name-confirm"
                            type="text"
                            value={clientNameInput}
                            onChange={(e) => setClientNameInput(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="delete-confirm" className="block text-sm font-medium text-gray-300 mb-1">
                            Digite <strong className="text-red-400">delete</strong> para confirmar
                        </label>
                        <input
                            id="delete-confirm"
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </main>
                <footer className="flex justify-end items-center p-4 border-t border-red-800/50 gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-red-900/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Confirmar Exclusão
                    </button>
                </footer>
            </div>
        </div>
    );
};

const Header: React.FC<{ setSidebarOpen: (isOpen: boolean) => void }> = ({ setSidebarOpen }) => {
    const { clients, activeClient, setActiveClientId, addClient, updateClient, deleteClient, currentUser } = useData();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleAddClient = () => {
        if (newClientName.trim()) {
            addClient(newClientName.trim());
            setNewClientName('');
            setDropdownOpen(false);
        }
    };

    const handleUpdateClient = (data: Partial<Client>) => {
        if (editingClient) {
            updateClient(editingClient.id, data);
            setEditingClient(null);
            setDropdownOpen(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation();
        setClientToDelete(client);
    };

    const handleConfirmDelete = () => {
        if (clientToDelete) {
            deleteClient(clientToDelete.id);
            setClientToDelete(null);
            setDropdownOpen(false);
        }
    };
    
    const handleExportCSV = useCallback(() => {
        if (!activeClient) return;

        const escapeCSV = (field: string | number) => {
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headers = [
            'Client Name',
            'Assessment ID',
            'Assessment Date',
            'Overall Maturity',
            'General Note',
            ...PILLARS.flatMap(pillar => [
                `${PILLAR_DATA[pillar].name} Score`,
                `${PILLAR_DATA[pillar].name} Goal`,
                `${PILLAR_DATA[pillar].name} Notes`
            ])
        ].map(escapeCSV).join(',');

        const rows = activeClient.assessments.map(assessment => {
            const rowData = [
                activeClient.name,
                assessment.id,
                formatDate(assessment.date),
                assessment.overallMaturity,
                assessment.generalNote || '',
                ...PILLARS.flatMap(pillar => [
                    calculatePillarScore(assessment.scores[pillar].responses),
                    assessment.scores[pillar].goal,
                    assessment.scores[pillar].notes
                ])
            ];
            return rowData.map(escapeCSV).join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `${activeClient.name.replace(/\s+/g, '_')}_Maturity_Timeline.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [activeClient]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const filteredClients = useMemo(() => {
        if (!searchQuery) return clients;
        return clients.filter(client => 
            client.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [clients, searchQuery]);

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${query})`, 'gi');
        return (
            <span>
                {text.split(regex).map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <span key={i} className="bg-indigo-600 text-white rounded-sm px-0.5">
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };


    return (
        <>
        <header className="no-print relative z-10 flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-indigo-800/30 flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
                    <Menu size={24} />
                </button>
                <div className="relative" ref={dropdownRef}>
                    {currentUser?.role === 'admin' ? (
                        <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                            {activeClient?.logoUrl ? (
                                <img src={activeClient.logoUrl} alt={`${activeClient.name} logo`} className="h-6 w-6 rounded-full object-cover bg-gray-700" />
                            ) : (
                                <Building className="h-5 w-5 text-indigo-400" />
                            )}
                            <span className="font-semibold">{activeClient?.name || 'Selecione um Cliente'}</span>
                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        </button>
                    ) : (
                         <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800">
                            {activeClient?.logoUrl ? (
                                <img src={activeClient.logoUrl} alt={`${activeClient.name} logo`} className="h-6 w-6 rounded-full object-cover bg-gray-700" />
                            ) : (
                                <Building className="h-5 w-5 text-indigo-400" />
                            )}
                            <span className="font-semibold">{activeClient?.name}</span>
                        </div>
                    )}
                    {isDropdownOpen && currentUser?.role === 'admin' && (
                        <div className="absolute mt-2 w-72 bg-gray-800 border border-indigo-700/50 rounded-lg shadow-xl z-50">
                            <div className="p-2 border-b border-indigo-700/50">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    autoFocus
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar cliente..."
                                    className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-gray-400 mt-2 px-1">
                                    Mostrando {filteredClients.length} de {clients.length} clientes.
                                </p>
                            </div>
                            <div className="p-2 max-h-60 overflow-y-auto">
                                {filteredClients.map(client => (
                                    <div key={client.id} className="group flex items-center justify-between w-full text-left rounded-md hover:bg-indigo-600"
                                        onClick={() => { setActiveClientId(client.id); setDropdownOpen(false); setSearchQuery(''); }}>
                                        <button className="flex-1 px-3 py-2 text-sm text-left flex items-center justify-between">
                                            {highlightMatch(client.name, searchQuery)}
                                            {client.id === activeClient?.id && <Check className="h-4 w-4" />}
                                        </button>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setEditingClient(client); }} 
                                                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
                                                title="Editar Cliente">
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteClick(e, client)} 
                                                className="p-1.5 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/10"
                                                title="Excluir Cliente">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredClients.length === 0 && searchQuery && (
                                    <p className="text-center text-sm text-gray-500 py-4">Nenhum cliente encontrado.</p>
                                )}
                            </div>
                            <div className="p-2 border-t border-indigo-700/50">
                                <input
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    placeholder="Novo cliente..."
                                    className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button onClick={handleAddClient} className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
                                    <Plus className="h-4 w-4" />
                                    Adicionar Cliente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {currentUser?.role === 'admin' && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm text-gray-300 font-medium"
                        title="Exportar dados como CSV"
                    >
                        <Sheet className="h-5 w-5" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm text-gray-300 font-medium"
                        title="Exportar Relatório em PDF"
                    >
                        <FileDown className="h-5 w-5" />
                        <span className="hidden sm:inline">Exportar PDF</span>
                    </button>
                </div>
            )}
        </header>
        {editingClient && (
            <EditClientModal 
                client={editingClient}
                onClose={() => setEditingClient(null)}
                onSave={handleUpdateClient}
            />
        )}
        {clientToDelete && (
            <DeleteClientModal
                client={clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        )}
        </>
    );
};

const NewClientOnboarding: React.FC = () => {
    const { activeClient, addAssessment, currentUser } = useData();
    const [isCreating, setIsCreating] = useState(false);

    const handleStartFirstAssessment = () => {
        if (!activeClient || currentUser?.role !== 'admin') return;
        setIsCreating(true);
        const initialScores = PILLARS.reduce((acc, pillar) => {
            acc[pillar] = { ...INITIAL_PILLAR_SCORE };
            return acc;
        }, {} as PillarScores);
        addAssessment(activeClient.id, initialScores);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 rounded-lg p-8 text-center">
            <Rocket className="w-16 h-16 text-indigo-400 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo, {activeClient?.name}!</h2>
            <p className="text-gray-400 mb-6 max-w-md">
                Este cliente ainda não possui nenhuma avaliação de maturidade. Comece agora para mapear a performance comercial e traçar um plano de ação.
            </p>
            {currentUser?.role === 'admin' && (
                <button
                    onClick={handleStartFirstAssessment}
                    disabled={isCreating}
                    className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Iniciar Primeira Avaliação
                </button>
            )}
        </div>
    );
};

const PillarMatrix: React.FC<{
    radarChartData: any[];
    scores: PillarScores;
    previousScores: PillarScores | null;
    onPillarClick: (pillar: Pillar) => void;
    onNewAssessmentClick: () => void;
}> = ({ radarChartData, scores, previousScores, onPillarClick, onNewAssessmentClick }) => {
    const { currentUser } = useData();
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-4 sm:p-6">
             <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Matriz de Maturidade</h2>
                    <p className="text-sm text-gray-400">Visão geral dos 7 pilares comerciais.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={onNewAssessmentClick}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Avaliação
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80 md:h-96 print-bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                            <defs>
                                <radialGradient id="radar-fill">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                </radialGradient>
                            </defs>
                            <PolarGrid stroke="#4f46e5" strokeOpacity={0.2}/>
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a5b4fc', fontSize: 12 }} className="print-text-black" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                            <Radar name="Meta" dataKey="B" stroke="#f59e0b" fill="transparent" strokeDasharray="3 3" />
                            <Radar name="Atual" dataKey="A" stroke="#6366f1" fill="url(#radar-fill)" fillOpacity={0.6} />
                            <Legend wrapperStyle={{fontSize: "12px"}} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #4f46e5',
                                    borderRadius: '0.5rem',
                                    color: '#e5e7eb',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ color: '#c7d2fe', fontWeight: 'bold' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PILLARS.map(pillar => {
                        const score = calculatePillarScore(scores[pillar].responses);
                        const prevScore = previousScores ? calculatePillarScore(previousScores[pillar].responses) : null;
                        const diff = prevScore !== null ? score - prevScore : null;
                        const Icon = ICON_MAP[pillar];
                        const isClickable = currentUser?.role === 'admin';

                        return (
                            <div 
                                key={pillar}
                                onClick={() => isClickable && onPillarClick(pillar)}
                                className={`bg-gray-900/50 p-4 rounded-lg border border-gray-700 ${isClickable ? 'hover:border-indigo-500 cursor-pointer transition-all transform hover:scale-105' : ''}`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon className="w-5 h-5" style={{ color: PILLAR_DATA[pillar].color }} />
                                    <h3 className="font-semibold text-sm text-white">{PILLAR_DATA[pillar].name}</h3>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold" style={{ color: PILLAR_DATA[pillar].color }}>{score}</p>
                                    <p className="text-sm text-gray-400">/ 100</p>
                                </div>
                                {diff !== null && (
                                    <div className={`flex items-center gap-1 text-xs mt-1 ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                        {diff > 0 ? <ChevronUp size={14} /> : diff < 0 ? <ChevronDown size={14} /> : <Minus size={14} />}
                                        {diff > 0 ? `+${diff}` : diff} vs. anterior
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const OverallMaturityCard: React.FC<{ latestMaturity: number; previousMaturity: number | null }> = ({ latestMaturity, previousMaturity }) => {
    const diff = previousMaturity !== null ? latestMaturity - previousMaturity : 0;
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gem size={100} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Maturidade Geral</h3>
            <div className="text-6xl font-bold text-white mb-2">{latestMaturity}%</div>
            {previousMaturity !== null && (
                <div className={`flex items-center gap-1 text-sm font-medium ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {diff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {diff > 0 ? '+' : ''}{diff}% vs. anterior
                </div>
            )}
        </div>
    );
};

const KeyChangesCard: React.FC<{ latestScores: PillarScores; previousScores: PillarScores | null }> = ({ latestScores, previousScores }) => {
    if (!previousScores) return null;

    const changes = PILLARS.map(pillar => {
        const current = calculatePillarScore(latestScores[pillar].responses);
        const previous = calculatePillarScore(previousScores[pillar].responses);
        return { pillar, change: current - previous };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 3);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Principais Mudanças</h3>
            <div className="space-y-3">
                {changes.map(({ pillar, change }) => (
                    <div key={pillar} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{PILLAR_DATA[pillar].name}</span>
                        <span className={`text-sm font-bold ${change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                            {change > 0 ? '+' : ''}{change}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EvolutionView: React.FC = () => {
    const { activeClient } = useData();
    if (!activeClient) return null;

    const data = activeClient.assessments.map(assessment => {
        const entry: any = {
            date: formatDate(assessment.date),
            Maturidade: assessment.overallMaturity,
        };
        PILLARS.forEach(pillar => {
            entry[PILLAR_DATA[pillar].name] = calculatePillarScore(assessment.scores[pillar].responses);
        });
        return entry;
    });

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Evolução da Maturidade</h2>
            <div className="h-96 w-full print-bg-white">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis domain={[0, 100]} stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Maturidade" stroke="#ffffff" strokeWidth={3} dot={{ r: 6 }} />
                        {PILLARS.map((pillar, index) => (
                            <Line 
                                key={pillar} 
                                type="monotone" 
                                dataKey={PILLAR_DATA[pillar].name} 
                                stroke={PILLAR_DATA[pillar].color} 
                                strokeWidth={1} 
                                dot={false} 
                                opacity={0.6}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ClientInfoView: React.FC = () => {
    const { activeClient, updateClientInfoAnswer, addClientInfoQuestion, deleteClientInfoQuestion, addClientInfoAttachment, deleteClientInfoAttachment, currentUser } = useData();
    const [activeSection, setActiveSection] = useState<ClientInfoSectionId>('summary');
    const [uploading, setUploading] = useState<string | null>(null);

    if (!activeClient) return null;

    const isAdmin = currentUser?.role === 'admin';

    const handleFileUpload = async (sectionId: ClientInfoSectionId, questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(questionId);
            await addClientInfoAttachment(activeClient.id, sectionId, questionId, file);
            setUploading(null);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)]">
            <div className="w-64 bg-gray-800/50 border-r border-indigo-800/30 overflow-y-auto">
                {CLIENT_INFO_SECTIONS_ORDER.map(sectionId => (
                    <button
                        key={sectionId}
                        onClick={() => setActiveSection(sectionId)}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${activeSection === sectionId ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    >
                        {activeClient.clientInfo[sectionId].title}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-900/50">
                <h2 className="text-xl font-bold text-white mb-6">{activeClient.clientInfo[activeSection].title}</h2>
                <div className="space-y-6">
                    {activeClient.clientInfo[activeSection].questions.map(q => (
                        <div key={q.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-sm font-medium text-white mb-2">{q.question}</p>
                            <textarea
                                value={q.answer}
                                onChange={(e) => updateClientInfoAnswer(activeClient.id, activeSection, q.id, e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-2 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-y min-h-[80px]"
                                placeholder="Insira a resposta..."
                                readOnly={!isAdmin}
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {q.attachments?.map(att => (
                                        <div key={att.id} className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
                                            <Paperclip size={12} />
                                            <span className="truncate max-w-[100px]">{att.name}</span>
                                            {isAdmin && <button onClick={() => deleteClientInfoAttachment(activeClient.id, activeSection, q.id, att.id)} className="hover:text-red-400"><X size={12} /></button>}
                                        </div>
                                    ))}
                                </div>
                                {isAdmin && (
                                    <label className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                        <UploadCloud size={14} />
                                        {uploading === q.id ? 'Enviando...' : 'Anexar'}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(activeSection, q.id, e)} />
                                    </label>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TimelineView: React.FC<{ onStartEditing: (assessment: Assessment) => void; onNewAssessmentClick: () => void }> = ({ onStartEditing, onNewAssessmentClick }) => {
    const { activeClient, deleteAssessment, currentUser } = useData();
    if (!activeClient) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Linha do Tempo de Avaliações</h2>
                {currentUser?.role === 'admin' && (
                    <button onClick={onNewAssessmentClick} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                        <Plus size={16} /> Nova Avaliação
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {[...activeClient.assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(assessment => (
                    <div key={assessment.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-white">{formatDate(assessment.date)}</span>
                                <span className="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-1 rounded-full border border-indigo-700/50">
                                    Maturidade: {assessment.overallMaturity}%
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-1">{assessment.generalNote || 'Sem observações gerais.'}</p>
                        </div>
                        {currentUser?.role === 'admin' && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => onStartEditing(assessment)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => {
                                    if(window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
                                        deleteAssessment(activeClient.id, assessment.id);
                                    }
                                }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MeetingPrepView: React.FC = () => {
    const { activeClient } = useData();
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    if (!activeClient) return null;

    const handleGenerate = async () => {
        setLoading(true);
        const result = await generateExecutiveSummary(activeClient);
        setSummary(result);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Preparação de Reunião (IA)</h2>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <p className="text-gray-300 mb-4">Gere um resumo executivo automático com base nas últimas avaliações para apresentar ao cliente.</p>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                >
                    <BotMessageSquare size={18} />
                    {loading ? 'Gerando...' : 'Gerar Resumo Executivo'}
                </button>
                {summary && (
                    <div className="mt-6 bg-gray-900/50 p-6 rounded-lg border border-gray-700 whitespace-pre-line text-gray-200 leading-relaxed">
                        {summary}
                    </div>
                )}
            </div>
        </div>
    );
};

const ResourceLibraryView: React.FC = () => {
    const { activeClient, addDeliverable, deleteDeliverable, currentUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', description: '', content: '' });

    if (!activeClient) return null;

    const handleSave = () => {
        if (newDoc.name && newDoc.content) {
            addDeliverable(activeClient.id, newDoc.name, newDoc.description, newDoc.content);
            setIsModalOpen(false);
            setNewDoc({ name: '', description: '', content: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Biblioteca de Recursos</h2>
                {currentUser?.role === 'admin' && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                        <Plus size={16} /> Novo Documento
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeClient.deliverables.map(doc => (
                    <div key={doc.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:border-indigo-500/50 transition-colors group relative">
                        <FileText className="w-8 h-8 text-indigo-400 mb-3" />
                        <h3 className="font-bold text-white mb-1">{doc.name}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{doc.description}</p>
                        {currentUser?.role === 'admin' && (
                            <button 
                                onClick={() => { if(window.confirm('Excluir este documento?')) deleteDeliverable(activeClient.id, doc.id); }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 w-full max-w-lg rounded-xl p-6 border border-gray-700 space-y-4">
                        <h3 className="text-lg font-bold text-white">Adicionar Documento</h3>
                        <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" placeholder="Nome" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} />
                        <input className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" placeholder="Descrição" value={newDoc.description} onChange={e => setNewDoc({...newDoc, description: e.target.value})} />
                        <textarea className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white h-32" placeholder="Conteúdo (Texto ou Markdown)" value={newDoc.content} onChange={e => setNewDoc({...newDoc, content: e.target.value})} />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlanningView: React.FC = () => {
    const { activeClient, addJourney, importJourney, updateJourney, deleteJourney, addObjective, updateObjective, deleteObjective, addKeyResult, updateKeyResult, deleteKeyResult, addInitiative, updateInitiative, deleteInitiative, addAction, updateAction, deleteAction, currentUser } = useData();
    const [expandedJourney, setExpandedJourney] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<{ type: 'journey' | 'objective' | 'kr' | 'initiative' | 'action', id: string, parentIds: string[], name: string } | null>(null);

    if (!activeClient) return null;
    const isAdmin = currentUser?.role === 'admin';

    const toggleJourney = (id: string) => setExpandedJourney(expandedJourney === id ? null : id);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Planejamento Estratégico</h2>
                {isAdmin && (
                    <div className="flex gap-2">
                        <button onClick={() => importJourney(activeClient.id, CONSULTING_JOURNEY_TEMPLATE)} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md">
                            <DownloadCloud size={16} /> Template
                        </button>
                        <button onClick={() => addJourney(activeClient.id, 'Nova Jornada')} className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
                            <Plus size={16} /> Nova Jornada
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {activeClient.journeys.map(journey => (
                    <div key={journey.id} className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
                        <div 
                            className="flex items-center justify-between p-4 bg-gray-800 cursor-pointer hover:bg-gray-750"
                            onClick={() => toggleJourney(journey.id)}
                        >
                            <div className="flex items-center gap-4">
                                <ChevronRight size={20} className={`text-gray-400 transition-transform ${expandedJourney === journey.id ? 'rotate-90' : ''}`} />
                                <span className="font-bold text-lg text-white">{journey.name}</span>
                                <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded border border-indigo-700/50">{journey.progress}% Concluído</span>
                            </div>
                            {isAdmin && (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => addObjective(activeClient.id, journey.id, 'Novo Objetivo')} className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white" title="Adicionar Objetivo"><Plus size={16} /></button>
                                    <button onClick={() => deleteJourney(activeClient.id, journey.id)} className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>
                        
                        {expandedJourney === journey.id && (
                            <div className="p-4 space-y-4 border-t border-gray-700">
                                {journey.objectives.map(obj => (
                                    <div key={obj.id} className="ml-4 border-l-2 border-indigo-500/30 pl-4 space-y-3">
                                        <div className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2">
                                                <Target size={18} className="text-indigo-400" />
                                                <span className="font-semibold text-white">{obj.name}</span>
                                                <span className="text-xs text-gray-500">({obj.progress}%)</span>
                                            </div>
                                            {isAdmin && (
                                                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                                                     <button onClick={() => addKeyResult(activeClient.id, journey.id, obj.id, 'Novo KR')} className="text-xs text-indigo-400 hover:underline">+ KR</button>
                                                     <button onClick={() => deleteObjective(activeClient.id, journey.id, obj.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {obj.keyResults.map(kr => (
                                            <div key={kr.id} className="ml-6 space-y-2">
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-2">
                                                        <Milestone size={16} className="text-purple-400" />
                                                        <span className="text-gray-300 text-sm">{kr.name}</span>
                                                        <span className="text-xs text-gray-600">({kr.progress}%)</span>
                                                    </div>
                                                    {isAdmin && (
                                                        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                                                            <button onClick={() => addInitiative(activeClient.id, journey.id, obj.id, kr.id, 'Nova Iniciativa')} className="text-xs text-purple-400 hover:underline">+ Iniciativa</button>
                                                            <button onClick={() => deleteKeyResult(activeClient.id, journey.id, obj.id, kr.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                                                        </div>
                                                    )}
                                                </div>

                                                {kr.initiatives.map(init => (
                                                    <div key={init.id} className="ml-6 space-y-1">
                                                        <div className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-2">
                                                                <ListTodo size={14} className="text-blue-400" />
                                                                <span className="text-gray-400 text-sm">{init.name}</span>
                                                            </div>
                                                            {isAdmin && (
                                                                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                                                                    <button onClick={() => addAction(activeClient.id, journey.id, obj.id, kr.id, init.id, 'Nova Ação')} className="text-xs text-blue-400 hover:underline">+ Ação</button>
                                                                    <button onClick={() => deleteInitiative(activeClient.id, journey.id, obj.id, kr.id, init.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {init.actions.map(action => (
                                                            <div key={action.id} className="ml-6 flex items-center gap-2 group">
                                                                <button 
                                                                    onClick={() => isAdmin && updateAction(activeClient.id, journey.id, obj.id, kr.id, init.id, action.id, action.name, !action.isCompleted)}
                                                                    className={`p-0.5 rounded ${action.isCompleted ? 'text-green-500' : 'text-gray-600'}`}
                                                                >
                                                                    {action.isCompleted ? <CheckSquare size={14} /> : <Square size={14} />}
                                                                </button>
                                                                <span className={`text-xs ${action.isCompleted ? 'text-gray-500 line-through' : 'text-gray-400'}`}>{action.name}</span>
                                                                {isAdmin && <button onClick={() => deleteAction(activeClient.id, journey.id, obj.id, kr.id, init.id, action.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400"><Trash2 size={12}/></button>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChatbotView: React.FC = () => {
    const { activeClient } = useData();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [loading, setLoading] = useState(false);

    if (!activeClient) return null;

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const newMessages = [...messages, { role: 'user' as const, text: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        const response = await generateChatResponseWithContext(input, activeClient.deliverables, 'Profissional', 'Médio', '');
        
        setMessages([...newMessages, { role: 'ai', text: response }]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {messages.length === 0 && (
                     <div className="text-center text-gray-500 mt-10">
                         <BotMessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                         <p>Comece uma conversa sobre os documentos do cliente.</p>
                     </div>
                 )}
                 {messages.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                             {msg.text}
                         </div>
                     </div>
                 ))}
                 {loading && <div className="text-gray-400 text-sm ml-2">Digitando...</div>}
             </div>
             <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
                 <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Faça uma pergunta..."
                    className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <button onClick={handleSend} disabled={loading} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                     <SendHorizonal size={20} />
                 </button>
             </div>
        </div>
    );
};

const DashboardHome: React.FC<{ onPillarClick: (pillar: Pillar) => void; onNewAssessmentClick: () => void; }> = ({ onPillarClick, onNewAssessmentClick }) => {
    const { activeClient, currentUser } = useData();

    const latestAssessment = useMemo(() => {
        if (!activeClient || activeClient.assessments.length === 0) return null;
        return activeClient.assessments[activeClient.assessments.length - 1];
    }, [activeClient]);

    const previousAssessment = useMemo(() => {
        if (!activeClient || activeClient.assessments.length < 2) return null;
        return activeClient.assessments[activeClient.assessments.length - 2];
    }, [activeClient]);
    
    if (!activeClient || !latestAssessment) {
        return <NewClientOnboarding />;
    }

    const radarChartData = PILLARS.map(pillar => ({
        subject: PILLAR_DATA[pillar].name.substring(0, 15) + (PILLAR_DATA[pillar].name.length > 15 ? '...' : ''),
        A: calculatePillarScore(latestAssessment.scores[pillar].responses),
        B: latestAssessment.scores[pillar].goal,
        fullMark: 100,
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <PillarMatrix 
                    radarChartData={radarChartData}
                    scores={latestAssessment.scores}
                    previousScores={previousAssessment?.scores || null}
                    onPillarClick={onPillarClick}
                    onNewAssessmentClick={onNewAssessmentClick}
                />
            </div>
            <div className="space-y-6">
                <OverallMaturityCard 
                    latestMaturity={latestAssessment.overallMaturity} 
                    previousMaturity={previousAssessment?.overallMaturity || null}
                />
                
                {latestAssessment.generalNote && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                             <Lightbulb className="w-5 h-5 text-indigo-400" />
                             Análise Geral & Estratégia
                        </h3>
                        <p className="text-sm text-gray-300 italic leading-relaxed">
                            "{latestAssessment.generalNote}"
                        </p>
                    </div>
                )}

                <KeyChangesCard 
                    latestScores={latestAssessment.scores}
                    previousScores={previousAssessment?.scores || null}
                />
            </div>
        </div>
    );
};

const CreateAssessmentModal: React.FC<{ onClose: () => void; onCreate: (scores: PillarScores, generalNote?: string, date?: string) => void; initialAssessment: Assessment | null; }> = ({ onClose, onCreate, initialAssessment }) => {
    // Initial state setup based on pillars
    const [scores, setScores] = useState<PillarScores>(() => {
        const initial = {} as PillarScores;
        PILLARS.forEach(p => {
            initial[p] = { responses: Array(10).fill(0), goal: 80, notes: '' };
        });
        return initial;
    });

    const [generalNote, setGeneralNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | Pillar>('general');

    const handleScoreChange = (pillar: Pillar, index: number, val: number) => {
        const newScores = { ...scores };
        newScores[pillar].responses[index] = val;
        setScores(newScores);
    };

    const handleGenerateNote = async () => {
        setIsGenerating(true);
        const note = await generateGeneralAssessmentNote(scores);
        setGeneralNote(note);
        setIsGenerating(false);
    };

    const handleSubmit = () => {
        onCreate(scores, generalNote, date);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-6xl h-[90vh] rounded-xl overflow-hidden flex flex-col shadow-2xl border border-gray-700">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Rocket className="text-indigo-500" /> Nova Avaliação
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors"><X className="text-gray-400" /></button>
                </header>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-1/4 bg-gray-900/30 border-r border-gray-700 overflow-y-auto p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                                activeTab === 'general' 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <Info size={18} />
                            <span className="font-medium">Visão Geral</span>
                        </button>
                        
                        <div className="my-2 border-t border-gray-700/50"></div>
                        
                        {PILLARS.map(pillar => {
                            const Icon = ICON_MAP[pillar];
                            const currentScore = calculatePillarScore(scores[pillar].responses);
                            return (
                                <button
                                    key={pillar}
                                    onClick={() => setActiveTab(pillar)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors group ${
                                        activeTab === pillar 
                                            ? 'bg-gray-800 text-white border-l-4 border-indigo-500' 
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} style={{ color: activeTab === pillar ? '#fff' : PILLAR_DATA[pillar].color }} />
                                        <span className="font-medium truncate">{PILLAR_DATA[pillar].name}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                        currentScore > 0 ? 'bg-gray-700 text-gray-200' : 'bg-gray-800/50 text-gray-600'
                                    }`}>
                                        {currentScore}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-800">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                        <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                            <Calendar size={16} className="text-indigo-400"/> Data da Avaliação
                                        </label>
                                        <input 
                                            type="date" 
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            A data será usada para organizar a timeline e calcular a evolução.
                                        </p>
                                     </div>
                                </div>

                                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                     <div className="flex justify-between items-center mb-4">
                                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                             <Sparkles className="text-yellow-400" /> Nota Geral & Estratégia
                                         </h3>
                                         <button
                                             onClick={handleGenerateNote}
                                             disabled={isGenerating}
                                             className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                                         >
                                             <BrainCircuit size={14} />
                                             {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                                         </button>
                                     </div>
                                    <textarea
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-white h-40 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                                        placeholder="Escreva uma observação geral sobre a maturidade comercial da empresa. Use a IA para gerar um resumo baseado nas pontuações."
                                        value={generalNote}
                                        onChange={(e) => setGeneralNote(e.target.value)}
                                    />
                                 </div>
                            </div>
                        )}

                        {activeTab !== 'general' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {React.createElement(ICON_MAP[activeTab], { size: 28, style: { color: PILLAR_DATA[activeTab].color } })}
                                        {PILLAR_DATA[activeTab].name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Pontuação:</span>
                                        <span className="text-2xl font-bold" style={{ color: PILLAR_DATA[activeTab].color }}>
                                            {calculatePillarScore(scores[activeTab].responses)}
                                        </span>
                                        <span className="text-sm text-gray-500">/ 100</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {PILLAR_QUESTIONS[activeTab].map((q, idx) => (
                                        <div key={q.id} className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 hover:border-indigo-500/30 transition-colors">
                                            <p className="text-base font-medium text-white mb-4">{q.id} {q.question}</p>
                                            <div className="space-y-2">
                                                {[0, 25, 50, 75, 100].map((val) => {
                                                    const value = val as 0 | 25 | 50 | 75 | 100;
                                                    const isSelected = scores[activeTab].responses[idx] === value;
                                                    return (
                                                        <label key={val} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                            isSelected
                                                                ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500/50'
                                                                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                                        }`}>
                                                            <div className="mt-0.5">
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${activeTab}-${idx}`}
                                                                    value={value}
                                                                    checked={isSelected}
                                                                    onChange={() => handleScoreChange(activeTab, idx, value)}
                                                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500 focus:ring-2"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                                        value === 0 ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                                                                        value === 25 ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' :
                                                                        value === 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
                                                                        value === 75 ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                                                                        'bg-green-900/30 text-green-400 border border-green-900/50'
                                                                    }`}>{value}%</span>
                                                                </div>
                                                                <span className="text-sm text-gray-300 block">{q.options[value]}</span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 mt-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Notas do Pilar (Opcional)</label>
                                    <textarea
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        rows={3}
                                        value={scores[activeTab].notes}
                                        onChange={e => {
                                            const newScores = {...scores};
                                            newScores[activeTab].notes = e.target.value;
                                            setScores(newScores);
                                        }}
                                        placeholder={`Adicione observações específicas sobre ${PILLAR_DATA[activeTab].name}...`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end gap-3 bg-gray-900/50">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-900/50 transition-all hover:scale-105">
                        Criar Avaliação
                    </button>
                </footer>
            </div>
        </div>
    );
};

const EditAssessmentModal: React.FC<{ assessment: Assessment; initialPillar?: Pillar; onClose: () => void; }> = ({ assessment, initialPillar, onClose }) => {
    const { updateAssessment, activeClient } = useData();
    const [scores, setScores] = useState<PillarScores>(JSON.parse(JSON.stringify(assessment.scores)));
    const [generalNote, setGeneralNote] = useState(assessment.generalNote || '');
    // Ensure date is formatted YYYY-MM-DD for input type="date"
    const [date, setDate] = useState(new Date(assessment.date).toISOString().split('T')[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | Pillar>(initialPillar || 'general');

    const handleGenerateNote = async () => {
        setIsGenerating(true);
        const note = await generateGeneralAssessmentNote(scores);
        setGeneralNote(note);
        setIsGenerating(false);
    };

    const handleSave = () => {
        if (activeClient) {
            updateAssessment(activeClient.id, assessment.id, scores, generalNote, date);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-6xl h-[90vh] rounded-xl overflow-hidden flex flex-col shadow-2xl border border-gray-700">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit className="text-indigo-500" /> Editar Avaliação
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors"><X className="text-gray-400" /></button>
                </header>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Navigation */}
                    <div className="w-1/4 bg-gray-900/30 border-r border-gray-700 overflow-y-auto p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                                activeTab === 'general' 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <Info size={18} />
                            <span className="font-medium">Visão Geral</span>
                        </button>
                        
                        <div className="my-2 border-t border-gray-700/50"></div>
                        
                        {PILLARS.map(pillar => {
                            const Icon = ICON_MAP[pillar];
                            const currentScore = calculatePillarScore(scores[pillar].responses);
                            return (
                                <button
                                    key={pillar}
                                    onClick={() => setActiveTab(pillar)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors group ${
                                        activeTab === pillar 
                                            ? 'bg-gray-800 text-white border-l-4 border-indigo-500' 
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} style={{ color: activeTab === pillar ? '#fff' : PILLAR_DATA[pillar].color }} />
                                        <span className="font-medium truncate">{PILLAR_DATA[pillar].name}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                        currentScore > 0 ? 'bg-gray-700 text-gray-200' : 'bg-gray-800/50 text-gray-600'
                                    }`}>
                                        {currentScore}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-800">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                        <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                            <Calendar size={16} className="text-indigo-400"/> Data da Avaliação
                                        </label>
                                        <input 
                                            type="date" 
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Alterar a data reordenará a avaliação na timeline.
                                        </p>
                                     </div>
                                </div>

                                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                                     <div className="flex justify-between items-center mb-4">
                                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                             <Sparkles className="text-yellow-400" /> Nota Geral & Estratégia
                                         </h3>
                                         <button
                                             onClick={handleGenerateNote}
                                             disabled={isGenerating}
                                             className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                                         >
                                             <BrainCircuit size={14} />
                                             {isGenerating ? 'Gerando...' : 'Regerar com IA'}
                                         </button>
                                     </div>
                                    <textarea
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-white h-40 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                                        placeholder="Escreva uma observação geral..."
                                        value={generalNote}
                                        onChange={(e) => setGeneralNote(e.target.value)}
                                    />
                                 </div>
                            </div>
                        )}

                        {activeTab !== 'general' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-gray-700 pb-4 mb-6">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {React.createElement(ICON_MAP[activeTab], { size: 28, style: { color: PILLAR_DATA[activeTab].color } })}
                                        {PILLAR_DATA[activeTab].name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Pontuação:</span>
                                        <span className="text-2xl font-bold" style={{ color: PILLAR_DATA[activeTab].color }}>
                                            {calculatePillarScore(scores[activeTab].responses)}
                                        </span>
                                        <span className="text-sm text-gray-500">/ 100</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {PILLAR_QUESTIONS[activeTab].map((q, idx) => (
                                        <div key={q.id} className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 hover:border-indigo-500/30 transition-colors">
                                            <p className="text-base font-medium text-white mb-4">{q.id} {q.question}</p>
                                            <div className="space-y-2">
                                                {[0, 25, 50, 75, 100].map((val) => {
                                                    const value = val as 0 | 25 | 50 | 75 | 100;
                                                    const isSelected = scores[activeTab].responses[idx] === value;
                                                    return (
                                                        <label key={val} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                                            isSelected
                                                                ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500/50'
                                                                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                                        }`}>
                                                            <div className="mt-0.5">
                                                                <input
                                                                    type="radio"
                                                                    name={`q-edit-${activeTab}-${idx}`}
                                                                    value={value}
                                                                    checked={isSelected}
                                                                    onChange={() => {
                                                                        const newScores = { ...scores };
                                                                        newScores[activeTab].responses[idx] = value;
                                                                        setScores(newScores);
                                                                    }}
                                                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-500 focus:ring-indigo-500 focus:ring-2"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                                        value === 0 ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                                                                        value === 25 ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' :
                                                                        value === 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
                                                                        value === 75 ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                                                                        'bg-green-900/30 text-green-400 border border-green-900/50'
                                                                    }`}>{value}%</span>
                                                                </div>
                                                                <span className="text-sm text-gray-300 block">{q.options[value]}</span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-700 mt-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Notas do Pilar (Opcional)</label>
                                    <textarea
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        rows={3}
                                        value={scores[activeTab].notes}
                                        onChange={e => {
                                            const newScores = {...scores};
                                            newScores[activeTab].notes = e.target.value;
                                            setScores(newScores);
                                        }}
                                        placeholder={`Adicione observações específicas sobre ${PILLAR_DATA[activeTab].name}...`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-700 flex justify-end gap-3 bg-gray-900/50">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-900/50 transition-all hover:scale-105">
                        Salvar Alterações
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
