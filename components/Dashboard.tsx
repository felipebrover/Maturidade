
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useData } from '../App';
import {
    LayoutDashboard, BarChart3, Clock, Briefcase, BotMessageSquare, Library, LogOut, Menu, X, Plus, ChevronsUpDown, Check, FileDown, Rocket, Target, Minus, AlertTriangle, Building, Package, Megaphone, Handshake, Users, SlidersHorizontal, Building2, Compass, Goal, Network, Workflow, BarChartBig, HandCoins, Database, Edit, ChevronDown, ChevronUp, Info, Sheet
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PILLAR_DATA, PILLARS, INITIAL_PILLAR_SCORE, PILLAR_QUESTIONS } from '../constants';
import { generateExecutiveSummary } from '../services/geminiService';
import { formatDate, calculatePillarScore, calculateOverallMaturity } from '../utils';
import { Pillar, type PillarScore, type PillarScores, type View, type Assessment } from '../types';

const ICON_MAP: Record<Pillar, React.ElementType> = {
    [Pillar.STRATEGY]: Compass,
    [Pillar.GOALS]: Goal,
    [Pillar.CHANNELS]: Network,
    [Pillar.PROCESS]: Workflow,
    [Pillar.METRICS]: BarChartBig,
    [Pillar.COMPENSATION]: HandCoins,
    [Pillar.SYSTEMS]: Database
};

