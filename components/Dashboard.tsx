
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useData } from '../App';
import {
    LayoutDashboard, BarChart3, Clock, Briefcase, BotMessageSquare, Library, LogOut, Menu, X, Plus, ChevronsUpDown, Check, FileDown, Rocket, Target, Minus, AlertTriangle, Building, Package, Megaphone, Handshake, Users, SlidersHorizontal, Building2, Compass, Goal, Network, Workflow, BarChartBig, HandCoins, Database, Edit, ChevronDown, ChevronUp, Info, Sheet,
    UploadCloud, Trash2, FileText, ClipboardCheck, User, Paperclip, File as FileIcon, Pencil, SendHorizonal, BrainCircuit, CheckSquare, Square, MessageSquarePlus, Settings, Grip, CircleDot, Milestone, ListChecks, DownloadCloud
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PILLAR_DATA, PILLARS, INITIAL_PILLAR_SCORE, PILLAR_QUESTIONS, CLIENT_INFO_SECTIONS_ORDER, BSLABS_LOGO_BASE64, CONSULTING_JOURNEY_TEMPLATE } from '../constants';
import { generateExecutiveSummary, generateChatResponseWithContext } from '../services/geminiService';
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
                    <img src={BSLABS_LOGO_BASE64} alt="BSLabs Logo" className="h-12 w-auto" />
                    <p className="text-lg">Relatório de Maturidade Comercial</p>
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

    const handleCreateNewAssessment = (scores: PillarScores) => {
        if (activeClient) {
            addAssessment(activeClient.id, scores);
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

// Sidebar, Header Components (no major changes) ...
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
            // Use defined accessible views, or a safe default.
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
                 <img src={BSLABS_LOGO_BASE64} alt="BSLabs Logo" className="h-8 w-auto" />
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
            <p className="text-sm text-gray-400 mb-4">Média dos 7 pilares.</p>
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
                // Find the entry that is closest to the top of the viewport
                visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                setActiveTocId(visibleEntries[0].target.id);
            }
        };

        observer.current = new IntersectionObserver(callback, {
            root: contentRef.current,
            rootMargin: "0px 0px -80% 0px",
            threshold: 0.1
        });

        const elements = contentRef.current?.querySelectorAll('.heading-marker');
        if (elements) {
            elements.forEach(el => observer.current?.observe(el));
        }

        return () => observer.current?.disconnect();
    }, [toc]);


    const handleTocClick = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-indigo-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-indigo-800/50 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-6 h-6 text-indigo-400 flex-shrink-0"/>
                        <div className="min-w-0">
                           <h2 className="text-xl font-bold text-white truncate" title={deliverable.name}>{deliverable.name}</h2>
                           <p className="text-sm text-gray-400 truncate" title={deliverable.description}>{deliverable.description}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0 ml-4"><X size={20} /></button>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    {toc.length > 0 && (
                        <aside className="w-1/4 max-w-xs flex-shrink-0 p-4 border-r border-indigo-800/50 overflow-y-auto custom-scrollbar">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Tópicos</h3>
                            <ul className="space-y-1">
                                {toc.map(item => (
                                    <li key={item.id}>
                                        <button 
                                            onClick={() => handleTocClick(item.id)}
                                            className={`w-full text-left text-sm py-1.5 rounded-md transition-colors ${activeTocId === item.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                                            style={{ paddingLeft: `${(item.level - 1) * 1 + 0.75}rem` }}
                                        >
                                            {item.text}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    )}
                    <main ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar p-8">
                         <MarkdownContentRenderer content={deliverable.content} />
                    </main>
                </div>
            </div>
            <style>{`
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
                .line-clamp-3 {
                   overflow: hidden;
                   display: -webkit-box;
                   -webkit-box-orient: vertical;
                   -webkit-line-clamp: 3;
                }
            `}</style>
        </div>
    );
};

// Fix: Added missing AddDeliverableModal component
const AddDeliverableModal: React.FC<{
    onClose: () => void;
    onSave: (name: string, description: string, content: string) => void;
}> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && description.trim() && content.trim()) {
            onSave(name.trim(), description.trim(), content.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-indigo-700/50 flex flex-col max-h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                        <h2 className="text-xl font-bold">Adicionar Novo Entregável</h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
                    </header>
                    <main className="p-6 space-y-4 overflow-y-auto">
                        <div>
                            <label htmlFor="deliverable-name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Entregável</label>
                            <input
                                id="deliverable-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ex: Playbook de Vendas"
                            />
                        </div>
                        <div>
                            <label htmlFor="deliverable-description" className="block text-sm font-medium text-gray-300 mb-1">Descrição Curta</label>
                            <input
                                id="deliverable-description"
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Uma frase que resume o documento"
                            />
                        </div>
                        <div>
                            <label htmlFor="deliverable-content" className="block text-sm font-medium text-gray-300 mb-1">Conteúdo (Markdown)</label>
                            <textarea
                                id="deliverable-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={10}
                                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                                placeholder="Use Markdown para formatar o conteúdo. Ex: # Título, - Item de lista, **negrito**"
                            />
                        </div>
                    </main>
                    <footer className="flex justify-end items-center p-4 border-t border-indigo-800/50 gap-4 mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar Entregável</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


// Resource Library View
const ResourceLibraryView: React.FC = () => {
    const { activeClient, addDeliverable, deleteDeliverable, currentUser } = useData();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingDeliverable, setViewingDeliverable] = useState<Deliverable | null>(null);
    const [deletingDeliverable, setDeletingDeliverable] = useState<Deliverable | null>(null);

    const handleSaveDeliverable = (name: string, description: string, content: string) => {
        if(activeClient) {
            addDeliverable(activeClient.id, name, description, content);
        }
    };
    
    const handleConfirmDelete = () => {
        if (activeClient && deletingDeliverable) {
            deleteDeliverable(activeClient.id, deletingDeliverable.id);
            setDeletingDeliverable(null);
        }
    }

    if (!activeClient) return null;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Biblioteca de {activeClient.name}</h2>
                        <p className="text-gray-400">Materiais, playbooks e documentos de apoio.</p>
                    </div>
                    {currentUser?.role === 'admin' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Adicionar Entregável
                        </button>
                    )}
                </div>

                {activeClient.deliverables.length === 0 ? (
                    <div className="text-center p-12 bg-gray-800/30 rounded-lg">
                        <Library className="mx-auto w-12 h-12 text-gray-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Biblioteca Vazia</h3>
                        <p className="text-gray-400">Nenhum documento foi adicionado ainda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeClient.deliverables.map(deliverable => (
                            <DeliverableCard 
                                key={deliverable.id} 
                                deliverable={deliverable} 
                                onDelete={() => setDeletingDeliverable(deliverable)} 
                                onView={() => setViewingDeliverable(deliverable)}
                            />
                        ))}
                    </div>
                )}
            </div>
            {isAddModalOpen && (
                <AddDeliverableModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSaveDeliverable}
                />
            )}
            {viewingDeliverable && (
                <DeliverableViewerModal
                    deliverable={viewingDeliverable}
                    onClose={() => setViewingDeliverable(null)}
                />
            )}
            {deletingDeliverable && (
                <ConfirmationModal
                    title="Confirmar Exclusão"
                    message={`Tem certeza que deseja excluir o entregável "${deletingDeliverable.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => setDeletingDeliverable(null)}
                    confirmText="Excluir"
                />
            )}
        </>
    );
};

