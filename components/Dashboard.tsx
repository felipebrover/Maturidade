
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useData } from '../App';
import {
    LayoutDashboard, BarChart3, Clock, Briefcase, BotMessageSquare, Library, LogOut, Menu, X, Plus, ChevronsUpDown, Check, FileDown, Rocket, Target, Minus, AlertTriangle, Building, Package, Megaphone, Handshake, Users, SlidersHorizontal, Building2, Compass, Goal, Network, Workflow, BarChartBig, HandCoins, Database, Edit, ChevronDown, ChevronUp, Info, Sheet,
    UploadCloud, Trash2, FileText, ClipboardCheck, User, Paperclip, File as FileIcon, Pencil, SendHorizonal, BrainCircuit, CheckSquare, Square, MessageSquarePlus, Settings, Grip, CircleDot, Milestone, ListChecks, DownloadCloud, Star, ShieldCheck, Gem, Link as LinkIcon, ExternalLink, ChevronRight, ListTodo, Activity, Sparkles
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

    const handleCreateNewAssessment = (scores: PillarScores, generalNote?: string) => {
        if (activeClient) {
            addAssessment(activeClient.id, scores, generalNote);
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
            // If the field contains a comma, double quote, or newline, wrap it in double quotes.
            // Also, double up any existing double quotes.
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
        // Add BOM for Excel compatibility with UTF-8
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

// Dashboard Home View
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
                <KeyChangesCard 
                    latestScores={latestAssessment.scores}
                    previousScores={previousAssessment?.scores || null}
                />
            </div>
        </div>
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


// PillarMatrix, OverallMaturityCard, etc.
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

const OverallMaturityCard: React.FC<{ latestMaturity: number; previousMaturity: number | null; }> = ({ latestMaturity, previousMaturity }) => {
    const diff = previousMaturity !== null ? latestMaturity - previousMaturity : null;
    const progress = Math.min(latestMaturity, 100);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6">
            <h3 className="text-lg font-bold text-white mb-1">Maturidade Geral</h3>
            <p className="text-sm text-gray-400 mb-4">Média Ponderada dos 7 pilares.</p>
            <div className="flex items-baseline gap-3 mb-4">
                <p className="text-6xl font-bold text-indigo-400">{latestMaturity}<span className="text-3xl">%</span></p>
                {diff !== null && (
                     <div className={`flex items-center gap-1 text-base font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {diff > 0 ? <ChevronUp size={20} /> : diff < 0 ? <ChevronDown size={20} /> : <Minus size={20} />}
                        {diff}%
                    </div>
                )}
            </div>
             <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

const KeyChangesCard: React.FC<{ latestScores: PillarScores; previousScores: PillarScores | null; }> = ({ latestScores, previousScores }) => {
     if (!previousScores) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6 text-center">
                <Info className="mx-auto w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Acompanhe a Evolução</h3>
                <p className="text-sm text-gray-400">
                    Realize uma segunda avaliação para visualizar os principais avanços e pontos de atenção aqui.
                </p>
            </div>
        );
    }

    const changes = PILLARS.map(pillar => {
        const latest = calculatePillarScore(latestScores[pillar].responses);
        const previous = calculatePillarScore(previousScores[pillar].responses);
        return { pillar, diff: latest - previous };
    }).sort((a, b) => b.diff - a.diff);

    const biggestGain = changes[0];
    const biggestLoss = changes[changes.length - 1];

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Destaques da Evolução</h3>
            <div className="space-y-4">
                <div>
                    <p className="text-sm font-semibold text-green-400 mb-1">Maior Avanço</p>
                    <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                        <span className="font-medium text-sm">{PILLAR_DATA[biggestGain.pillar].name}</span>
                        <span className="font-bold text-green-400">+{biggestGain.diff} pts</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-red-400 mb-1">Ponto de Atenção</p>
                     <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg">
                        <span className="font-medium text-sm">{PILLAR_DATA[biggestLoss.pillar].name}</span>
                        <span className="font-bold text-red-400">{biggestLoss.diff} pts</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Evolution View
const EvolutionView: React.FC = () => {
    const { activeClient } = useData();
    if (!activeClient || activeClient.assessments.length < 2) {
        return (
             <div className="text-center p-8 bg-gray-800/30 rounded-lg">
                <BarChart3 className="mx-auto w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Dados Insuficientes para Análise</h2>
                <p className="text-gray-400">É necessário ter pelo menos duas avaliações para visualizar a evolução.</p>
            </div>
        );
    }

    const evolutionData = activeClient.assessments.map(assessment => {
        const dataPoint: { name: string; [key: string]: string | number } = {
            name: formatDate(assessment.date),
            "Maturidade Geral": assessment.overallMaturity,
        };
        PILLARS.forEach(pillar => {
            dataPoint[PILLAR_DATA[pillar].name] = calculatePillarScore(assessment.scores[pillar].responses);
        });
        return dataPoint;
    });

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6 print-bg-white print-border-gray">
            <h2 className="text-2xl font-bold mb-1 text-white print-text-black">Evolução da Maturidade</h2>
            <p className="text-gray-400 mb-6 print-text-black">Comparativo da pontuação geral e por pilar ao longo do tempo.</p>
            <div className="h-96 print-bg-white">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{ fill: '#a5b4fc', fontSize: 12 }} className="print-text-black" />
                        <YAxis domain={[0, 100]} tick={{ fill: '#a5b4fc', fontSize: 12 }} className="print-text-black" />
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
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Line type="monotone" dataKey="Maturidade Geral" stroke="#eab308" strokeWidth={3} />
                        {PILLARS.map(pillar => (
                            <Line key={pillar} type="monotone" dataKey={PILLAR_DATA[pillar].name} stroke={PILLAR_DATA[pillar].color} strokeWidth={1.5} opacity={0.7} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// Timeline View
const TimelineView: React.FC<{ onStartEditing: (assessment: Assessment) => void; onNewAssessmentClick: () => void; }> = ({ onStartEditing, onNewAssessmentClick }) => {
    const { activeClient, currentUser, deleteAssessment } = useData();
    const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);

    if (!activeClient || activeClient.assessments.length === 0) {
        return (
             <div className="text-center p-8 bg-gray-800/30 rounded-lg">
                <Clock className="mx-auto w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Nenhuma Avaliação Encontrada</h2>
                <p className="text-gray-400 mb-6">Crie a primeira avaliação para iniciar a timeline.</p>
                {currentUser?.role === 'admin' && (
                     <button
                        onClick={onNewAssessmentClick}
                        className="flex items-center mx-auto justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Criar Primeira Avaliação
                    </button>
                )}
            </div>
        );
    }
    
    const handleConfirmDelete = () => {
        if (activeClient && assessmentToDelete) {
            deleteAssessment(activeClient.id, assessmentToDelete.id);
            setAssessmentToDelete(null);
        }
    };

    // sort assessments from newest to oldest
    const sortedAssessments = [...activeClient.assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Timeline de Avaliações</h2>
                    <p className="text-gray-400">Histórico de todas as avaliações de maturidade realizadas.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={onNewAssessmentClick}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nova Avaliação
                    </button>
                )}
            </div>
            <div className="space-y-8">
                {sortedAssessments.map((assessment, index) => (
                    <AssessmentCard 
                        key={assessment.id} 
                        assessment={assessment} 
                        isLatest={index === 0} 
                        onEdit={() => onStartEditing(assessment)}
                        onDelete={() => setAssessmentToDelete(assessment)}
                    />
                ))}
            </div>
            {assessmentToDelete && (
                <ConfirmationModal
                    title="Confirmar Exclusão de Avaliação"
                    message={`Tem certeza de que deseja excluir a avaliação de ${formatDate(assessmentToDelete.date)}? Esta ação não pode ser desfeita.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => setAssessmentToDelete(null)}
                    confirmText="Excluir Avaliação"
                />
            )}
        </div>
    );
};

const AssessmentCard: React.FC<{ assessment: Assessment; isLatest: boolean; onEdit: () => void; onDelete: () => void; }> = ({ assessment, isLatest, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(isLatest); // Expand latest by default
    const { currentUser } = useData();
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 overflow-hidden">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-indigo-900/50">
                        <span className="text-3xl font-bold text-indigo-400">{assessment.overallMaturity}</span>
                        <span className="text-xs text-gray-400">Geral</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Avaliação de {formatDate(assessment.date)}</h3>
                        {isLatest && <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Mais Recente</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {currentUser?.role === 'admin' && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                                <Edit className="w-5 h-5 text-gray-400" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-full hover:bg-red-900/50 transition-colors">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                        </>
                    )}
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-indigo-800/30">
                    {assessment.generalNote && (
                        <div className="mb-6 bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30">
                            <h4 className="text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wide">Nota Geral & Estratégia</h4>
                            <p className="text-gray-300 italic">"{assessment.generalNote}"</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PILLARS.map(pillar => {
                             const pillarScore = calculatePillarScore(assessment.scores[pillar].responses);
                             const pillarGoal = assessment.scores[pillar].goal;
                             const Icon = ICON_MAP[pillar];
                             return (
                                 <div key={pillar} className="bg-gray-900/50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" style={{ color: PILLAR_DATA[pillar].color }} />
                                            <p className="text-sm font-semibold">{PILLAR_DATA[pillar].name}</p>
                                        </div>
                                        <span className="text-lg font-bold" style={{ color: PILLAR_DATA[pillar].color }}>
                                            {pillarScore}
                                            <span className="text-xs text-gray-500">/{pillarGoal}</span>
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">"{assessment.scores[pillar].notes || 'Nenhuma nota.'}"</p>
                                 </div>
                             );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// Meeting Prep View
const MeetingPrepView: React.FC = () => {
    const { activeClient, updateClientDiagnosticSummary } = useData();
    const [summary, setSummary] = useState(activeClient?.diagnosticSummary || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateSummary = useCallback(async () => {
        if (!activeClient) return;
        setIsLoading(true);
        try {
            const result = await generateExecutiveSummary(activeClient);
            setSummary(result);
            updateClientDiagnosticSummary(activeClient.id, result);
        } catch (error) {
            const errorMessage = 'Ocorreu um erro ao gerar o resumo. Tente novamente.';
            setSummary(errorMessage);
            updateClientDiagnosticSummary(activeClient.id, errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [activeClient, updateClientDiagnosticSummary]);

    if (!activeClient || activeClient.assessments.length === 0) {
        return (
             <div className="text-center p-8 bg-gray-800/30 rounded-lg">
                <BotMessageSquare className="mx-auto w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Gere seu Diagnóstico com IA</h2>
                <p className="text-gray-400">Realize uma avaliação para que a IA possa gerar um resumo executivo e pontos de discussão.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Diagnóstico com IA</h2>
                    <p className="text-gray-400">Resumo executivo gerado pela IA para a próxima conversa com o cliente.</p>
                </div>
                <button onClick={handleGenerateSummary} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <BotMessageSquare className="h-4 w-4" />
                    )}
                    {isLoading ? 'Gerando...' : (summary ? 'Gerar Novo Diagnóstico' : 'Gerar Diagnóstico')}
                </button>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg min-h-[200px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Analisando dados e gerando insights...</p>
                    </div>
                ) : (
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summary || 'Clique em "Gerar Diagnóstico" para ver um resumo da situação atual do cliente.'}</p>
                )}
            </div>
        </div>
    );
};

// Helper types and functions for the new DeliverableViewerModal
interface TocItem {
  id: string;
  text: string;
  level: number;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/--+/g, '-') // replace multiple - with single -
    .trim();


const MarkdownContentRenderer: React.FC<{ content: string }> = React.memo(({ content }) => {
    // Process simple inline markdown like **bold** and *italic*
    const processInlineFormatting = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/g);
        return parts.filter(part => part).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
                return <em key={i}>{part.slice(1, -1)}</em>;
            }
            return part;
        });
    };

    const renderedContent = useMemo(() => {
        // Split by blank lines to handle paragraphs and lists correctly
        const blocks = content.split(/\n\s*\n/);
        const elements: React.ReactNode[] = [];

        blocks.forEach((block, blockIndex) => {
            const trimmedBlock = block.trim();
            if (!trimmedBlock) return;

            // Horizontal Rule
            if (trimmedBlock === '---') {
                elements.push(<hr key={`hr-${blockIndex}`} className="my-6 border-gray-600" />);
                return;
            }

            // Headings
            const headingMatch = trimmedBlock.match(/^(#{1,6})\s+(.*)/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2].trim();
                const id = slugify(`${text}-${blockIndex}`);
                const Tag = `h${level}` as React.ElementType;
                const textSize = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'][level - 1];
                elements.push(
                    <Tag key={id} id={id} className={`font-bold mt-8 mb-3 text-white ${textSize} heading-marker`}>
                        {text}
                    </Tag>
                );
                return;
            }

            // Lists
            if (trimmedBlock.startsWith('- ')) {
                const listItems = trimmedBlock.split('\n').map((line, lineIndex) => (
                    <li key={`li-${blockIndex}-${lineIndex}`} className="mb-2">
                        {processInlineFormatting(line.replace(/^- /, '').trim())}
                    </li>
                ));
                elements.push(<ul key={`ul-${blockIndex}`} className="list-disc pl-5 mb-4">{listItems}</ul>);
                return;
            }

            // Paragraphs
            elements.push(
                <p key={`p-${blockIndex}`} className="mb-4 leading-relaxed">
                    {processInlineFormatting(trimmedBlock.replace(/\n/g, ' '))}
                </p>
            );
        });

        return elements;
    }, [content]);

    return <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-indigo-300">{renderedContent}</div>;
});

const DeliverableViewerModal: React.FC<{ deliverable: Deliverable; onClose: () => void; }> = ({ deliverable, onClose }) => {
    const [toc, setToc] = useState<TocItem[]>([]);
    const [activeTocId, setActiveTocId] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Parse content for Table of Contents
    useEffect(() => {
        const lines = deliverable.content.split('\n');
        const headings: TocItem[] = [];
        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.*)/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                // Use block index logic consistent with renderer for stable IDs
                const blockContent = deliverable.content.split(/\n\s*\n/);
                const blockIndex = blockContent.findIndex(b => b.includes(line));
                headings.push({ id: slugify(`${text}-${blockIndex}`), text, level });
            }
        });
        setToc(headings);
    }, [deliverable.content]);

    // Setup IntersectionObserver for active ToC highlighting
    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        const callback = (entries: IntersectionObserverEntry[]) => {
            const visibleEntries = entries.filter(e => e.isIntersecting);
            if (visibleEntries.length > 0) {
                 setActiveTocId(visibleEntries[0].target.id);
            }
        };

        observer.current = new IntersectionObserver(callback, {
            root: contentRef.current,
            threshold: 0.1,
            rootMargin: '-20% 0px -80% 0px' // Highlight when top part is visible
        });

        const headings = contentRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings?.forEach(h => observer.current?.observe(h));

        return () => observer.current?.disconnect();
    }, [toc]); // Removed activeTocId to avoid re-binding unnecessarily

    const scrollToId = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveTocId(id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-900 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl border border-indigo-500/30 flex overflow-hidden">
                {/* Sidebar for ToC */}
                {toc.length > 0 && (
                    <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-4 overflow-y-auto hidden lg:block">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Índice</h3>
                        <nav className="space-y-1">
                            {toc.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToId(item.id)}
                                    className={`block w-full text-left text-sm py-1 px-2 rounded-md transition-colors truncate ${
                                        activeTocId === item.id ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                                    style={{ paddingLeft: `${(item.level - 1) * 0.75 + 0.5}rem` }}
                                >
                                    {item.text}
                                </button>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <header className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/80">
                         <div>
                            <h2 className="text-xl font-bold text-white">{deliverable.name}</h2>
                            <p className="text-sm text-gray-400">{deliverable.description}</p>
                         </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </header>
                    <main className="flex-1 p-8 overflow-y-auto" ref={contentRef}>
                         <MarkdownContentRenderer content={deliverable.content} />
                    </main>
                </div>
            </div>
        </div>
    );
};

const LinkInputModal: React.FC<{
    onClose: () => void;
    onSave: (name: string, url: string) => void;
}> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && url) {
            onSave(name, url);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-indigo-500/30">
                <form onSubmit={handleSubmit}>
                    <header className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h3 className="text-lg font-bold text-white">Adicionar Link</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </header>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Link</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:ring-indigo-500"
                                placeholder="Ex: Planilha de Vendas"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:ring-indigo-500"
                                placeholder="https://..."
                                required
                            />
                        </div>
                    </div>
                    <footer className="p-4 border-t border-gray-700 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Adicionar</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const ClientInfoView: React.FC = () => {
    const { activeClient, updateClientInfoAnswer, addClientInfoLink, deleteClientInfoAttachment, currentUser, updateClient } = useData();
    const [expandedSection, setExpandedSection] = useState<string | null>(CLIENT_INFO_SECTIONS_ORDER[0]);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [currentLinkTarget, setCurrentLinkTarget] = useState<{ sectionId: ClientInfoSectionId, questionId: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!activeClient) return null;

    const handleExportClientInfo = () => {
        const dataStr = JSON.stringify(activeClient.clientInfo, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${activeClient.name.replace(/\s+/g, '_')}_ClientInfo.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedData = JSON.parse(content);

                // Basic validation to check if it looks like client info data
                if (!importedData || typeof importedData !== 'object') {
                     throw new Error("Estrutura de arquivo inválida.");
                }

                const confirmMessage = `[Importação Inteligente]\n\nDeseja mesclar os dados do arquivo com o questionário atual de "${activeClient.name}"?\n\n- A estrutura atual de perguntas será MANTIDA.\n- Respostas e anexos correspondentes (pelo ID) serão atualizados.\n- Respostas para perguntas que não existem mais serão ignoradas.\n\nIsso permite restaurar backups antigos mesmo se o questionário mudou.`;

                if (window.confirm(confirmMessage)) {
                    
                    // SMART MERGE LOGIC
                    const currentInfo = JSON.parse(JSON.stringify(activeClient.clientInfo)); // Deep copy current structure

                    // Iterate over imported sections
                    Object.keys(importedData).forEach((sectionKey) => {
                        const importedSection = importedData[sectionKey];
                        if (currentInfo[sectionKey] && importedSection.questions) {
                            // Iterate over imported questions
                            importedSection.questions.forEach((importedQ: ClientInfoQuestion) => {
                                const targetQIndex = currentInfo[sectionKey].questions.findIndex((q: ClientInfoQuestion) => q.id === importedQ.id);
                                if (targetQIndex !== -1) {
                                    // Update answer
                                    if (importedQ.answer) {
                                         currentInfo[sectionKey].questions[targetQIndex].answer = importedQ.answer;
                                    }
                                    
                                    // Merge attachments (replace for now to avoid duplicates logic complexity, but keep if imported has any)
                                    if (importedQ.attachments && importedQ.attachments.length > 0) {
                                        currentInfo[sectionKey].questions[targetQIndex].attachments = importedQ.attachments;
                                    }
                                }
                            });
                        }
                    });

                    updateClient(activeClient.id, { clientInfo: currentInfo });
                    alert("Importação realizada com sucesso! Os dados foram mesclados preservando a estrutura atual.");
                }
            } catch (error) {
                console.error("Erro na importação:", error);
                alert("Erro ao importar o arquivo. Certifique-se de que é um arquivo JSON válido exportado desta ferramenta.");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleToggleSection = (sectionId: string) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    const handleOpenLinkModal = (sectionId: ClientInfoSectionId, questionId: string) => {
        setCurrentLinkTarget({ sectionId, questionId });
        setIsLinkModalOpen(true);
    };

    const handleSaveLink = (name: string, url: string) => {
        if (activeClient && currentLinkTarget) {
            addClientInfoLink(activeClient.id, currentLinkTarget.sectionId, currentLinkTarget.questionId, name, url);
            setIsLinkModalOpen(false);
            setCurrentLinkTarget(null);
        }
    };

    // Progress Calculation Helper
    const calculateProgress = (questions: ClientInfoQuestion[]) => {
        const total = questions.length;
        const filled = questions.filter(q => q.answer && q.answer.trim().length > 0).length;
        const percentage = total === 0 ? 0 : Math.round((filled / total) * 100);
        return { total, filled, percentage };
    };

    const calculateLevelStats = (questions: ClientInfoQuestion[], level: 'Essencial' | 'Profissional' | 'Elite') => {
        const levelQs = questions.filter(q => q.level === level);
        return calculateProgress(levelQs);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Informações do Cliente</h2>
                    <p className="text-gray-400">Dados cadastrais e levantamento de informações.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="flex gap-2">
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <button
                            onClick={handleImportClick}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
                            title="Importar JSON (Smart Merge)"
                        >
                            <UploadCloud size={16} />
                            <span className="hidden sm:inline">Importar</span>
                        </button>
                         <button
                            onClick={handleExportClientInfo}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                            title="Exportar JSON"
                        >
                            <DownloadCloud size={16} />
                            <span className="hidden sm:inline">Exportar</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {CLIENT_INFO_SECTIONS_ORDER.map((sectionKey) => {
                    const section = activeClient.clientInfo[sectionKey];
                    const isExpanded = expandedSection === sectionKey;

                    const sectionTotal = calculateProgress(section.questions);
                    const essentialStats = calculateLevelStats(section.questions, 'Essencial');
                    const professionalStats = calculateLevelStats(section.questions, 'Profissional');
                    const eliteStats = calculateLevelStats(section.questions, 'Elite');

                    return (
                        <div key={sectionKey} className="bg-gray-800/50 border border-indigo-800/30 rounded-lg overflow-hidden">
                            <button
                                onClick={() => handleToggleSection(sectionKey)}
                                className="w-full block p-4 text-left hover:bg-gray-700/50 transition-colors group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{sectionTotal.percentage}%</span>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                
                                {/* Main Progress Bar */}
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-indigo-500 h-full transition-all duration-500 ease-out" 
                                        style={{ width: `${sectionTotal.percentage}%` }} 
                                    />
                                </div>

                                {/* Sub-bars for Levels */}
                                <div className="flex gap-2 mt-2 w-full">
                                    {/* Essencial */}
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] uppercase font-medium text-gray-500">
                                            <span>Essencial</span>
                                            <span>{essentialStats.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${essentialStats.percentage}%` }} />
                                        </div>
                                    </div>
                                    
                                    {/* Profissional */}
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] uppercase font-medium text-gray-500">
                                            <span>Profissional</span>
                                            <span>{professionalStats.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${professionalStats.percentage}%` }} />
                                        </div>
                                    </div>

                                    {/* Elite */}
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex justify-between text-[10px] uppercase font-medium text-gray-500">
                                            <span>Elite</span>
                                            <span>{eliteStats.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${eliteStats.percentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </button>
                            
                            {isExpanded && (
                                <div className="p-4 border-t border-indigo-800/30 space-y-6 bg-gray-900/20">
                                    {section.questions.map((q: ClientInfoQuestion) => (
                                        <div key={q.id} className="bg-gray-800/80 p-4 rounded-lg border border-gray-700/50">
                                            <div className="mb-2">
                                                <p className="text-sm font-medium text-gray-200">{q.question}</p>
                                                {q.level && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                                                        q.level === 'Essencial' ? 'bg-green-900 text-green-300' :
                                                        q.level === 'Profissional' ? 'bg-blue-900 text-blue-300' :
                                                        'bg-purple-900 text-purple-300'
                                                    }`}>
                                                        {q.level}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {currentUser?.role === 'admin' ? (
                                                <textarea
                                                    value={q.answer}
                                                    onChange={(e) => updateClientInfoAnswer(activeClient.id, sectionKey as ClientInfoSectionId, q.id, e.target.value)}
                                                    placeholder="Responda aqui..."
                                                    className="w-full mt-2 p-3 bg-gray-900 border border-gray-600 rounded-md text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px]"
                                                />
                                            ) : (
                                                <div className="w-full mt-2 p-3 bg-gray-900/50 border border-gray-700 rounded-md text-sm text-gray-300 min-h-[40px]">
                                                    {q.answer || <span className="text-gray-500 italic">Sem resposta.</span>}
                                                </div>
                                            )}

                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-gray-400 uppercase">Links & Anexos</span>
                                                    {currentUser?.role === 'admin' && (
                                                        <button
                                                            onClick={() => handleOpenLinkModal(sectionKey as ClientInfoSectionId, q.id)}
                                                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded hover:bg-indigo-900/50 transition-colors"
                                                        >
                                                            <LinkIcon size={12} />
                                                            Adicionar Link
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    {(!q.attachments || q.attachments.length === 0) && (
                                                        <span className="text-xs text-gray-500 italic">Nenhum link anexado.</span>
                                                    )}
                                                    {q.attachments?.map((att) => (
                                                        <div key={att.id} className="group flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-xs text-gray-300 hover:border-indigo-500 transition-colors">
                                                            <ExternalLink size={12} className="text-indigo-400" />
                                                            <a 
                                                                href={att.data} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="hover:text-indigo-400 font-medium truncate max-w-[200px]"
                                                            >
                                                                {att.name}
                                                            </a>
                                                            {currentUser?.role === 'admin' && (
                                                                <button
                                                                    onClick={() => deleteClientInfoAttachment(activeClient.id, sectionKey as ClientInfoSectionId, q.id, att.id)}
                                                                    className="ml-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Remover Link"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {isLinkModalOpen && (
                <LinkInputModal 
                    onClose={() => setIsLinkModalOpen(false)} 
                    onSave={handleSaveLink} 
                />
            )}
        </div>
    );
};

const ResourceLibraryView: React.FC = () => {
    const { activeClient, currentUser, deleteDeliverable, addDeliverable } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', description: '', content: '' });
    const [viewingDoc, setViewingDoc] = useState<Deliverable | null>(null);

    const handleAdd = () => {
        if (activeClient && newDoc.name) {
            addDeliverable(activeClient.id, newDoc.name, newDoc.description, newDoc.content);
            setIsAdding(false);
            setNewDoc({ name: '', description: '', content: '' });
        }
    };

    if (!activeClient) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Biblioteca de Recursos</h2>
                    <p className="text-gray-400">Documentos, playbooks e materiais de apoio.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus size={18} />
                        Novo Documento
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeClient.deliverables.map(doc => (
                    <div key={doc.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-colors group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => setViewingDoc(doc)} className="p-2 bg-gray-700 hover:bg-indigo-600 rounded-full text-white">
                                <ExternalLink size={16} />
                            </button>
                            {currentUser?.role === 'admin' && (
                                <button onClick={() => deleteDeliverable(activeClient.id, doc.id)} className="p-2 bg-gray-700 hover:bg-red-600 rounded-full text-white">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                        <FileText size={40} className="text-indigo-400 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">{doc.name}</h3>
                        <p className="text-sm text-gray-400 line-clamp-3">{doc.description}</p>
                        <button onClick={() => setViewingDoc(doc)} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                            Ler Documento &rarr;
                        </button>
                    </div>
                ))}
                {activeClient.deliverables.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                        <Library className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-400">Biblioteca Vazia</h3>
                        <p className="text-gray-500">Adicione documentos para compartilhar conhecimento.</p>
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl w-full max-w-2xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4">Novo Documento</h3>
                        <div className="space-y-4">
                            <input
                                placeholder="Título do Documento"
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                value={newDoc.name}
                                onChange={e => setNewDoc({...newDoc, name: e.target.value})}
                            />
                            <input
                                placeholder="Breve Descrição"
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                value={newDoc.description}
                                onChange={e => setNewDoc({...newDoc, description: e.target.value})}
                            />
                            <textarea
                                placeholder="Conteúdo (Markdown suportado)"
                                className="w-full h-64 bg-gray-900 border border-gray-600 rounded p-2 text-white font-mono text-sm"
                                value={newDoc.content}
                                onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Cancelar</button>
                            <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {viewingDoc && (
                <DeliverableViewerModal deliverable={viewingDoc} onClose={() => setViewingDoc(null)} />
            )}
        </div>
    );
};

// --- Planning Components ---

const ProgressBar: React.FC<{ progress: number, className?: string }> = ({ progress, className }) => (
    <div className={`w-full bg-gray-700 rounded-full h-2 ${className}`}>
        <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
        />
    </div>
);

const AddItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    title: string;
    placeholder?: string;
}> = ({ isOpen, onClose, onConfirm, title, placeholder }) => {
    const [name, setName] = useState('');
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(name);
            setName('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 border border-gray-700 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        autoFocus
                        placeholder={placeholder || "Nome do item..."}
                        className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium">Adicionar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ActionItem: React.FC<{
    action: Action;
    journeyId: string;
    objectiveId: string;
    keyResultId: string;
    initiativeId: string;
}> = ({ action, journeyId, objectiveId, keyResultId, initiativeId }) => {
    const { activeClient, updateAction, deleteAction, currentUser } = useData();
    
    if (!activeClient) return null;

    return (
        <div className="flex items-center justify-between p-2 pl-4 hover:bg-gray-700/30 rounded group">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => updateAction(activeClient.id, journeyId, objectiveId, keyResultId, initiativeId, action.id, action.name, !action.isCompleted)}
                    className={`p-1 rounded border transition-colors ${action.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-500 text-transparent hover:border-green-500'}`}
                >
                    <Check size={12} strokeWidth={3} />
                </button>
                <span className={`text-sm ${action.isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                    {action.name}
                </span>
            </div>
            {currentUser?.role === 'admin' && (
                <button 
                    onClick={() => deleteAction(activeClient.id, journeyId, objectiveId, keyResultId, initiativeId, action.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity p-1"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

const InitiativeItem: React.FC<{
    initiative: Initiative;
    journeyId: string;
    objectiveId: string;
    keyResultId: string;
}> = ({ initiative, journeyId, objectiveId, keyResultId }) => {
    const { activeClient, deleteInitiative, addAction, currentUser } = useData();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!activeClient) return null;

    return (
        <div className="ml-4 mt-2 border-l-2 border-gray-700 pl-4">
            <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                     <div className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRight size={16} className="text-gray-500" />
                    </div>
                    <ListTodo size={16} className="text-orange-400" />
                    <span className="font-medium text-gray-200 text-sm">{initiative.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({initiative.progress}%)</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {currentUser?.role === 'admin' && (
                        <>
                            <button onClick={() => setIsModalOpen(true)} className="text-xs bg-gray-800 hover:bg-gray-700 text-indigo-400 px-2 py-1 rounded flex items-center gap-1">
                                <Plus size={12} /> Ação
                            </button>
                            <button onClick={() => deleteInitiative(activeClient.id, journeyId, objectiveId, keyResultId, initiative.id)} className="text-gray-500 hover:text-red-400 p-1">
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
            <ProgressBar progress={initiative.progress} className="mt-1 mb-2 h-1 bg-gray-800" />
            
            {isExpanded && (
                <div className="mt-1 space-y-1">
                    {initiative.actions.map(action => (
                        <ActionItem 
                            key={action.id} 
                            action={action} 
                            journeyId={journeyId} 
                            objectiveId={objectiveId} 
                            keyResultId={keyResultId} 
                            initiativeId={initiative.id} 
                        />
                    ))}
                    {initiative.actions.length === 0 && (
                        <p className="text-xs text-gray-600 italic pl-4 py-1">Nenhuma ação definida.</p>
                    )}
                </div>
            )}

            <AddItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={(name) => addAction(activeClient.id, journeyId, objectiveId, keyResultId, initiative.id, name)}
                title="Nova Ação"
                placeholder="Descreva a ação a ser realizada..."
            />
        </div>
    );
};

const KeyResultItem: React.FC<{
    kr: KeyResult;
    journeyId: string;
    objectiveId: string;
}> = ({ kr, journeyId, objectiveId }) => {
    const { activeClient, deleteKeyResult, addInitiative, currentUser } = useData();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!activeClient) return null;

    return (
        <div className="bg-gray-800/30 rounded-lg p-3 mb-3 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => setIsExpanded(!isExpanded)}>
                    <Activity size={18} className="text-blue-400" />
                    <h5 className="font-semibold text-gray-200 text-sm">{kr.name}</h5>
                     <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''} ml-auto mr-4`}>
                        <ChevronDown size={16} className="text-gray-500" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-400 bg-blue-900/20 px-2 py-1 rounded">{kr.progress}%</span>
                    {currentUser?.role === 'admin' && (
                        <div className="flex gap-1">
                             <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-700 rounded text-blue-400" title="Adicionar Iniciativa">
                                <Plus size={16} />
                            </button>
                            <button onClick={() => deleteKeyResult(activeClient.id, journeyId, objectiveId, kr.id)} className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ProgressBar progress={kr.progress} className="h-1.5 mb-3" />

            {isExpanded && (
                <div className="space-y-2 mt-2">
                    {kr.initiatives.map(initiative => (
                        <InitiativeItem 
                            key={initiative.id} 
                            initiative={initiative} 
                            journeyId={journeyId} 
                            objectiveId={objectiveId} 
                            keyResultId={kr.id} 
                        />
                    ))}
                    {kr.initiatives.length === 0 && (
                        <p className="text-xs text-gray-500 italic text-center py-2">Nenhuma iniciativa criada para este KR.</p>
                    )}
                </div>
            )}

            <AddItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={(name) => addInitiative(activeClient.id, journeyId, objectiveId, kr.id, name)}
                title="Nova Iniciativa"
                placeholder="Qual iniciativa suportará este KR?"
            />
        </div>
    );
};

const ObjectiveItem: React.FC<{
    objective: Objective;
    journeyId: string;
}> = ({ objective, journeyId }) => {
    const { activeClient, deleteObjective, addKeyResult, currentUser } = useData();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!activeClient) return null;

    return (
        <div className="bg-gray-900/40 rounded-xl p-4 border-l-4 border-purple-500 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex items-center gap-2 mb-1">
                        <Target size={20} className="text-purple-400" />
                        <h4 className="text-lg font-bold text-white">{objective.name}</h4>
                    </div>
                    <p className="text-xs text-gray-400">{objective.keyResults.length} Resultados Chave</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                     <span className="text-sm font-bold text-purple-400">{objective.progress}%</span>
                     {currentUser?.role === 'admin' && (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="text-xs flex items-center gap-1 text-purple-300 hover:text-white hover:bg-purple-600/50 px-2 py-1 rounded transition-colors"
                            >
                                <Plus size={14} /> KR
                            </button>
                            <button onClick={() => deleteObjective(activeClient.id, journeyId, objective.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                     )}
                </div>
            </div>
            <ProgressBar progress={objective.progress} />
            
            {isExpanded && (
                <div className="mt-6 pl-2 space-y-4">
                    {objective.keyResults.map(kr => (
                        <KeyResultItem 
                            key={kr.id} 
                            kr={kr} 
                            journeyId={journeyId} 
                            objectiveId={objective.id} 
                        />
                    ))}
                    {objective.keyResults.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-4">Nenhum Resultado Chave (KR) definido.</p>
                    )}
                </div>
            )}

            <AddItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={(name) => addKeyResult(activeClient.id, journeyId, objective.id, name)}
                title="Novo Resultado Chave (KR)"
                placeholder="Defina uma métrica de sucesso..."
            />
        </div>
    );
};

const JourneyItem: React.FC<{ journey: Journey }> = ({ journey }) => {
    const { activeClient, deleteJourney, addObjective, currentUser } = useData();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!activeClient) return null;

    return (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden mb-8 shadow-lg">
            <div 
                className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <Milestone size={28} className="text-indigo-400" />
                    <div>
                        <h3 className="text-xl font-bold text-white">{journey.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${journey.progress}%` }} />
                            </div>
                            <span className="text-sm text-gray-400 font-medium">{journey.progress}% Concluído</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     {currentUser?.role === 'admin' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteJourney(activeClient.id, journey.id); }} 
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-full transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                     )}
                    <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 bg-gray-900/20">
                    {journey.objectives.map(obj => (
                        <ObjectiveItem key={obj.id} objective={obj} journeyId={journey.id} />
                    ))}
                    
                    {journey.objectives.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                            <p className="text-gray-500 mb-2">Jornada vazia</p>
                            <p className="text-sm text-gray-600">Adicione objetivos estratégicos para começar.</p>
                        </div>
                    )}

                    {currentUser?.role === 'admin' && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 w-full py-3 border-2 border-dashed border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2 font-semibold"
                        >
                            <Plus size={20} /> Novo Objetivo Estratégico
                        </button>
                    )}
                </div>
            )}

            <AddItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={(name) => addObjective(activeClient.id, journey.id, name)}
                title="Novo Objetivo Estratégico"
                placeholder="O que queremos alcançar?"
            />
        </div>
    );
};

const PlanningView: React.FC = () => {
    const { activeClient, currentUser, addJourney, importJourney } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!activeClient) return null;

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedData = JSON.parse(content);
                
                // Handle array or single object
                const journeysToImport = Array.isArray(importedData) ? importedData : [importedData];
                
                // Basic validation
                let importedCount = 0;
                journeysToImport.forEach((journey: any) => {
                     if (journey.name && Array.isArray(journey.objectives)) {
                         // Ensure structure is valid for importJourney
                         importJourney(activeClient.id, journey);
                         importedCount++;
                     }
                });

                if (importedCount > 0) {
                    alert(`${importedCount} jornada(s) importada(s) com sucesso!`);
                } else {
                    alert("Nenhuma jornada válida encontrada no arquivo.");
                }

            } catch (error) {
                console.error("Erro na importação:", error);
                alert("Erro ao importar o arquivo. Certifique-se de que é um JSON válido.");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleExportJourneys = () => {
        if (!activeClient) return;
        const dataStr = JSON.stringify(activeClient.journeys, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${activeClient.name.replace(/\s+/g, '_')}_StrategicPlanning.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Planejamento Estratégico</h2>
                    <p className="text-gray-400 mt-1">Gerencie Jornadas, Objetivos, KRs, Iniciativas e Ações.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            className="hidden"
                        />
                        <button
                            onClick={handleImportClick}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            <UploadCloud size={20} />
                            Importar
                        </button>
                        <button
                            onClick={handleExportJourneys}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            <DownloadCloud size={20} />
                            Exportar
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-indigo-900/30 transition-all hover:scale-105"
                        >
                            <Plus size={20} />
                            Nova Jornada
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {activeClient.journeys.map(journey => (
                    <JourneyItem key={journey.id} journey={journey} />
                ))}

                {activeClient.journeys.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 border border-gray-700 rounded-2xl">
                        <Milestone size={64} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Nenhuma Jornada Criada</h3>
                        <p className="text-gray-500 max-w-md text-center mb-6">
                            Comece definindo uma jornada estratégica para estruturar os objetivos e metas do cliente.
                        </p>
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                            >
                                Criar Primeira Jornada
                            </button>
                        )}
                    </div>
                )}
            </div>

            <AddItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={(name) => addJourney(activeClient.id, name)}
                title="Nova Jornada"
                placeholder="Nome da Jornada (ex: Implementação Q1)"
            />
        </div>
    );
};

const ChatbotView: React.FC = () => {
    const { activeClient, currentUser, addChatSession, updateChatSession } = useData();
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const sessions = activeClient?.chatSessions || [];
    const activeSession = sessions.find(s => s.id === activeSessionId);

    const handleNewChat = () => {
        if (!activeClient) return;
        const session = addChatSession(activeClient.id);
        setActiveSessionId(session.id);
    };

    const handleSend = async () => {
        if (!activeClient || !activeSession || !input.trim()) return;
        
        const userMsg: ChatMessage = { sender: 'user', text: input, timestamp: new Date().toISOString() };
        const updatedMessages = [...activeSession.messages, userMsg];
        
        // Optimistic update
        updateChatSession(activeClient.id, activeSession.id, { messages: updatedMessages });
        setInput('');
        setIsTyping(true);

        // Generate AI response
        const contextDocs = activeClient.deliverables; // Use all for simplicity
        const aiResponseText = await generateChatResponseWithContext(
            input,
            contextDocs,
            activeSession.tone,
            activeSession.size,
            activeSession.orientation
        );

        const aiMsg: ChatMessage = { sender: 'ai', text: aiResponseText, timestamp: new Date().toISOString() };
        updateChatSession(activeClient.id, activeSession.id, { messages: [...updatedMessages, aiMsg] });
        setIsTyping(false);
    };

    if (!activeClient) return null;

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            <div className="w-64 bg-gray-800/30 rounded-xl border border-gray-700 flex flex-col p-4">
                <button onClick={handleNewChat} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg mb-4 flex items-center justify-center gap-2">
                    <Plus size={18} /> Nova Conversa
                </button>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {sessions.map(session => (
                        <button
                            key={session.id}
                            onClick={() => setActiveSessionId(session.id)}
                            className={`w-full text-left p-3 rounded-lg text-sm truncate ${
                                activeSessionId === session.id ? 'bg-indigo-900/50 text-white border border-indigo-500/50' : 'text-gray-400 hover:bg-gray-800'
                            }`}
                        >
                            {session.messages.length > 0 ? session.messages[0].text : 'Nova Conversa'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-gray-800/30 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
                {activeSession ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {activeSession.messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                                        msg.sender === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-br-none' 
                                            : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                    }`}>
                                        <MarkdownContentRenderer content={msg.text} />
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 p-4 rounded-2xl rounded-bl-none flex gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Faça uma pergunta sobre os documentos..."
                                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 text-white focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button onClick={handleSend} className="p-3 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700">
                                <SendHorizonal size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <BrainCircuit size={64} className="mb-4 opacity-20" />
                        <p>Selecione ou inicie uma nova conversa</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CreateAssessmentModal: React.FC<{ onClose: () => void; onCreate: (scores: PillarScores, generalNote?: string) => void; initialAssessment: Assessment | null; }> = ({ onClose, onCreate, initialAssessment }) => {
    // Initial state setup based on pillars
    const [scores, setScores] = useState<PillarScores>(() => {
        const initial = {} as PillarScores;
        PILLARS.forEach(p => {
            initial[p] = { responses: Array(10).fill(0), goal: 80, notes: '' };
        });
        return initial;
    });

    const [generalNote, setGeneralNote] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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
        onCreate(scores, generalNote);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Nova Avaliação</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                         <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-bold text-white">Nota Geral da Avaliação</h3>
                             <button
                                 onClick={handleGenerateNote}
                                 disabled={isGenerating}
                                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                             >
                                 <Sparkles size={14} />
                                 {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                             </button>
                         </div>
                        <textarea
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white h-24"
                            placeholder="Escreva uma observação geral sobre a maturidade comercial da empresa..."
                            value={generalNote}
                            onChange={(e) => setGeneralNote(e.target.value)}
                        />
                     </div>

                    {PILLARS.map(pillar => (
                        <div key={pillar} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-bold text-indigo-400 mb-4">{PILLAR_DATA[pillar].name}</h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {PILLAR_QUESTIONS[pillar].map((q, idx) => (
                                    <div key={q.id} className="space-y-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-indigo-500/50 transition-colors">
                                        <p className="text-sm font-medium text-white">{q.id} {q.question}</p>
                                        <div className="space-y-2">
                                            {[0, 25, 50, 75, 100].map((val) => {
                                                const value = val as 0 | 25 | 50 | 75 | 100;
                                                return (
                                                    <label key={val} className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all border ${
                                                        scores[pillar].responses[idx] === value
                                                            ? 'bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500/50'
                                                            : 'bg-gray-900/30 border-gray-700 hover:bg-gray-800 hover:border-gray-500'
                                                    }`}>
                                                        <div className="mt-0.5">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                                scores[pillar].responses[idx] === value
                                                                    ? 'border-indigo-500 bg-indigo-500'
                                                                    : 'border-gray-500 bg-transparent'
                                                            }`}>
                                                                {scores[pillar].responses[idx] === value && <div className="w-2 h-2 rounded-full bg-white" />}
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                name={`q-${pillar}-${idx}`}
                                                                value={value}
                                                                checked={scores[pillar].responses[idx] === value}
                                                                onChange={() => handleScoreChange(pillar, idx, value)}
                                                                className="hidden"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                                    value === 0 ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                                                                    value === 25 ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' :
                                                                    value === 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
                                                                    value === 75 ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                                                                    'bg-green-900/30 text-green-400 border border-green-900/50'
                                                                }`}>{value}%</span>
                                                            </div>
                                                            <span className="text-xs text-gray-300 leading-tight block">{q.options[value]}</span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <footer className="p-4 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Cancelar</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Criar Avaliação</button>
                </footer>
            </div>
        </div>
    );
};

const EditAssessmentModal: React.FC<{ assessment: Assessment; initialPillar?: Pillar; onClose: () => void; }> = ({ assessment, initialPillar, onClose }) => {
    const { updateAssessment, activeClient } = useData();
    const [scores, setScores] = useState<PillarScores>(JSON.parse(JSON.stringify(assessment.scores)));
    const [generalNote, setGeneralNote] = useState(assessment.generalNote || '');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateNote = async () => {
        setIsGenerating(true);
        const note = await generateGeneralAssessmentNote(scores);
        setGeneralNote(note);
        setIsGenerating(false);
    };

    const handleSave = () => {
        if (activeClient) {
            updateAssessment(activeClient.id, assessment.id, scores, generalNote);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Editar Avaliação</h2>
                    <button onClick={onClose}><X className="text-gray-400" /></button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                         <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-bold text-white">Nota Geral da Avaliação</h3>
                             <button
                                 onClick={handleGenerateNote}
                                 disabled={isGenerating}
                                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                             >
                                 <Sparkles size={14} />
                                 {isGenerating ? 'Gerando...' : 'Regerar com IA'}
                             </button>
                         </div>
                        <textarea
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white h-24"
                            placeholder="Escreva uma observação geral sobre a maturidade comercial da empresa..."
                            value={generalNote}
                            onChange={(e) => setGeneralNote(e.target.value)}
                        />
                     </div>

                    {PILLARS.map(pillar => (
                        <div key={pillar} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-bold text-indigo-400 mb-4">{PILLAR_DATA[pillar].name}</h3>
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {PILLAR_QUESTIONS[pillar].map((q, idx) => (
                                    <div key={q.id} className="space-y-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-indigo-500/50 transition-colors">
                                        <p className="text-sm font-medium text-white">{q.id} {q.question}</p>
                                        <div className="space-y-2">
                                            {[0, 25, 50, 75, 100].map((val) => {
                                                const value = val as 0 | 25 | 50 | 75 | 100;
                                                return (
                                                    <label key={val} className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all border ${
                                                        scores[pillar].responses[idx] === value
                                                            ? 'bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500/50'
                                                            : 'bg-gray-900/30 border-gray-700 hover:bg-gray-800 hover:border-gray-500'
                                                    }`}>
                                                        <div className="mt-0.5">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                                scores[pillar].responses[idx] === value
                                                                    ? 'border-indigo-500 bg-indigo-500'
                                                                    : 'border-gray-500 bg-transparent'
                                                            }`}>
                                                                {scores[pillar].responses[idx] === value && <div className="w-2 h-2 rounded-full bg-white" />}
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                name={`q-edit-${pillar}-${idx}`}
                                                                value={value}
                                                                checked={scores[pillar].responses[idx] === value}
                                                                onChange={() => {
                                                                    const newScores = { ...scores };
                                                                    newScores[pillar].responses[idx] = value;
                                                                    setScores(newScores);
                                                                }}
                                                                className="hidden"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                                    value === 0 ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                                                                    value === 25 ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' :
                                                                    value === 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
                                                                    value === 75 ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                                                                    'bg-green-900/30 text-green-400 border border-green-900/50'
                                                                }`}>{value}%</span>
                                                            </div>
                                                            <span className="text-xs text-gray-300 leading-tight block">{q.options[value]}</span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Notas / Observações</label>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white"
                                    value={scores[pillar].notes}
                                    onChange={e => {
                                        const newScores = {...scores};
                                        newScores[pillar].notes = e.target.value;
                                        setScores(newScores);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <footer className="p-4 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
