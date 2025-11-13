import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useData } from '../App';
import {
    LayoutDashboard, BarChart3, Clock, Briefcase, BotMessageSquare, Library, LogOut, Menu, X, Plus, ChevronsUpDown, Check, FileDown, Rocket, Target, Minus, AlertTriangle, Building, Package, Megaphone, Handshake, Users, SlidersHorizontal, Building2, Compass, Goal, Network, Workflow, BarChartBig, HandCoins, Database, Edit, ChevronDown, ChevronUp, Info
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
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleAddClient = () => {
        if (newClientName.trim()) {
            addClient(newClientName.trim());
            setNewClientName('');
            setDropdownOpen(false);
        }
    };
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <header className="no-print flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-indigo-800/30 flex items-center justify-between p-4">
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
                    <div className="absolute mt-2 w-64 bg-gray-800 border border-indigo-700/50 rounded-lg shadow-xl z-10">
                        <div className="p-2 max-h-60 overflow-y-auto">
                            {clients.map(client => (
                                <button key={client.id} onClick={() => { setActiveClientId(client.id); setDropdownOpen(false); }} className="w-full text-left flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-indigo-600">
                                    {client.name}
                                    {client.id === activeClient?.id && <Check className="h-4 w-4" />}
                                </button>
                            ))}
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
            <Rocket className="w-16 h-16 text-indigo-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo(a), {activeClient?.name}!</h2>
            <p className="text-gray-400 mb-6 max-w-md">
                Vamos começar a jornada de maturidade comercial. Crie a primeira avaliação para mapear o cenário atual.
            </p>
            <button
                onClick={handleStartFirstAssessment}
                disabled={isCreating}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
                {isCreating ? 'Criando...' : 'Iniciar Primeira Avaliação'}
            </button>
        </div>
    );
}