const DeliverableCard: React.FC<{ deliverable: Deliverable; onDelete: () => void; onView: () => void; }> = ({ deliverable, onDelete, onView }) => {
    const { currentUser } = useData();
    return (
        <div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 flex flex-col group transition-all duration-300 hover:border-indigo-500 hover:-translate-y-1 cursor-pointer"
            onClick={onView}
        >
            <div className="p-4 flex flex-col flex-1">
                 <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                         <div className="p-2 bg-indigo-900/50 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0"/>
                         </div>
                         <h3 className="text-lg font-bold text-white truncate" title={deliverable.name}>{deliverable.name}</h3>
                    </div>
                    {currentUser?.role === 'admin' && (
                         <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-full hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="Excluir">
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-400 mb-4 flex-1 line-clamp-3">{deliverable.description}</p>
                <div className="mt-auto pt-4 border-t border-indigo-800/30 text-center">
                    <span className="text-sm font-semibold text-indigo-300 group-hover:text-white transition-colors">
                        Ler Documento
                    </span>
                </div>
            </div>
        </div>
    );
};


// Client Info View
const ClientInfoView: React.FC = () => {
    const { activeClient } = useData();

    const handleExport = useCallback(() => {
        if (!activeClient) return;

        let content = `Informações do Cliente: ${activeClient.name}\n`;
        content += `Data da Exportação: ${new Date().toLocaleDateString('pt-BR')}\n`;
        content += "==================================================\n\n";

        CLIENT_INFO_SECTIONS_ORDER.forEach(sectionId => {
            const section = activeClient.clientInfo[sectionId];
            content += `## ${section.title}\n\n`;
            section.questions.forEach(q => {
                content += `**${q.question}**\n`;
                content += `${q.answer || '(Não respondido)'}\n`;
                if(q.attachments && q.attachments.length > 0) {
                    content += `Anexos: ${q.attachments.map(a => a.name).join(', ')}\n`
                }
                content += '\n';
            });
            content += "--------------------------------------------------\n\n";
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `info_${activeClient.name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }, [activeClient]);

    if (!activeClient) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Informações do Cliente</h2>
                    <p className="text-gray-400">Base de conhecimento centralizada sobre {activeClient.name}.</p>
                </div>
                 <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                    <FileDown className="h-4 w-4" />
                    Exportar
                </button>
            </div>
            <div className="space-y-4">
                {CLIENT_INFO_SECTIONS_ORDER.map(sectionId => (
                    <ClientInfoSection key={sectionId} sectionId={sectionId} />
                ))}
            </div>
        </div>
    );
};

const ClientInfoSection: React.FC<{ sectionId: ClientInfoSectionId }> = ({ sectionId }) => {
    const { activeClient, updateClientInfoAnswer, addClientInfoQuestion, deleteClientInfoQuestion, addClientInfoAttachment, deleteClientInfoAttachment } = useData();
    const [isExpanded, setIsExpanded] = useState(sectionId === 'summary'); // Expand first section by default
    const [isManageModalOpen, setManageModalOpen] = useState(false);
    
    if (!activeClient || !activeClient.clientInfo || !activeClient.clientInfo[sectionId]) return null;
    
    const section = activeClient.clientInfo[sectionId];
    const totalQuestions = section.questions.length;
    const answeredQuestions = section.questions.filter(q => q.answer.trim() !== '').length;
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 100;

    const handleSaveManagedQuestions = (newQuestionText: string, idsToDelete: string[]) => {
        if(newQuestionText) {
            addClientInfoQuestion(activeClient.id, sectionId, newQuestionText);
        }
        idsToDelete.forEach(id => {
            deleteClientInfoQuestion(activeClient.id, sectionId, id);
        });
    };
    
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
        const file = e.target.files?.[0];
        if (file && activeClient) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("O arquivo é muito grande. O limite é de 2MB.");
                return;
            }
            try {
                await addClientInfoAttachment(activeClient.id, sectionId, questionId, file);
            } catch (error) {
                console.error("Upload failed", error);
                alert("Falha ao fazer upload do anexo.");
            }
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 overflow-hidden">
            <header className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{section.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-full max-w-xs bg-gray-700 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-400">{completionPercentage}%</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setManageModalOpen(true); }}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        title="Gerenciar perguntas"
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </header>
            {isExpanded && (
                <main className="p-4 border-t border-indigo-800/30 space-y-4">
                    {section.questions.map(q => (
                        <div key={q.id} className={`p-3 rounded-lg ${q.answer.trim() === '' && (q.attachments || []).length === 0 ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-900/30'}`}>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">{q.question}</label>
                            <textarea
                                value={q.answer}
                                onChange={(e) => updateClientInfoAnswer(activeClient.id, sectionId, q.id, e.target.value)}
                                placeholder="Sua resposta aqui..."
                                rows={2}
                                className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                            />
                             <div className="mt-2 flex justify-between items-center">
                                <div className="flex flex-wrap gap-2">
                                    {(q.attachments || []).map(att => (
                                        <div key={att.id} className="flex items-center gap-2 bg-indigo-900/50 px-2 py-1 rounded-md text-xs">
                                            <FileIcon size={14} className="text-indigo-400"/>
                                            <span className="text-indigo-300">{att.name}</span>
                                            <button 
                                                onClick={() => deleteClientInfoAttachment(activeClient.id, sectionId, q.id, att.id)}
                                                className="p-0.5 rounded-full hover:bg-red-500/50">
                                                <X size={12} className="text-red-400"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    // Fix: The ref callback function must not return a value.
                                    // An arrow function with a body in braces implicitly returns undefined.
                                    ref={el => { fileInputRefs.current[q.id] = el; }}
                                    onChange={(e) => handleAttachmentUpload(e, q.id)}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRefs.current[q.id]?.click()}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                    title="Anexar arquivo"
                                >
                                    <Paperclip size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </main>
            )}
            {isManageModalOpen && (
                <ManageQuestionsModal
                    sectionTitle={section.title}
                    questions={section.questions}
                    onClose={() => setManageModalOpen(false)}
                    onSave={handleSaveManagedQuestions}
                />
            )}
        </div>
    );
};

const ManageQuestionsModal: React.FC<{
    sectionTitle: string;
    questions: ClientInfoQuestion[];
    onClose: () => void;
    onSave: (newQuestionText: string, idsToDelete: string[]) => void;
}> = ({ sectionTitle, questions, onClose, onSave }) => {
    const [newQuestion, setNewQuestion] = useState('');
    const [toDelete, setToDelete] = useState<Set<string>>(new Set());

    const handleToggleDelete = (id: string) => {
        setToDelete(prev => {
            const newSet = new Set(prev);
            if(newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        onSave(newQuestion.trim(), Array.from(toDelete));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-indigo-700/50 flex flex-col max-h-[80vh]">
                <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                    <h2 className="text-xl font-bold">Gerenciar Perguntas: <span className="text-indigo-400">{sectionTitle}</span></h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto space-y-4">
                    <h3 className="font-semibold text-gray-300">Adicionar Nova Pergunta</h3>
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Digite sua nova pergunta aqui"
                        className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <h3 className="font-semibold text-gray-300 pt-4">Excluir Perguntas Existentes</h3>
                    <div className="space-y-2">
                        {questions.filter(q => !q.isDefault).map(q => (
                            <div key={q.id} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-md">
                                <button onClick={() => handleToggleDelete(q.id)}>
                                    {toDelete.has(q.id) 
                                        ? <CheckSquare size={20} className="text-red-400" /> 
                                        : <Square size={20} className="text-gray-500" />
                                    }
                                </button>
                                <span className={`${toDelete.has(q.id) ? 'line-through text-red-400/70' : 'text-gray-300'}`}>{q.question}</span>
                            </div>
                        ))}
                         {questions.filter(q => !q.isDefault).length === 0 && (
                            <p className="text-sm text-gray-500 italic">Nenhuma pergunta personalizada para excluir.</p>
                         )}
                    </div>
                </main>
                <footer className="flex justify-end items-center p-4 border-t border-indigo-800/50 gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
};


// Planning View (NEW - REPLACES WeeklyPlanningView)
const PlanningView: React.FC = () => {
    const { activeClient, currentUser, importJourney } = useData();

    const handleImportTemplate = () => {
        if (activeClient && window.confirm("Deseja importar a 'Jornada de Inputs da Consultoria (12 Semanas)' para este cliente?")) {
            importJourney(activeClient.id, CONSULTING_JOURNEY_TEMPLATE);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Planejamento de Metas (Jornadas)</h2>
                    <p className="text-gray-400">Defina e acompanhe os objetivos, metas e ações de longo prazo.</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <button
                        onClick={handleImportTemplate}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-200 bg-indigo-900/50 hover:bg-indigo-800/80 border border-indigo-500/50 rounded-md transition-colors"
                    >
                        <DownloadCloud className="h-4 w-4" />
                        Importar Jornada de Inputs
                    </button>
                )}
            </div>
            <GoalsView />
        </div>
    );
};

const AddItemForm: React.FC<{
    onSave: (name: string) => void;
    onCancel: () => void;
    placeholder: string;
    initialValue?: string;
    isEditing?: boolean;
}> = ({ onSave, onCancel, placeholder, initialValue = '', isEditing = false }) => {
    const [name, setName] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        } else if (!isEditing) {
            onCancel(); // Cancel if adding and name is empty
        } else {
            onSave(initialValue); // If editing and name is cleared, revert to initial to avoid blank names
        }
    };

    return (
        <div className="bg-gray-700/50 p-2 rounded-lg flex flex-col gap-2 my-1">
            <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray-900/50 p-2 rounded-md border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') onCancel();
                }}
                onBlur={handleSave} // Save on blur
            />
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="px-3 py-1 text-xs font-semibold text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md">Cancelar</button>
                <button onClick={handleSave} className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar</button>
            </div>
        </div>
    );
};

const GoalsView: React.FC = () => {
    const { activeClient, addJourney, currentUser } = useData();
    const [isAdding, setIsAdding] = useState(false);
    if (!activeClient) return null;

    return (
        <div className="space-y-4">
            {activeClient.journeys.map(journey => (
                <JourneyItem key={journey.id} journey={journey} />
            ))}
            {currentUser?.role === 'admin' && (
                <>
                    {isAdding ? (
                        <AddItemForm
                            onSave={(name) => {
                                addJourney(activeClient.id, name);
                                setIsAdding(false);
                            }}
                            onCancel={() => setIsAdding(false)}
                            placeholder="Nome da nova jornada"
                        />
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold text-gray-400 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-700 hover:border-indigo-600 transition-colors">
                            <Plus size={16} /> Adicionar Jornada
                        </button>
                    )}
                </>
            )}
            {activeClient.journeys.length === 0 && !isAdding && (
                <div className="text-center p-12 bg-gray-800/30 rounded-lg">
                    <Target className="mx-auto w-12 h-12 text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Sem Metas Definidas</h3>
                    <p className="text-gray-400">Crie a primeira Jornada para começar o planejamento estratégico.</p>
                </div>
            )}
        </div>
    );
};

const JourneyItem: React.FC<{ journey: Journey }> = ({ journey }) => {
    const { activeClient, currentUser, updateJourney, deleteJourney, addObjective } = useData();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingObjective, setIsAddingObjective] = useState(false);
    const [journeyToDelete, setJourneyToDelete] = useState<Journey | null>(null);

    if (!activeClient) return null;

    return (
        <div className="bg-gray-800/50 rounded-xl border border-indigo-800/50">
            <header 
                className="p-4 flex justify-between items-center cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: journey.color}}></div>
                    {isEditing ? (
                         <AddItemForm
                            isEditing
                            initialValue={journey.name}
                            placeholder="Nome da Jornada"
                            onSave={(name) => {
                                updateJourney(activeClient.id, journey.id, name, journey.color);
                                setIsEditing(false);
                            }}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <h3 className="text-lg font-bold">{journey.name}</h3>
                    )}
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-24">
                        <ProgressBar progress={journey.progress} color={journey.color} />
                    </div>
                    {currentUser?.role === 'admin' && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e)=>{e.stopPropagation(); setIsEditing(true)}} className="p-2 rounded-full hover:bg-gray-700"><Pencil size={14} /></button>
                             <button onClick={(e)=>{e.stopPropagation(); setJourneyToDelete(journey)}} className="p-2 rounded-full hover:bg-gray-700"><Trash2 size={14} /></button>
                        </div>
                    )}
                   <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </header>
            {isExpanded && (
                <div className="p-4 border-t border-indigo-800/50 space-y-3">
                    {journey.objectives.map(objective => (
                        <ObjectiveItem key={objective.id} journey={journey} objective={objective} />
                    ))}
                    {currentUser?.role === 'admin' && (
                        <>
                        {isAddingObjective ? (
                             <AddItemForm
                                placeholder="Nome do novo objetivo"
                                onSave={(name) => {
                                    addObjective(activeClient.id, journey.id, name);
                                    setIsAddingObjective(false);
                                }}
                                onCancel={() => setIsAddingObjective(false)}
                            />
                        ) : (
                             <button onClick={() => setIsAddingObjective(true)} className="w-full flex items-center justify-center gap-2 p-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-900/50 hover:bg-gray-700/80 rounded-md transition-colors">
                                <Plus size={14} /> Adicionar Objetivo
                            </button>
                        )}
                        </>
                    )}
                </div>
            )}
             {journeyToDelete && (
                <ConfirmationModal
                    title="Excluir Jornada"
                    message={`Tem certeza que deseja excluir a jornada "${journeyToDelete.name}" e todos os seus objetivos, metas e ações?`}
                    onConfirm={() => {
                        deleteJourney(activeClient.id, journeyToDelete.id);
                        setJourneyToDelete(null);
                    }}
                    onClose={() => setJourneyToDelete(null)}
                />
            )}
        </div>
    );
}

const ObjectiveItem: React.FC<{ journey: Journey; objective: Objective }> = ({ journey, objective }) => {
    const { activeClient, currentUser, updateObjective, deleteObjective, addKeyResult } = useData();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    if (!activeClient) return null;

    return (
        <div className="bg-gray-900/30 rounded-lg border border-gray-700/50">
             <header className="p-3 flex justify-between items-center cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <CircleDot size={16} className="text-indigo-400"/>
                     {isEditing ? (
                         <AddItemForm isEditing initialValue={objective.name} placeholder="Nome do Objetivo"
                            onSave={(name) => { updateObjective(activeClient.id, journey.id, objective.id, name); setIsEditing(false); }}
                            onCancel={() => setIsEditing(false)} />
                    ) : ( <h4 className="font-semibold">{objective.name}</h4> )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-20"><ProgressBar progress={objective.progress} /></div>
                     {currentUser?.role === 'admin' && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e)=>{e.stopPropagation(); setIsEditing(true)}} className="p-1 rounded-full hover:bg-gray-700"><Pencil size={12} /></button>
                             <button onClick={(e)=>{e.stopPropagation(); deleteObjective(activeClient.id, journey.id, objective.id)}} className="p-1 rounded-full hover:bg-gray-700"><Trash2 size={12} /></button>
                        </div>
                    )}
                    <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
             </header>
             {isExpanded && (
                <div className="p-3 border-t border-gray-700/50 space-y-2">
                    {objective.keyResults.map(kr => <KeyResultItem key={kr.id} journey={journey} objective={objective} keyResult={kr} />)}
                     {currentUser?.role === 'admin' && (
                         <>
                         {isAdding ? (
                              <AddItemForm placeholder="Nome da nova meta (KR)"
                                 onSave={(name) => { addKeyResult(activeClient.id, journey.id, objective.id, name); setIsAdding(false); }}
                                 onCancel={() => setIsAdding(false)} />
                         ) : (
                              <button onClick={() => setIsAdding(true)} className="w-full text-center p-1.5 text-xs text-gray-500 hover:text-white rounded-md hover:bg-gray-700/50">
                                + Adicionar Meta (KR)
                            </button>
                         )}
                         </>
                     )}
                </div>
             )}
        </div>
    );
};