const PrintHeader: React.FC = () => {
    const { activeClient } = useData();
    if (!activeClient) return null;

    return (
        <div className="print-header mb-8">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <Building2 className="w-10 h-10 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Commercial<span className="text-indigo-600">OS</span></h1>
                        <p>Relatório de Maturidade Comercial</p>
                    </div>
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
    const { activeClient, addAssessment, updateAssessment } = useData();
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // State for the new "Editing Cart" feature
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [stagedScores, setStagedScores] = useState<PillarScores | null>(null);
    const [changedPillars, setChangedPillars] = useState<Record<string, boolean>>({});
    
    // State for the pillar details modal opened from the dashboard
    const [modalPillar, setModalPillar] = useState<Pillar | null>(null);

    // State for the new assessment creation modal
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);


    const handleStartEditing = (assessment: Assessment) => {
        setEditingAssessment(assessment);
        // Deep copy scores to avoid mutating original state
        setStagedScores(JSON.parse(JSON.stringify(assessment.scores)));
        setChangedPillars({});
    };
    
    const handleStartEditingFromDashboard = (pillar: Pillar) => {
        if (!activeClient || activeClient.assessments.length === 0) return;
        const latestAssessment = activeClient.assessments[activeClient.assessments.length - 1];
        handleStartEditing(latestAssessment); // Sets editingAssessment and stagedScores
        setModalPillar(pillar); // Opens the modal
    };


    const handleSavePillarChanges = (pillar: Pillar, newPillarScore: PillarScore) => {
        setStagedScores(prevScores => {
            if (!prevScores) return null;
            return { ...prevScores, [pillar]: newPillarScore };
        });
        setChangedPillars(prev => ({ ...prev, [pillar]: true }));
    };
    
    const handleSavePillarToCart = (pillar: Pillar, newPillarScore: PillarScore) => {
        handleSavePillarChanges(pillar, newPillarScore);
        setModalPillar(null);
    };

    const handleCreateAssessmentFromCart = () => {
        if (!activeClient || !stagedScores || !editingAssessment) return;

        // CRITICAL BUG FIX: Ensure staged scores are correctly applied.
        // 1. Start with a deep copy of the original assessment's scores.
        const newScores: PillarScores = JSON.parse(JSON.stringify(editingAssessment.scores));
        
        // 2. Iterate over the keys of changedPillars (which are the pillar IDs that were modified).
        Object.keys(changedPillars).forEach(pillarId => {
            const pillarKey = pillarId as Pillar;
            // 3. Overwrite the score in our new object with the corresponding value from stagedScores.
            if (stagedScores[pillarKey]) {
                newScores[pillarKey] = stagedScores[pillarKey];
            }
        });

        // 4. Call addAssessment with the correctly constructed newScores object.
        addAssessment(activeClient.id, newScores);

        // Reset editing state
        setEditingAssessment(null);
        setStagedScores(null);
        setChangedPillars({});
        setCurrentView('timeline');
    };
    
    const handleUpdateAssessmentFromCart = () => {
        if (!activeClient || !stagedScores || !editingAssessment) return;

        const newScores: PillarScores = JSON.parse(JSON.stringify(editingAssessment.scores));
        Object.keys(changedPillars).forEach(pillarId => {
            const pillarKey = pillarId as Pillar;
            if (stagedScores[pillarKey]) {
                newScores[pillarKey] = stagedScores[pillarKey];
            }
        });

        updateAssessment(activeClient.id, editingAssessment.id, newScores);

        // Reset editing state
        setEditingAssessment(null);
        setStagedScores(null);
        setChangedPillars({});
    };


    const handleCancelEditing = () => {
        setEditingAssessment(null);
        setStagedScores(null);
        setChangedPillars({});
    };

    const handleOpenCreateModal = () => setCreateModalOpen(true);
    const handleCloseCreateModal = () => setCreateModalOpen(false);
    const handleCreateNewAssessment = (scores: PillarScores) => {
        if (activeClient) {
            addAssessment(activeClient.id, scores);
            setCreateModalOpen(false);
            setCurrentView('timeline');
        }
    };


    if (!activeClient) {
        return <div className="p-8">Selecione um cliente para começar.</div>
    }
    
    const latestAssessment = useMemo(() => {
        if (!activeClient || activeClient.assessments.length === 0) return null;
        return activeClient.assessments[activeClient.assessments.length - 1];
    }, [activeClient]);

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardHome onPillarClick={handleStartEditingFromDashboard} onNewAssessmentClick={handleOpenCreateModal} />;
            case 'evolution': return <EvolutionView />;
            case 'timeline': return <TimelineView onStartEditing={handleStartEditing} onNewAssessmentClick={handleOpenCreateModal} />;
            case 'meeting': return <MeetingPrepView />;
            case 'library': return <ResourceLibraryView />;
            default: return <DashboardHome onPillarClick={handleStartEditingFromDashboard} onNewAssessmentClick={handleOpenCreateModal} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-900 text-gray-200">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-4 sm:p-6 lg:p-8 print-bg-white print-text-black">
                   <PrintHeader />
                   <div className="print-container">
                    {renderView()}
                   </div>
                </main>
                <EditingCartBar
                    changedPillarsCount={Object.keys(changedPillars).length}
                    onCreateAssessment={handleCreateAssessmentFromCart}
                    onUpdateAssessment={handleUpdateAssessmentFromCart}
                    onCancel={handleCancelEditing}
                />
            </div>
            {isCreateModalOpen && (
                <CreateAssessmentModal 
                    onClose={handleCloseCreateModal} 
                    onCreate={handleCreateNewAssessment} 
                    initialAssessment={latestAssessment} 
                />
            )}
            {editingAssessment && stagedScores && (
                <EditAssessmentModal 
                    assessment={editingAssessment} 
                    editedScores={stagedScores}
                    onSavePillar={handleSavePillarChanges}
                    onClose={handleCancelEditing} 
                />
            )}
            {modalPillar && stagedScores && (
                <PillarDetailsModal 
                    pillar={modalPillar} 
                    initialPillarScore={stagedScores[modalPillar]}
                    onSaveToCart={handleSavePillarToCart}
                    onClose={() => setModalPillar(null)}
                />
            )}
        </div>
    );
};