const PillarMatrix: React.FC<{
    radarChartData: any[];
    scores: PillarScores;
    previousScores: PillarScores | null;
    onPillarClick: (pillar: Pillar) => void;
    onNewAssessmentClick: () => void;
}> = ({ radarChartData, scores, previousScores, onPillarClick, onNewAssessmentClick }) => {
    const renderDelta = (pillar: Pillar) => {
        if (!previousScores) return null;
        const currentPillarScore = calculatePillarScore(scores[pillar].responses);
        const previousPillarScore = calculatePillarScore(previousScores[pillar].responses);
        const delta = currentPillarScore - previousPillarScore;
        
        if (delta === 0) return <Minus className="w-4 h-4 text-gray-500" />;
        const color = delta > 0 ? 'text-green-400' : 'text-red-400';
        return <span className={`flex items-center text-sm font-bold ${color}`}>{delta > 0 ? '+' : ''}{delta}</span>;
    };

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-4 sm:p-6 print-bg-white print-border-gray border border-transparent print:border">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold print-text-black">Matriz de Maturidade</h3>
                <button onClick={onNewAssessmentClick} className="no-print flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all transform hover:scale-105">
                    <Plus size={16}/>
                    Nova Avaliação
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                            <defs>
                                <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/></linearGradient>
                            </defs>
                            <PolarGrid stroke="#4b5563" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#d1d5db', fontSize: 12 }} className="print-text-black"/>
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                            <Radar name="Meta" dataKey="B" stroke="#8b5cf6" fill="url(#goalGradient)" fillOpacity={0.6} />
                            <Radar name="Atual" dataKey="A" stroke="#3b82f6" fill="url(#scoreGradient)" fillOpacity={0.8} />
                            <Legend wrapperStyle={{ color: '#9ca3af' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="md:col-span-2 space-y-2">
                    {PILLARS.map(pillar => {
                        const Icon = ICON_MAP[pillar];
                        const pillarScore = calculatePillarScore(scores[pillar].responses);
                        return (
                            <button key={pillar} onClick={() => onPillarClick(pillar)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors text-left">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-6 h-6" style={{ color: PILLAR_DATA[pillar].color }} />
                                    <div>
                                        <p className="font-semibold print-text-black">{PILLAR_DATA[pillar].name}</p>
                                        <p className="text-sm text-gray-400 print-text-black">{pillarScore}/100</p>
                                    </div>
                                </div>
                                {renderDelta(pillar)}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

const OverallMaturityCard: React.FC<{
    latestMaturity: number;
    previousMaturity: number | null;
}> = ({ latestMaturity, previousMaturity }) => {
    const delta = previousMaturity !== null ? latestMaturity - previousMaturity : null;
    const deltaColor = delta === null ? '' : delta >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 print-bg-white print-border-gray border border-transparent print:border">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold print-text-black">Maturidade Geral</h4>
                <Target className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="mt-2 text-center">
                <p className="text-5xl font-bold text-white print-text-black">{latestMaturity}<span className="text-3xl text-gray-400">%</span></p>
                {delta !== null && <p className={`mt-1 text-md font-semibold ${deltaColor}`}>{delta >= 0 ? '+' : ''}{delta}% desde a última avaliação</p>}
            </div>
        </div>
    );
};

const KeyChangesCard: React.FC<{
    latestScores: PillarScores;
    previousScores: PillarScores | null;
}> = ({ latestScores, previousScores }) => {
    const changes = useMemo(() => {
        if (!previousScores) return { top: null, bottom: null };
        let topPillar: Pillar | null = null, bottomPillar: Pillar | null = null;
        let maxIncrease = -Infinity, maxDecrease = Infinity;

        PILLARS.forEach(pillar => {
            const delta = calculatePillarScore(latestScores[pillar].responses) - calculatePillarScore(previousScores[pillar].responses);
            if (delta > maxIncrease) { maxIncrease = delta; topPillar = pillar; }
            if (delta < maxDecrease) { maxDecrease = delta; bottomPillar = pillar; }
        });
        
        return { 
            top: maxIncrease > 0 ? { pillar: topPillar!, delta: maxIncrease } : null,
            bottom: maxDecrease < 0 ? { pillar: bottomPillar!, delta: maxDecrease } : null
        };
    }, [latestScores, previousScores]);
    
    if (!previousScores) {
        return (
             <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-center h-full print-bg-white print-border-gray border border-transparent print:border">
                <BarChart3 className="w-8 h-8 text-gray-500 mb-2"/>
                <p className="text-gray-400 text-sm">Aguardando a próxima avaliação para exibir as mudanças.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 print-bg-white print-border-gray border border-transparent print:border">
            <h4 className="text-lg font-semibold mb-4 print-text-black">Principais Mudanças</h4>
            <div className="space-y-4">
                {changes.top ? (
                    <div>
                        <p className="text-sm text-green-400 font-semibold">MAIOR AVANÇO</p>
                        <div className="flex items-center justify-between mt-1"><span className="print-text-black">{PILLAR_DATA[changes.top.pillar].name}</span><span className="font-bold text-green-400">+{changes.top.delta} pts</span></div>
                    </div>
                ) : <p className="text-sm text-gray-400">Nenhum avanço significativo.</p>}
                
                {changes.bottom ? (
                     <div>
                        <p className="text-sm text-red-400 font-semibold">PONTO DE ATENÇÃO</p>
                         <div className="flex items-center justify-between mt-1"><span className="print-text-black">{PILLAR_DATA[changes.bottom.pillar].name}</span><span className="font-bold text-red-400">{changes.bottom.delta} pts</span></div>
                    </div>
                ) : <p className="text-sm text-gray-400">Nenhum recuo significativo.</p>}
            </div>
        </div>
    );
};

const RESPONSE_OPTIONS = [0, 25, 50, 75, 100];

const QuestionResponseGroup: React.FC<{
    question: string;
    questionIndex: number;
    currentResponse: number | null;
    onResponseChange: (questionIndex: number, value: number) => void;
}> = ({ question, questionIndex, currentResponse, onResponseChange }) => {
    return (
        <div className="py-4 border-b border-gray-700/50">
            <p className="text-sm text-gray-300 mb-3">{questionIndex + 1}. {question}</p>
            <div className="flex items-center justify-between space-x-2">
                {RESPONSE_OPTIONS.map(value => (
                    <button
                        key={value}
                        onClick={() => onResponseChange(questionIndex, value)}
                        className={`w-full text-xs sm:text-sm font-semibold py-2 px-1 rounded-md transition-all duration-200 transform hover:scale-105 ${
                            currentResponse === value
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {value}%
                    </button>
                ))}
            </div>
        </div>
    );
};

const PillarDetailsModal: React.FC<{ 
    pillar: Pillar;
    initialPillarScore: PillarScore;
    onSaveToCart: (pillar: Pillar, newPillarScore: PillarScore) => void;
    onClose: () => void; 
}> = ({ pillar, initialPillarScore, onSaveToCart, onClose }) => {
    
    const [currentPillarScore, setCurrentPillarScore] = useState<PillarScore>(initialPillarScore);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        setCurrentPillarScore(initialPillarScore);
    }, [initialPillarScore]);

    const handleResponseChange = (questionIndex: number, value: number) => {
        const newResponses = [...currentPillarScore.responses];
        newResponses[questionIndex] = value;
        setCurrentPillarScore(s => ({ ...s, responses: newResponses }));
    };

    const handleSave = () => {
        setIsSaving(true);
        onSaveToCart(pillar, currentPillarScore);
        // The onClose is typically called by the parent after saving
    };
    
    const Icon = ICON_MAP[pillar];
    const pillarScore = calculatePillarScore(currentPillarScore.responses);

    return (
        <div className="no-print fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-indigo-800/50">
                    <div className="flex items-center gap-3">
                        <Icon className="w-7 h-7" style={{ color: PILLAR_DATA[pillar].color }}/>
                        <div>
                            <h2 className="text-xl font-bold">{PILLAR_DATA[pillar].name}</h2>
                            <p className="text-sm text-gray-400">{PILLAR_DATA[pillar].description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <h3 className="font-semibold text-lg mb-2">Avaliação de Maturidade ({pillarScore}/100)</h3>
                    <div className="space-y-1">
                        {PILLAR_QUESTIONS[pillar].map((q, index) => (
                           <QuestionResponseGroup
                                key={index}
                                question={q}
                                questionIndex={index}
                                currentResponse={currentPillarScore.responses[index]}
                                onResponseChange={handleResponseChange}
                           />
                        ))}
                    </div>
                    <div className="mt-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notas / Plano de Ação</label>
                        <textarea id="notes" rows={3} value={currentPillarScore.notes} onChange={e => setCurrentPillarScore(s => ({ ...s, notes: e.target.value }))} className="mt-1 w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md"/>
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 border-t border-indigo-800/50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-500">{isSaving ? 'Salvando...' : 'Salvar no Carrinho'}</button>
                </div>
            </div>
        </div>
    );
};

// Evolution View
const EvolutionView: React.FC = () => {
    const { activeClient } = useData();
    const chartData = useMemo(() => {
        if (!activeClient) return [];
        return activeClient.assessments.map(assessment => ({
            name: formatDate(assessment.date),
            "Maturidade Geral": assessment.overallMaturity,
            ...PILLARS.reduce((acc, pillar) => {
                acc[PILLAR_DATA[pillar].name] = calculatePillarScore(assessment.scores[pillar].responses);
                return acc;
            }, {} as Record<string, number>)
        }));
    }, [activeClient]);

    if (!activeClient || activeClient.assessments.length < 2) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 rounded-lg p-8 text-center">
                <BarChart3 className="w-16 h-16 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Acompanhe a Evolução</h2>
                <p className="text-gray-400 max-w-md">Realize pelo menos duas avaliações para visualizar o gráfico de progresso.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 print-bg-white print-border-gray border border-transparent print:border">
            <h3 className="text-xl font-bold mb-4 print-text-black">Evolução da Maturidade</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="name" stroke="#9ca3af" className="print-text-black" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} className="print-text-black"/>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4f46e5', color: '#d1d5db' }}/>
                        <Legend wrapperStyle={{ color: '#9ca3af' }}/>
                        <Line type="monotone" dataKey="Maturidade Geral" stroke="#ef4444" strokeWidth={3} />
                        {PILLARS.map(pillar => <Line key={pillar} type="monotone" dataKey={PILLAR_DATA[pillar].name} stroke={PILLAR_DATA[pillar].color} strokeWidth={1.5} />)}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Timeline View
const TimelineView: React.FC<{ onStartEditing: (assessment: Assessment) => void; onNewAssessmentClick: () => void; }> = ({ onStartEditing, onNewAssessmentClick }) => {
    const { activeClient } = useData();
    const assessments = useMemo(() => activeClient ? [...activeClient.assessments].reverse() : [], [activeClient]);

    if (!activeClient || assessments.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 rounded-lg p-8 text-center">
                <Clock className="w-16 h-16 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Histórico de Avaliações</h2>
                <p className="text-gray-400 max-w-md">A timeline aparecerá aqui assim que a primeira avaliação for concluída.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 print-bg-white print-border-gray border border-transparent print:border">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold print-text-black">Timeline Documentada</h3>
                <button onClick={onNewAssessmentClick} className="no-print flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all transform hover:scale-105">
                    <Plus size={16}/>
                    Nova Avaliação
                </button>
            </div>
            <div className="relative border-l-2 border-indigo-700/50 ml-4">
                {assessments.map((assessment) => (
                    <div key={assessment.id} className="mb-10 ml-8">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full -left-4 ring-4 ring-gray-900"><Briefcase className="w-4 h-4 text-white" /></span>
                        <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <time className="text-sm font-semibold text-white">{formatDate(assessment.date)}</time>
                                <div>
                                    <span className="bg-indigo-900 text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded">Maturidade: {assessment.overallMaturity}%</span>
                                    <button onClick={() => onStartEditing(assessment)} className="ml-2 p-1 text-gray-400 hover:text-white"><Edit size={16}/></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                {PILLARS.map(pillar => (
                                    <div key={pillar}>
                                        <p className="text-sm font-semibold" style={{color: PILLAR_DATA[pillar].color}}>{PILLAR_DATA[pillar].name}</p>
                                        <p className="text-xs text-gray-400">Score: {calculatePillarScore(assessment.scores[pillar].responses)}</p>
                                        {assessment.scores[pillar].notes && <p className="text-xs text-gray-400 mt-1 italic">"{assessment.scores[pillar].notes}"</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Meeting Prep View
const MeetingPrepView: React.FC = () => {
    const { activeClient } = useData();
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateSummary = useCallback(async () => {
        if (!activeClient) return;
        setIsLoading(true); setError(''); setSummary('');
        try {
            const result = await generateExecutiveSummary(activeClient);
            setSummary(result);
        } catch (err: any) {
            setError('Falha ao gerar o resumo. Verifique sua chave de API e a conexão.');
        }
        setIsLoading(false);
    }, [activeClient]);

    const handlePrint = () => window.print();

    return (
        <div>
            <div className="no-print bg-gray-800/50 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Preparação de Reunião com IA</h3>
                        <p className="text-gray-400 mt-1">Gere um resumo executivo com os principais pontos de discussão.</p>
                    </div>
                    <button onClick={handleGenerateSummary} disabled={isLoading || !activeClient || activeClient.assessments.length === 0} className="mt-4 md:mt-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? <><BotMessageSquare className="w-5 h-5 animate-pulse" /><span>Gerando...</span></> : <><BotMessageSquare className="w-5 h-5" /><span>Gerar Resumo</span></>}
                    </button>
                </div>
                 {activeClient && activeClient.assessments.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-900/50 text-yellow-300 rounded-lg text-sm flex items-center gap-2"><AlertTriangle size={16}/><span>É necessário ter pelo menos uma avaliação para gerar o resumo.</span></div>
                )}
            </div>
            <div id="summary-content" className="bg-gray-800/50 rounded-lg shadow-lg p-8 print-bg-white print-text-black print-border-gray border border-transparent print:border">
                <div className="flex justify-between items-start">
                    <div><h4 className="text-2xl font-bold print-text-black">Resumo Executivo</h4><p className="text-gray-400 print-text-black">Cliente: {activeClient?.name}</p></div>
                    <button onClick={handlePrint} className="no-print p-2 rounded-md hover:bg-gray-700"><FileDown className="w-5 h-5"/></button>
                </div>
                <hr className="my-4 border-gray-700 print-border-gray"/>
                {error && <p className="text-red-400">{error}</p>}
                {summary ? <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-white print:prose-p:text-black print:prose-strong:text-black" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }}/> : <p className="text-gray-500 italic">O resumo gerado pela IA aparecerá aqui.</p>}
            </div>
        </div>
    );
};

// Resource Library View
const ResourceLibraryView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-800/30 rounded-lg p-8 text-center">
            <Library className="w-16 h-16 text-indigo-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Biblioteca de Recursos</h2>
            <p className="text-gray-400 max-w-md">Em breve: uma coleção de playbooks, templates e artigos para acelerar a maturidade comercial.</p>
        </div>
    );
};

// Accordion for Edit Modal
const AccordionItem: React.FC<{
    pillar: Pillar;
    pillarScoreData: PillarScore | (Omit<PillarScore, 'responses'> & { responses: (number | null)[] });
    isOpen: boolean;
    onToggle: () => void;
    onPillarChange: (pillar: Pillar, newPillarScore: any) => void;
}> = ({ pillar, pillarScoreData, isOpen, onToggle, onPillarChange }) => {

    const handleResponseChange = (questionIndex: number, value: number) => {
        const newResponses = [...pillarScoreData.responses];
        newResponses[questionIndex] = value;
        onPillarChange(pillar, { ...pillarScoreData, responses: newResponses });
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onPillarChange(pillar, { ...pillarScoreData, notes: e.target.value });
    };

    const Icon = ICON_MAP[pillar];

    const displayScore = useMemo(() => {
        const validResponses = pillarScoreData.responses.filter(r => typeof r === 'number') as number[];
        const totalScore = validResponses.reduce((acc, r) => acc + (r || 0), 0);
        return Math.round(totalScore / 10);
    }, [pillarScoreData.responses]);

    return (
        <div className="border-b border-indigo-800/50">
            <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" style={{ color: PILLAR_DATA[pillar].color }} />
                    <span className="font-semibold">{PILLAR_DATA[pillar].name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-400">{displayScore}/100</span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-900/30">
                    <div className="space-y-1">
                        {PILLAR_QUESTIONS[pillar].map((q, index) => (
                            <QuestionResponseGroup
                                key={index}
                                question={q}
                                questionIndex={index}
                                currentResponse={pillarScoreData.responses[index]}
                                onResponseChange={handleResponseChange}
                            />
                        ))}
                    </div>
                     <div className="mt-6">
                        <label htmlFor={`notes-${pillar}`} className="block text-sm font-medium text-gray-300">Notas / Plano de Ação</label>
                        <textarea id={`notes-${pillar}`} rows={3} value={pillarScoreData.notes} onChange={handleNotesChange} className="mt-1 w-full px-3 py-2 text-white bg-gray-900/50 border border-gray-600 rounded-md"/>
                    </div>
                </div>
            )}
        </div>
    )
}

// Edit Assessment Modal (now controlled by Dashboard state)
const EditAssessmentModal: React.FC<{ 
    assessment: Assessment;
    editedScores: PillarScores;
    onSavePillar: (pillar: Pillar, newPillarScore: PillarScore) => void;
    onClose: () => void;
}> = ({ assessment, editedScores, onSavePillar, onClose }) => {
    
    const [localScores, setLocalScores] = useState<PillarScores>(() => JSON.parse(JSON.stringify(editedScores)));
    const [openPillars, setOpenPillars] = useState<Record<string, boolean>>({});

    const handleTogglePillar = (pillar: Pillar) => {
        setOpenPillars(prev => ({...prev, [pillar]: !prev[pillar]}));
    };
    
    const handleLocalPillarChange = (pillar: Pillar, newPillarScore: PillarScore) => {
        setLocalScores(prev => ({ ...prev, [pillar]: newPillarScore }));
    };

    const handleSaveChanges = () => {
        // Find changed pillars and save them to the parent's "cart"
        PILLARS.forEach(pillar => {
            // Using stringify for deep comparison, it's ok for this data structure.
            if (JSON.stringify(localScores[pillar]) !== JSON.stringify(editedScores[pillar])) {
                 onSavePillar(pillar, localScores[pillar]);
            }
        });
        onClose();
    };

    const newOverallMaturity = calculateOverallMaturity(localScores);
    const areAnyPillarsOpen = Object.values(openPillars).some(v => v);
    const hasChanges = JSON.stringify(localScores) !== JSON.stringify(editedScores);

    return (
        <div className="no-print fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-indigo-800/50">
                    <div>
                        <h2 className="text-xl font-bold">Editando Avaliação</h2>
                        <p className="text-sm text-gray-400">Data Original: {formatDate(assessment.date)} | Maturidade com Edições: {newOverallMaturity}%</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="flex-grow p-2 overflow-y-auto">
                    {PILLARS.map(pillar => (
                        <AccordionItem 
                            key={pillar} 
                            pillar={pillar}
                            pillarScoreData={localScores[pillar]}
                            isOpen={!!openPillars[pillar]}
                            onToggle={() => handleTogglePillar(pillar)}
                            onPillarChange={handleLocalPillarChange}
                        />
                    ))}
                </div>
                <div className="flex-shrink-0 p-4 bg-gray-900/50 border-t border-indigo-800/50 flex justify-end gap-4">
                     <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
                    {!areAnyPillarsOpen && (
                         <button
                            onClick={handleSaveChanges}
                            disabled={!hasChanges}
                            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            Salvar Mudanças no Carrinho
                         </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const EditingCartBar: React.FC<{
    changedPillarsCount: number;
    onCreateAssessment: () => void;
    onUpdateAssessment: () => void;
    onCancel: () => void;
}> = ({ changedPillarsCount, onCreateAssessment, onUpdateAssessment, onCancel }) => {
    if (changedPillarsCount === 0) {
        return null;
    }

    return (
        <div className="no-print fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-lg border-t border-indigo-700/50 z-50 shadow-2xl animate-fade-in-up">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📊</span>
                        <div>
                            <p className="font-semibold text-white">
                                Você tem alterações em {changedPillarsCount} {changedPillarsCount > 1 ? 'setores' : 'setor'}.
                            </p>
                            <p className="text-sm text-gray-400">Suas edições estão salvas temporariamente.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                         <button
                            onClick={onUpdateAssessment}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Salvar Alterações
                        </button>
                        <button
                            onClick={onCreateAssessment}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg"
                        >
                            Criar Nova Avaliação
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Local type for the creation modal state
type NewPillarScore = Omit<PillarScore, 'responses'> & {
    responses: (number | null)[];
};
type NewPillarScores = Record<Pillar, NewPillarScore>;

const CreateAssessmentModal: React.FC<{
    onClose: () => void;
    onCreate: (scores: PillarScores) => void;
    initialAssessment: Assessment | null;
}> = ({ onClose, onCreate, initialAssessment }) => {

    const createBlankScores = (): NewPillarScores => {
        return PILLARS.reduce((acc, pillar) => {
            acc[pillar] = { responses: Array(10).fill(null), goal: 80, notes: '' };
            return acc;
        }, {} as NewPillarScores);
    };
    
    const getInitialCreateScores = (): NewPillarScores => {
        if (initialAssessment) {
            // Deep copy of scores from the last assessment
            return JSON.parse(JSON.stringify(initialAssessment.scores));
        }
        return createBlankScores();
    };
    
    const [newScores, setNewScores] = useState<NewPillarScores>(getInitialCreateScores);
    const [openPillars, setOpenPillars] = useState<Record<string, boolean>>({ [Pillar.STRATEGY]: true });
    const [showConfirmReset, setShowConfirmReset] = useState(false);


    const handleTogglePillar = (pillar: Pillar) => {
        setOpenPillars(prev => ({ ...prev, [pillar]: !prev[pillar] }));
    };
    
    const handlePillarChange = (pillar: Pillar, changedPillarScore: NewPillarScore) => {
        setNewScores(prev => ({ ...prev, [pillar]: changedPillarScore }));
    };

    const handleConfirmReset = () => {
        setNewScores(prevScores => {
            const nextScores = {} as NewPillarScores;
            for (const pillar of PILLARS) {
                nextScores[pillar] = {
                    goal: prevScores[pillar]?.goal || 80,
                    notes: prevScores[pillar]?.notes || '',
                    responses: Array(10).fill(0),
                };
            }
            return nextScores;
        });
        setShowConfirmReset(false);
    };

    const isFormValid = useMemo(() => {
        return Object.values(newScores).every(pillar =>
            pillar.responses.every(response => response !== null)
        );
    }, [newScores]);

    const handleCreate = () => {
        if (!isFormValid) return;
        // The form is valid, so we can safely cast the responses to number[]
        const finalScores = JSON.parse(JSON.stringify(newScores)) as PillarScores;
        onCreate(finalScores);
    };
    
    const newOverallMaturity = useMemo(() => {
        const scoresForCalc: PillarScores = {
            [Pillar.STRATEGY]: { ...newScores.strategy, responses: newScores.strategy.responses.map(r => r ?? 0) },
            [Pillar.GOALS]: { ...newScores.goals, responses: newScores.goals.responses.map(r => r ?? 0) },
            [Pillar.CHANNELS]: { ...newScores.channels, responses: newScores.channels.responses.map(r => r ?? 0) },
            [Pillar.PROCESS]: { ...newScores.process, responses: newScores.process.responses.map(r => r ?? 0) },
            [Pillar.METRICS]: { ...newScores.metrics, responses: newScores.metrics.responses.map(r => r ?? 0) },
            [Pillar.COMPENSATION]: { ...newScores.compensation, responses: newScores.compensation.responses.map(r => r ?? 0) },
            [Pillar.SYSTEMS]: { ...newScores.systems, responses: newScores.systems.responses.map(r => r ?? 0) },
        };
        return calculateOverallMaturity(scoresForCalc);
    }, [newScores]);

    return (
        <div className="no-print fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-indigo-800/50">
                    <div>
                        <h2 className="text-xl font-bold">Criar Nova Avaliação</h2>
                        <p className="text-sm text-gray-400">
                           {initialAssessment ? (
                                <>
                                    Anterior: <span className="font-semibold text-gray-300">{initialAssessment.overallMaturity}%</span> | 
                                    Atual: <span className="font-semibold text-white">{newOverallMaturity}%</span>
                                </>
                           ) : (
                                `Maturidade atual: ${newOverallMaturity}%`
                           )}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="flex-grow p-2 overflow-y-auto">
                    {PILLARS.map(pillar => (
                        <AccordionItem 
                            key={pillar} 
                            pillar={pillar}
                            pillarScoreData={newScores[pillar]}
                            isOpen={!!openPillars[pillar]}
                            onToggle={() => handleTogglePillar(pillar)}
                            onPillarChange={handlePillarChange}
                        />
                    ))}
                </div>
                <div className="flex-shrink-0 p-4 bg-gray-900/50 border-t border-indigo-800/50 flex justify-between items-center gap-4">
                     {!isFormValid ? (
                        <div className="flex items-center gap-2 text-sm text-yellow-400">
                            <Info size={16} />
                            <span>Responda todas as perguntas para continuar.</span>
                        </div>
                    ) : <div />}
                    <div className="flex items-center gap-4">
                        {!showConfirmReset ? (
                            <button
                                onClick={() => setShowConfirmReset(true)}
                                className="px-6 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
                            >
                                Zerar Respostas
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-red-900/50 border border-red-700/50">
                                <span className="text-sm text-yellow-300 ml-2">Tem certeza?</span>
                                <button
                                    onClick={() => setShowConfirmReset(false)}
                                    className="px-4 py-1 text-sm bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    Não
                                </button>
                                <button
                                    onClick={handleConfirmReset}
                                    className="px-4 py-1 text-sm bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Sim, zerar
                                </button>
                            </div>
                        )}

                        <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Cancelar</button>
                        <button
                            onClick={handleCreate}
                            disabled={!isFormValid}
                            className="px-8 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-800/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Criar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