const KeyResultItem: React.FC<{ journey: Journey; objective: Objective; keyResult: KeyResult }> = ({ journey, objective, keyResult }) => {
    const { activeClient, currentUser, updateKeyResult, deleteKeyResult, addInitiative } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    if(!activeClient) return null;

    return (
         <div className="bg-gray-900/20 rounded-md border border-gray-700/30 p-2 pl-4 space-y-2">
            <div className="flex justify-between items-center group">
                 <div className="flex items-center gap-2">
                     <Milestone size={14} className="text-gray-400"/>
                     {isEditing ? (
                         <AddItemForm isEditing initialValue={keyResult.name} placeholder="Nome da Meta"
                            onSave={(name) => { updateKeyResult(activeClient.id, journey.id, objective.id, keyResult.id, name); setIsEditing(false); }}
                            onCancel={() => setIsEditing(false)} />
                    ) : ( <p className="text-sm">{keyResult.name}</p> )}
                 </div>
                 {currentUser?.role === 'admin' && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e)=>{e.stopPropagation(); setIsEditing(true)}} className="p-1 rounded-full hover:bg-gray-700"><Pencil size={12} /></button>
                         <button onClick={(e)=>{e.stopPropagation(); deleteKeyResult(activeClient.id, journey.id, objective.id, keyResult.id)}} className="p-1 rounded-full hover:bg-gray-700"><Trash2 size={12} /></button>
                    </div>
                )}
            </div>
            <div className="pl-6 space-y-2">
                {keyResult.initiatives.map(i => <InitiativeItem key={i.id} journey={journey} objective={objective} keyResult={keyResult} initiative={i} />)}
                {currentUser?.role === 'admin' && (
                     <>
                     {isAdding ? (
                          <AddItemForm placeholder="Nome da nova iniciativa"
                             onSave={(name) => { addInitiative(activeClient.id, journey.id, objective.id, keyResult.id, name); setIsAdding(false); }}
                             onCancel={() => setIsAdding(false)} />
                     ) : (
                          <button onClick={() => setIsAdding(true)} className="w-full text-left p-1 text-xs text-gray-500 hover:text-white">
                            + Adicionar Iniciativa
                        </button>
                     )}
                     </>
                 )}
            </div>
         </div>
    );
};