// Sidebar, Header Components (no major changes) ...
const Sidebar: React.FC<{ currentView: View, setCurrentView: (view: View) => void, isSidebarOpen: boolean, setSidebarOpen: (isOpen: boolean) => void }> = ({ currentView, setCurrentView, isSidebarOpen, setSidebarOpen }) => {
    const { logout } = useData();
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'evolution', label: 'Evolução', icon: BarChart3 },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'meeting', label: 'Reunião IA', icon: BotMessageSquare },
        { id: 'library', label: 'Biblioteca', icon: Library },
    ];

    return (
        <>
        <aside className={`no-print absolute z-30 md:relative w-64 h-full bg-gray-800/50 backdrop-blur-lg border-r border-indigo-800/30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <div className="flex items-center justify-between p-4 border-b border-indigo-800/30">
                <div className="flex items-center gap-2">
                    <Building2 className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-2xl font-bold text-white">Commercial<span className="text-indigo-400">OS</span></h1>
                </div>
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
const Header: React.FC<{ setSidebarOpen: (isOpen: boolean) => void }> = ({ setSidebarOpen }) => {
    const { clients, activeClient, setActiveClientId, addClient } = useData();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleAddClient = () => {
        if (newClientName.trim()) {
            addClient(newClientName.trim());
            setNewClientName('');
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
        <header className="no-print flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-indigo-800/30 flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
                    <Menu size={24} />
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                        <Building className="h-5 w-5 text-indigo-400" />
                        <span className="font-semibold">{activeClient?.name || 'Selecione um Cliente'}</span>
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute mt-2 w-72 bg-gray-800 border border-indigo-700/50 rounded-lg shadow-xl z-10">
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
                                    <button key={client.id} onClick={() => { setActiveClientId(client.id); setDropdownOpen(false); setSearchQuery(''); }} className="w-full text-left flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-indigo-600">
                                        {highlightMatch(client.name, searchQuery)}
                                        {client.id === activeClient?.id && <Check className="h-4 w-4" />}
                                    </button>
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
        </header>
    );
};

// Dashboard Home View
const DashboardHome: React.FC<{ onPillarClick: (pillar: Pillar) => void; onNewAssessmentClick: () => void; }> = ({ onPillarClick, onNewAssessmentClick }) => {
    const { activeClient } = useData();

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
    const { activeClient, addAssessment } = useData();
    const [isCreating, setIsCreating] = useState(false);

    const handleStartFirstAssessment = () => {
        if (!activeClient) return;
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
            <button
                onClick={handleStartFirstAssessment}
                disabled={isCreating}
                className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
                <Plus className="h-4 w-4" />
                Iniciar Primeira Avaliação
            </button>
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
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-4 sm:p-6">
             <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Matriz de Maturidade</h2>
                    <p className="text-sm text-gray-400">Visão geral dos 7 pilares comerciais.</p>
                </div>
                <button
                    onClick={onNewAssessmentClick}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nova Avaliação
                </button>
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

                        return (
                            <div 
                                key={pillar}
                                onClick={() => onPillarClick(pillar)}
                                className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-indigo-500 cursor-pointer transition-all transform hover:scale-105"
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
    const { activeClient } = useData();

    if (!activeClient || activeClient.assessments.length === 0) {
        return (
             <div className="text-center p-8 bg-gray-800/30 rounded-lg">
                <Clock className="mx-auto w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Nenhuma Avaliação Encontrada</h2>
                <p className="text-gray-400 mb-6">Crie a primeira avaliação para iniciar a timeline.</p>
                 <button
                    onClick={onNewAssessmentClick}
                    className="flex items-center mx-auto justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Criar Primeira Avaliação
                </button>
            </div>
        );
    }
    // sort assessments from newest to oldest
    const sortedAssessments = [...activeClient.assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Timeline de Avaliações</h2>
                    <p className="text-gray-400">Histórico de todas as avaliações de maturidade realizadas.</p>
                </div>
                <button
                    onClick={onNewAssessmentClick}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nova Avaliação
                </button>
            </div>
            <div className="space-y-8">
                {sortedAssessments.map((assessment, index) => (
                    <AssessmentCard 
                        key={assessment.id} 
                        assessment={assessment} 
                        isLatest={index === 0} 
                        onEdit={() => onStartEditing(assessment)}
                    />
                ))}
            </div>
        </div>
    );
};

const AssessmentCard: React.FC<{ assessment: Assessment; isLatest: boolean; onEdit: () => void; }> = ({ assessment, isLatest, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(isLatest); // Expand latest by default
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
                <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <Edit className="w-5 h-5 text-gray-400" />
                    </button>
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
    const { activeClient } = useData();
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateSummary = useCallback(async () => {
        if (!activeClient) return;
        setIsLoading(true);
        try {
            const result = await generateExecutiveSummary(activeClient);
            setSummary(result);
        } catch (error) {
            setSummary('Ocorreu um erro ao gerar o resumo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [activeClient]);

    useEffect(() => {
        // Automatically generate on view load if there's an active client with assessments
        if (activeClient && activeClient.assessments.length > 0) {
            handleGenerateSummary();
        } else {
            setSummary('');
        }
    }, [activeClient, handleGenerateSummary]);

    if (!activeClient || activeClient.assessments.length === 0) {
        return (
             <div className="text-center p-8 bg-gray-800/30 rounded-lg">
                <BotMessageSquare className="mx-auto w-12 h-12 text-indigo-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Prepare-se para a Reunião</h2>
                <p className="text-gray-400">Realize uma avaliação para que a IA possa gerar um resumo executivo e pontos de discussão.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-800/30 p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Preparação para Reunião com IA</h2>
                    <p className="text-gray-400">Resumo executivo gerado pela IA para a próxima conversa com o cliente.</p>
                </div>
                <button onClick={handleGenerateSummary} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50">
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <BotMessageSquare className="h-4 w-4" />
                    )}
                    {isLoading ? 'Gerando...' : 'Gerar Novamente'}
                </button>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg min-h-[200px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Analisando dados e gerando insights...</p>
                    </div>
                ) : (
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
                )}
            </div>
        </div>
    );
};


// Resource Library View
const ResourceLibraryView: React.FC = () => {
    return (
        <div className="text-center p-8 bg-gray-800/30 rounded-lg">
            <Library className="mx-auto w-12 h-12 text-indigo-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Biblioteca de Recursos</h2>
            <p className="text-gray-400">Em breve: Acesso a playbooks, templates e melhores práticas para cada pilar.</p>
        </div>
    );
};

// Editing Cart Bar
const EditingCartBar: React.FC<{
    changedPillarsCount: number;
    onCreateAssessment: () => void;
    onUpdateAssessment: () => void;
    onCancel: () => void;
}> = ({ changedPillarsCount, onCreateAssessment, onUpdateAssessment, onCancel }) => {
    if (changedPillarsCount === 0) return null;

    return (
        <div className="no-print fixed bottom-4 right-4 z-40 bg-gray-700/50 backdrop-blur-lg border border-indigo-600 rounded-lg shadow-2xl p-4 flex items-center gap-4 animate-fade-in-up">
            <div className="flex items-center gap-2 text-white">
                <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
                <span className="font-bold">{changedPillarsCount}</span>
                <span className="text-sm">{changedPillarsCount > 1 ? 'pilares alterados' : 'pilar alterado'}</span>
            </div>
            <div className="h-8 border-l border-gray-600"></div>
            <div className="flex items-center gap-2">
                 <button onClick={onUpdateAssessment} className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
                    Salvar Edições
                </button>
                <button onClick={onCreateAssessment} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                    Criar Nova Avaliação
                </button>
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-600 transition-colors" title="Cancelar">
                    <X className="h-4 w-4 text-gray-300" />
                </button>
            </div>
        </div>
    );
};

// Modals...
const CreateAssessmentModal: React.FC<{
    onClose: () => void;
    onCreate: (scores: PillarScores) => void;
    initialAssessment: Assessment | null;
}> = ({ onClose, onCreate, initialAssessment }) => {
    const [activePillar, setActivePillar] = useState<Pillar>(PILLARS[0]);
    
    // Initialize scores: if there's an initial assessment, use its scores, otherwise start fresh
    const [scores, setScores] = useState<PillarScores>(() => {
        if (initialAssessment) {
            return JSON.parse(JSON.stringify(initialAssessment.scores)); // Deep copy
        }
        return PILLARS.reduce((acc, pillar) => {
            acc[pillar] = { ...INITIAL_PILLAR_SCORE };
            return acc;
        }, {} as PillarScores);
    });

    const handleScoreChange = (pillar: Pillar, questionIndex: number, value: number) => {
        setScores(prev => ({
            ...prev,
            [pillar]: {
                ...prev[pillar],
                responses: prev[pillar].responses.map((r, i) => i === questionIndex ? value : r)
            }
        }));
    };

    const handleNotesChange = (pillar: Pillar, notes: string) => {
        setScores(prev => ({ ...prev, [pillar]: { ...prev[pillar], notes } }));
    };

    const handleGoalChange = (pillar: Pillar, goal: number) => {
        setScores(prev => ({ ...prev, [pillar]: { ...prev[pillar], goal } }));
    };
    
    const currentPillarData = scores[activePillar];
    const currentPillarOverall = calculatePillarScore(currentPillarData.responses);

    return (
        <div className="no-print fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-indigo-700/50">
                <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                    <h2 className="text-xl font-bold">Nova Avaliação de Maturidade</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <nav className="w-1/4 border-r border-indigo-800/50 overflow-y-auto p-2">
                        {PILLARS.map(pillar => {
                            const Icon = ICON_MAP[pillar];
                            const score = calculatePillarScore(scores[pillar].responses);
                            return (
                                <button
                                    key={pillar}
                                    onClick={() => setActivePillar(pillar)}
                                    className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg mb-1 text-sm transition-colors ${activePillar === pillar ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}
                                >
                                    <Icon className="w-5 h-5" style={{ color: activePillar === pillar ? 'white' : PILLAR_DATA[pillar].color }} />
                                    <span className="flex-1">{PILLAR_DATA[pillar].name}</span>
                                    <span className="font-bold" style={{ color: activePillar === pillar ? 'white' : PILLAR_DATA[pillar].color }}>{score}</span>
                                </button>
                            );
                        })}
                    </nav>
                    <main className="flex-1 p-6 overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-2" style={{color: PILLAR_DATA[activePillar].color}}>{PILLAR_DATA[activePillar].name}</h3>
                        <p className="text-gray-400 mb-6">{PILLAR_DATA[activePillar].description}</p>
                        
                        <div className="space-y-4">
                            {PILLAR_QUESTIONS[activePillar].map((question, index) => (
                                <QuestionSlider 
                                    key={index} 
                                    question={question}
                                    value={currentPillarData.responses[index]}
                                    onChange={(value) => handleScoreChange(activePillar, index, value)}
                                />
                            ))}
                        </div>

                         <div className="mt-8">
                            <h4 className="font-semibold mb-2">Notas e Observações</h4>
                             <textarea
                                value={currentPillarData.notes}
                                onChange={(e) => handleNotesChange(activePillar, e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Adicione insights, pontos de melhoria, ou próximos passos..."
                            />
                        </div>

                    </main>
                </div>
                <footer className="flex justify-between items-center p-4 border-t border-indigo-800/50">
                    <div className="flex items-center gap-4">
                       <span className="text-sm font-medium">Pontuação do Pilar:</span>
                       <span className="text-2xl font-bold" style={{color: PILLAR_DATA[activePillar].color}}>{currentPillarOverall} / 100</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                        <button onClick={() => onCreate(scores)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar Nova Avaliação</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const EditAssessmentModal: React.FC<{
    assessment: Assessment;
    editedScores: PillarScores;
    onSavePillar: (pillar: Pillar, newScore: PillarScore) => void;
    onClose: () => void;
}> = ({ assessment, editedScores, onSavePillar, onClose }) => {
    // This modal now only serves to show the list of pillars to edit.
    // Clicking a pillar opens the PillarDetailsModal
    const [pillarToEdit, setPillarToEdit] = useState<Pillar | null>(null);
    const [currentPillarState, setCurrentPillarState] = useState<PillarScore | null>(null);

    const handleEditPillar = (pillar: Pillar) => {
        // We need a deep copy to avoid direct mutation before saving
        setCurrentPillarState(JSON.parse(JSON.stringify(editedScores[pillar])));
        setPillarToEdit(pillar);
    };
    
    const handleSaveAndClosePillarModal = () => {
        if (pillarToEdit && currentPillarState) {
            onSavePillar(pillarToEdit, currentPillarState);
        }
        setPillarToEdit(null);
        setCurrentPillarState(null);
    };
    
    if (pillarToEdit && currentPillarState) {
        return (
            <PillarDetailsModal
                pillar={pillarToEdit}
                initialPillarScore={currentPillarState}
                onSaveToCart={(p, s) => { onSavePillar(p,s); setPillarToEdit(null); }}
                onClose={() => setPillarToEdit(null)}
            />
        );
    }

    return (
        <div className="no-print fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-indigo-700/50">
                <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                    <div>
                        <h2 className="text-xl font-bold">Editando Avaliação</h2>
                        <p className="text-sm text-gray-400">De {formatDate(assessment.date)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
                </header>
                 <div className="p-4">
                    <p className="text-sm text-center text-gray-400 mb-4">Selecione um pilar para editar seus detalhes. As alterações ficarão salvas no seu carrinho de edições.</p>
                     {PILLARS.map(pillar => {
                        const Icon = ICON_MAP[pillar];
                        const score = calculatePillarScore(editedScores[pillar].responses);
                        return (
                            <button
                                key={pillar}
                                onClick={() => handleEditPillar(pillar)}
                                className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg mb-1 text-sm transition-colors hover:bg-gray-700"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5" style={{ color: PILLAR_DATA[pillar].color }} />
                                    <span className="flex-1 font-medium">{PILLAR_DATA[pillar].name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-lg" style={{ color: PILLAR_DATA[pillar].color }}>{score}</span>
                                    <ChevronUp className="w-5 h-5 text-gray-500 -rotate-90"/>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <footer className="p-4 border-t border-indigo-800/50 text-center">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Fechar</button>
                </footer>
            </div>
        </div>
    );
};

const PillarDetailsModal: React.FC<{
    pillar: Pillar;
    initialPillarScore: PillarScore;
    onSaveToCart: (pillar: Pillar, newScore: PillarScore) => void;
    onClose: () => void;
}> = ({ pillar, initialPillarScore, onSaveToCart, onClose }) => {
    // This state is local to the modal for editing
    const [pillarScore, setPillarScore] = useState<PillarScore>(JSON.parse(JSON.stringify(initialPillarScore)));

    const handleScoreChange = (questionIndex: number, value: number) => {
        setPillarScore(prev => ({
            ...prev,
            responses: prev.responses.map((r, i) => i === questionIndex ? value : r)
        }));
    };
    
    const handleNotesChange = (notes: string) => setPillarScore(prev => ({ ...prev, notes }));
    
    const handleSave = () => {
        onSaveToCart(pillar, pillarScore);
        onClose();
    };

    const currentPillarOverall = calculatePillarScore(pillarScore.responses);
    
    return (
         <div className="no-print fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col border border-indigo-700/50">
                 <header className="flex justify-between items-center p-4 border-b border-indigo-800/50">
                    <h2 className="text-xl font-bold" style={{color: PILLAR_DATA[pillar].color}}>Editando {PILLAR_DATA[pillar].name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><X size={20} /></button>
                </header>
                 <main className="flex-1 p-6 overflow-y-auto">
                    <p className="text-gray-400 mb-6">{PILLAR_DATA[pillar].description}</p>
                    <div className="space-y-4">
                        {PILLAR_QUESTIONS[pillar].map((question, index) => (
                            <QuestionSlider 
                                key={index} 
                                question={question}
                                value={pillarScore.responses[index]}
                                onChange={(value) => handleScoreChange(index, value)}
                            />
                        ))}
                    </div>
                     <div className="mt-8">
                        <h4 className="font-semibold mb-2">Notas e Observações</h4>
                         <textarea
                            value={pillarScore.notes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Adicione insights, pontos de melhoria, ou próximos passos..."
                        />
                    </div>
                </main>
                 <footer className="flex justify-between items-center p-4 border-t border-indigo-800/50">
                    <div className="flex items-center gap-4">
                       <span className="text-sm font-medium">Pontuação do Pilar:</span>
                       <span className="text-2xl font-bold" style={{color: PILLAR_DATA[pillar].color}}>{currentPillarOverall} / 100</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Salvar Alterações</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const QuestionSlider: React.FC<{ question: string, value: number, onChange: (value: number) => void }> = ({ question, value, onChange }) => {
    const levels = [
        { value: 0, label: 'Inexistente', color: 'bg-red-800' },
        { value: 25, label: 'Iniciante', color: 'bg-orange-700' },
        { value: 50, label: 'Intermediário', color: 'bg-yellow-600' },
        { value: 75, label: 'Avançado', color: 'bg-blue-600' },
        { value: 100, label: 'Maduro', color: 'bg-green-600' },
    ];
    const activeLevel = levels.find(l => l.value === value) || levels[0];

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
            <p className="text-sm text-gray-300 mb-3">{question}</p>
            <div className="flex items-center gap-4">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="25"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className={`px-2 py-1 text-xs font-bold text-white rounded-md w-28 text-center ${activeLevel.color}`}>
                    {activeLevel.label}
                </span>
            </div>
        </div>
    );
}

export default Dashboard;