const InitiativeItem: React.FC<{ journey: Journey; objective: Objective; keyResult: KeyResult; initiative: Initiative }> = ({ journey, objective, keyResult, initiative }) => {
    const { activeClient, currentUser, updateInitiative, deleteInitiative, addAction } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    if(!activeClient) return null;
    
    return (
        <div className="bg-gray-900/20 rounded-md p-2 space-y-2">
            <div className="flex justify-between items-center group">
                <div className="flex items-center gap-2">
                    <ListChecks size={14} className="text-gray-400"/>
                    {isEditing ? (
                         <AddItemForm isEditing initialValue={initiative.name} placeholder="Nome da Iniciativa"
                            onSave={(name) => { updateInitiative(activeClient.id, journey.id, objective.id, keyResult.id, initiative.id, name); setIsEditing(false); }}
                            onCancel={() => setIsEditing(false)} />
                    ) : ( <p className="text-sm font-medium text-gray-300">{initiative.name}</p> )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-16"><ProgressBar progress={initiative.progress} color="#a5b4fc" /></div>
                     {currentUser?.role === 'admin' && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e)=>{e.stopPropagation(); setIsEditing(true)}} className="p-1 rounded-full hover:bg-gray-700"><Pencil size={12} /></button>
                             <button onClick={(e)=>{e.stopPropagation(); deleteInitiative(activeClient.id, journey.id, objective.id, keyResult.id, initiative.id)}} className="p-1 rounded-full hover:bg-gray-700"><Trash2 size={12} /></button>
                        </div>
                    )}
                </div>
            </div>
            <div className="pl-6 space-y-1">
                {initiative.actions.map(a => <ActionItem key={a.id} journey={journey} objective={objective} keyResult={keyResult} initiative={initiative} action={a} />)}
                 {currentUser?.role === 'admin' && (
                     <>
                     {isAdding ? (
                          <AddItemForm placeholder="Nome da nova ação"
                             onSave={(name) => { addAction(activeClient.id, journey.id, objective.id, keyResult.id, initiative.id, name); setIsAdding(false); }}
                             onCancel={() => setIsAdding(false)} />
                     ) : (
                          <button onClick={() => setIsAdding(true)} className="w-full text-left p-1 text-xs text-gray-500 hover:text-white">
                            + Adicionar Ação
                        </button>
                     )}
                     </>
                 )}
            </div>
        </div>
    );
};

const ActionItem: React.FC<{ journey: Journey; objective: Objective; keyResult: KeyResult; initiative: Initiative; action: Action }> = ({ journey, objective, keyResult, initiative, action }) => {
    const { activeClient, currentUser, updateAction, deleteAction } = useData();
    const [isEditing, setIsEditing] = useState(false);
    
    if(!activeClient) return null;

    const handleToggleComplete = () => {
        updateAction(activeClient.id, journey.id, objective.id, keyResult.id, initiative.id, action.id, action.name, !action.isCompleted);
    };

    return (
        <div className="flex items-center justify-between group text-sm">
            <div className="flex items-center gap-2">
                <button onClick={handleToggleComplete} disabled={currentUser?.role !== 'admin'}>
                    {action.isCompleted ? <CheckSquare size={14} className="text-green-400" /> : <Square size={14} className="text-gray-500" />}
                </button>
                {isEditing ? (
                    <AddItemForm isEditing initialValue={action.name} placeholder="Nome da Ação"
                        onSave={(name) => { updateAction(activeClient.id, journey.id, objective.id, keyResult.id, initiative.id, action.id, name, action.isCompleted); setIsEditing(false); }}
                        onCancel={() => setIsEditing(false)} />
                ) : (
                    <span className={`${action.isCompleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>{action.name}</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {currentUser?.role === 'admin' && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setIsEditing(true)} className="p-1 rounded-full hover:bg-gray-700"><Pencil size={12} /></button>
                         <button onClick={() => deleteAction(activeClient.id, journey.id, objective.id, keyResult.id, initiative.id, action.id)} className="p-1 rounded-full hover:bg-gray-700"><Trash2 size={12} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};


const ProgressBar: React.FC<{ progress: number; color?: string }> = ({ progress, color = '#4f46e5' }) => {
    return (
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div
                className="h-2 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: color, transition: 'width 0.5s ease-in-out' }}
            ></div>
        </div>
    );
};

// Chatbot View
const ChatbotView: React.FC = () => {
    const { activeClient, addChatSession, updateChatSession, deleteChatSession } = useData();
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    const activeSession = useMemo(() => {
        if (!activeClient || !activeSessionId) return null;
        return (activeClient.chatSessions || []).find(s => s.id === activeSessionId) || null;
    }, [activeClient, activeSessionId]);

    useEffect(() => {
        if (activeClient && activeClient.chatSessions && activeClient.chatSessions.length > 0 && !activeSessionId) {
            setActiveSessionId(activeClient.chatSessions[activeClient.chatSessions.length - 1].id);
        }
    }, [activeClient, activeSessionId]);


    const handleNewChat = () => {
        if (!activeClient) return;
        const newSession = addChatSession(activeClient.id);
        setActiveSessionId(newSession.id);
    };
    
    const handleDeleteChat = (sessionId: string) => {
         if (!activeClient || !window.confirm("Tem certeza que deseja excluir esta conversa?")) return;
         deleteChatSession(activeClient.id, sessionId);
         if (activeSessionId === sessionId) {
             const remainingSessions = (activeClient.chatSessions || []).filter(s => s.id !== sessionId);
             setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[remainingSessions.length-1].id : null);
         }
    };
    
    if(!activeClient) return null;

    return (
         <div className="flex h-full max-h-[calc(100vh-8rem)]">
            <div className="w-1/3 max-w-sm bg-gray-800/50 rounded-l-xl border-r border-indigo-800/30 flex flex-col">
                <div className="p-4 border-b border-indigo-800/30 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Conversas</h2>
                    <button onClick={handleNewChat} className="p-2 rounded-full hover:bg-gray-700">
                        <MessageSquarePlus size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {(activeClient.chatSessions || []).slice().reverse().map(session => (
                        <div 
                            key={session.id} 
                            onClick={() => setActiveSessionId(session.id)}
                            className={`p-3 m-2 rounded-lg cursor-pointer group flex justify-between items-center ${activeSessionId === session.id ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
                        >
                            <p className="truncate text-sm">{session.title}</p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteChat(session.id); }}
                                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-900/50">
                                <Trash2 size={14} className="text-red-400"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-gray-800/30 rounded-r-xl flex flex-col">
                {activeSession ? (
                    <ChatWindow session={activeSession} key={activeSession.id}/>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <BrainCircuit size={48} className="text-gray-500 mb-4"/>
                        <h3 className="text-xl font-bold">Assistente IA</h3>
                        <p className="text-gray-400">Selecione uma conversa ou inicie uma nova para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChatWindow: React.FC<{session: ChatSession}> = ({ session }) => {
    const { activeClient, updateChatSession } = useData();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [session.messages]);

    if(!activeClient) return null;

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;
        setIsLoading(true);
        const userMessage: ChatMessage = { sender: 'user', text: input, timestamp: new Date().toISOString() };
        const updatedMessages = [...session.messages, userMessage];
        updateChatSession(activeClient.id, session.id, { messages: updatedMessages });
        setInput('');

        const contextDocs = activeClient.deliverables.filter(d => session.sourceIds.includes(d.id));

        const aiResponseText = await generateChatResponseWithContext(input, contextDocs, session.tone, session.size, session.orientation);
        
        const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText, timestamp: new Date().toISOString() };
        
        let finalTitle = session.title;
        if (session.title === 'Nova Conversa' && updatedMessages.length === 1) {
            // Very basic title generation
            finalTitle = input.substring(0, 30) + (input.length > 30 ? '...' : '');
        }

        updateChatSession(activeClient.id, session.id, { messages: [...updatedMessages, aiMessage], title: finalTitle });
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full">
            <ChatHeader session={session} />
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {session.messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0"><BotMessageSquare size={20}/></div>}
                        <div className={`max-w-xl p-3 rounded-xl ${msg.sender === 'user' ? 'bg-gray-700' : 'bg-gray-900/50'}`}>
                             <MarkdownContentRenderer content={msg.text} />
                        </div>
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0"><BotMessageSquare size={20}/></div>
                        <div className="max-w-xl p-3 rounded-xl bg-gray-900/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-0"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-indigo-800/30">
                <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-600 rounded-lg pr-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Pergunte algo com base nos documentos selecionados..."
                        rows={1}
                        className="flex-1 bg-transparent p-2 focus:outline-none resize-none max-h-40"
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="p-2 bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600">
                        <SendHorizonal size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatHeader: React.FC<{session: ChatSession}> = ({ session }) => {
    const { activeClient } = useData();
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    if (!activeClient) return null;

    return (
        <div className="p-4 border-b border-indigo-800/30">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{session.title}</h3>
                <button onClick={() => setIsConfigOpen(!isConfigOpen)} className="p-2 rounded-full hover:bg-gray-700">
                    <SlidersHorizontal size={20} />
                </button>
            </div>
            {isConfigOpen && <ChatConfigPanel session={session} />}
        </div>
    );
};

const ChatConfigPanel: React.FC<{session: ChatSession}> = ({session}) => {
    const { activeClient, updateChatSession } = useData();
    
    if (!activeClient) return null;

    const handleUpdate = (field: keyof ChatSession, value: any) => {
        updateChatSession(activeClient.id, session.id, { [field]: value });
    };
    
    const toggleSource = (docId: string) => {
        const newSourceIds = session.sourceIds.includes(docId)
            ? session.sourceIds.filter(id => id !== docId)
            : [...session.sourceIds, docId];
        handleUpdate('sourceIds', newSourceIds);
    };

    return (
        <div className="pt-4 mt-4 border-t border-indigo-800/50 space-y-4">
            <div>
                <label className="text-sm font-semibold text-gray-300">Fonte de Conhecimento</label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {activeClient.deliverables.map(doc => (
                        <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-md">
                            <button onClick={() => toggleSource(doc.id)}>
                                {session.sourceIds.includes(doc.id) ? <CheckSquare size={20} className="text-indigo-400"/> : <Square size={20} className="text-gray-500"/>}
                            </button>
                            <span className="text-sm truncate">{doc.name}</span>
                        </div>
                    ))}
                    {activeClient.deliverables.length === 0 && <p className="text-xs text-gray-500 italic">Nenhum documento na biblioteca para usar como fonte.</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm font-semibold text-gray-300">Tom da Resposta</label>
                    <select value={session.tone} onChange={e => handleUpdate('tone', e.target.value)} className="w-full mt-1 bg-gray-900/50 p-2 rounded-md text-sm border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                        <option>Profissional</option>
                        <option>Amigável</option>
                        <option>Direto</option>
                        <option>Detalhado</option>
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-semibold text-gray-300">Tamanho da Resposta</label>
                     <select value={session.size} onChange={e => handleUpdate('size', e.target.value)} className="w-full mt-1 bg-gray-900/50 p-2 rounded-md text-sm border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500">
                        <option>Curto</option>
                        <option>Médio</option>
                        <option>Longo</option>
                    </select>
                </div>
            </div>

             <div>
                <label className="text-sm font-semibold text-gray-300">Outras Orientações</label>
                <input 
                    type="text" 
                    value={session.orientation} 
                    onChange={e => handleUpdate('orientation', e.target.value)}
                    placeholder="Ex: Responda em tópicos"
                    className="w-full mt-1 bg-gray-900/50 p-2 rounded-md text-sm border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </div>
    );
};



// Editing and Modal Components
const CreateAssessmentModal: React.FC<{
    onClose: () => void;
    onCreate: (scores: PillarScores) => void;
    initialAssessment: Assessment | null;
}> = ({ onClose, onCreate, initialAssessment }) => {
    const [scores, setScores] = useState<PillarScores>(() => {
        // If there's an existing assessment, start with its scores. Otherwise, start fresh.
        if (initialAssessment) {
            return JSON.parse(JSON.stringify(initialAssessment.scores));
        }
        return PILLARS.reduce((acc, pillar) => {
            acc[pillar] = { ...INITIAL_PILLAR_SCORE };
            return acc;
        }, {} as PillarScores);
    });
    const [activePillar, setActivePillar] = useState<Pillar>(PILLARS[0]);

    const handlePillarChange = (pillar: Pillar, newPillarScore: PillarScore) => {
        setScores(prev => ({...prev, [pillar]: newPillarScore}));
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-indigo-700/50">
                <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                    <h2 className="text-2xl font-bold">Criar Nova Avaliação</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={24} /></button>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-1/4 max-w-xs p-4 border-r border-indigo-800/50 overflow-y-auto">
                        <nav className="space-y-2">
                            {PILLARS.map(p => (
                                <button key={p} onClick={() => setActivePillar(p)} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activePillar === p ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: PILLAR_DATA[p].color}}></div>
                                    {PILLAR_DATA[p].name}
                                </button>
                            ))}
                        </nav>
                    </aside>
                    <main className="flex-1 overflow-y-auto p-6">
                        <PillarAssessmentForm
                            key={activePillar}
                            pillar={activePillar}
                            initialScore={scores[activePillar]}
                            onSave={handlePillarChange}
                        />
                    </main>
                </div>
                 <footer className="flex justify-end items-center p-4 border-t border-indigo-800/50 gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                    <button onClick={() => onCreate(scores)} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Criar Avaliação</button>
                </footer>
            </div>
        </div>
    );
};


const EditAssessmentModal: React.FC<{
    assessment: Assessment;
    initialPillar?: Pillar;
    onClose: () => void;
}> = ({ assessment, initialPillar, onClose }) => {
    const { activeClient, updateAssessment } = useData();
    const [editedScores, setEditedScores] = useState<PillarScores>(() => JSON.parse(JSON.stringify(assessment.scores)));
    const [activePillar, setActivePillar] = useState<Pillar>(initialPillar || PILLARS[0]);

    const handlePillarChange = (pillar: Pillar, newScore: PillarScore) => {
        setEditedScores(prev => ({ ...prev, [pillar]: newScore }));
    };

    const handleSaveChanges = () => {
        if (activeClient) {
            updateAssessment(activeClient.id, assessment.id, editedScores);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-indigo-700/50">
                <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                    <h2 className="text-2xl font-bold">Editando Avaliação de {formatDate(assessment.date)}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={24} /></button>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <aside className="w-1/4 max-w-xs p-4 border-r border-indigo-800/50 overflow-y-auto">
                        <nav className="space-y-2">
                            {PILLARS.map(p => (
                                <button key={p} onClick={() => setActivePillar(p)} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activePillar === p ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PILLAR_DATA[p].color }}></div>
                                    {PILLAR_DATA[p].name}
                                </button>
                            ))}
                        </nav>
                    </aside>
                    <main className="flex-1 overflow-y-auto p-6">
                        <PillarAssessmentForm
                            key={activePillar}
                            pillar={activePillar}
                            initialScore={editedScores[activePillar]}
                            onSave={handlePillarChange}
                        />
                    </main>
                </div>
                <footer className="flex justify-end items-center p-4 border-t border-indigo-800/50 gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                    <button onClick={handleSaveChanges} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
};

const PillarAssessmentForm: React.FC<{
    pillar: Pillar,
    initialScore: PillarScore,
    onSave: (pillar: Pillar, newScore: PillarScore) => void
}> = ({ pillar, initialScore, onSave }) => {
    const [pillarScore, setPillarScore] = useState<PillarScore>(initialScore);

    // UseEffect to sync parent changes to local state, but only when the pillar changes
    useEffect(() => {
        setPillarScore(initialScore);
    }, [initialScore]);

    const handleLocalChange = (newScore: PillarScore) => {
        setPillarScore(newScore);
        onSave(pillar, newScore);
    };

    const handleResponseChange = (questionIndex: number, value: number) => {
        const newResponses = [...pillarScore.responses];
        newResponses[questionIndex] = value;
        handleLocalChange({ ...pillarScore, responses: newResponses });
    };

    const handleGoalChange = (value: number) => {
        handleLocalChange({ ...pillarScore, goal: value });
    };

    const handleNotesChange = (value: string) => {
        handleLocalChange({ ...pillarScore, notes: value });
    };
    
    const scoreOptions = [
        { value: 0, label: '0%', color: 'bg-gray-600' },
        { value: 25, label: '25%', color: 'bg-red-600' },
        { value: 50, label: '50%', color: 'bg-yellow-600' },
        { value: 75, label: '75%', color: 'bg-blue-600' },
        { value: 100, label: '100%', color: 'bg-green-600' },
    ];

    const currentScore = calculatePillarScore(pillarScore.responses);

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold" style={{color: PILLAR_DATA[pillar].color}}>{PILLAR_DATA[pillar].name}</h3>
                    <p className="text-gray-400">{PILLAR_DATA[pillar].description}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Pontuação Atual</p>
                    <p className="text-4xl font-bold" style={{color: PILLAR_DATA[pillar].color}}>{currentScore}</p>
                </div>
            </div>

            <div className="space-y-6">
                {PILLAR_QUESTIONS[pillar].map((question, index) => (
                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="mb-3 text-gray-300">{index + 1}. {question}</p>
                        <div className="flex gap-2 flex-wrap">
                            {scoreOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleResponseChange(index, opt.value)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-transform transform hover:scale-110 ${pillarScore.responses[index] === opt.value ? `${opt.color} text-white shadow-lg` : 'bg-gray-700 text-gray-300'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gray-900/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Meta para este Pilar (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={pillarScore.goal}
                        onChange={(e) => handleGoalChange(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"
                    />
                </div>
                 <div className="bg-gray-900/50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Notas e Observações</label>
                    <textarea
                        value={pillarScore.notes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Principais pontos, desafios e oportunidades..."
                        rows={3}
                        className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"
                    />
                </div>
            </div>
        </div>
    );
};

// Fix: Added default export for the Dashboard component to be used in App.tsx
export default Dashboard;
