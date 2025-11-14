import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import type { Client, PillarScores, Assessment, Deliverable, WeeklyPlan, KanbanCard, ClientInfoSectionId, ClientInfoQuestion, Attachment } from './types';
import { calculateOverallMaturity, fileToBase64 } from './utils';
import { DUMMY_CLIENTS_DATA, PILLARS, INITIAL_PILLAR_SCORE, DEFAULT_CLIENT_INFO, CLIENT_INFO_SECTIONS_ORDER } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Data Context
interface DataContextType {
    isLoggedIn: boolean;
    clients: Client[];
    activeClientId: string | null;
    login: (password: string) => boolean;
    logout: () => void;
    setActiveClientId: (id: string | null) => void;
    addAssessment: (clientId: string, scores: PillarScores) => void;
    updateAssessment: (clientId: string, assessmentId: string, scores: PillarScores) => void;
    addClient: (name: string) => void;
    activeClient: Client | null;
    addDeliverable: (clientId: string, name: string, description: string, content: string) => void;
    deleteDeliverable: (clientId: string, deliverableId: string) => void;
    addWeeklyPlan: (clientId: string) => void;
    deleteWeeklyPlan: (clientId: string, planId: string) => void;
    addKanbanCard: (clientId: string, planId: string, cardData: Omit<KanbanCard, 'id' | 'status'>) => void;
    updateKanbanCard: (clientId: string, planId: string, cardId: string, updatedData: Partial<KanbanCard>) => void;
    deleteKanbanCard: (clientId: string, planId: string, cardId: string) => void;
    updateClientInfoAnswer: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, answer: string) => void;
    addClientInfoQuestion: (clientId: string, sectionId: ClientInfoSectionId, question: string) => void;
    deleteClientInfoQuestion: (clientId: string, sectionId: ClientInfoSectionId, questionId: string) => void;
    addClientInfoAttachment: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, file: File) => Promise<void>;
    deleteClientInfoAttachment: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, attachmentId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};


// Main App Component
const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [activeClientId, setActiveClientId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        try {
            const storedClients = localStorage.getItem('commercialos_clients');
            if (storedClients) {
                setClients(JSON.parse(storedClients));
            } else {
                setClients(DUMMY_CLIENTS_DATA);
                localStorage.setItem('commercialos_clients', JSON.stringify(DUMMY_CLIENTS_DATA));
            }

            const storedSession = localStorage.getItem('commercialos_session');
            if (storedSession === 'true') {
                setIsLoggedIn(true);
            }
            
            const storedActiveClient = localStorage.getItem('commercialos_activeClient');
            if(storedActiveClient) {
                setActiveClientId(storedActiveClient);
            } else if (DUMMY_CLIENTS_DATA.length > 0) {
                setActiveClientId(DUMMY_CLIENTS_DATA[0].id);
            }

        } catch (error) {
            console.error("Failed to initialize from localStorage", error);
            setClients(DUMMY_CLIENTS_DATA);
        }
        setIsInitialized(true);
    }, []);

    const persistClients = useCallback((updatedClients: Client[]) => {
        setClients(updatedClients);
        localStorage.setItem('commercialos_clients', JSON.stringify(updatedClients));
    }, []);
    
    const persistActiveClient = useCallback((id: string | null) => {
        setActiveClientId(id);
        if (id) {
            localStorage.setItem('commercialos_activeClient', id);
        } else {
            localStorage.removeItem('commercialos_activeClient');
        }
    }, []);


    const login = useCallback((password: string): boolean => {
        if (password === 'master') { // Simple mock password
            setIsLoggedIn(true);
            localStorage.setItem('commercialos_session', 'true');
            if(clients.length > 0 && !activeClientId) {
                persistActiveClient(clients[0].id);
            }
            return true;
        }
        return false;
    }, [clients, activeClientId, persistActiveClient]);

    const logout = useCallback(() => {
        setIsLoggedIn(false);
        localStorage.removeItem('commercialos_session');
    }, []);

    const addAssessment = useCallback((clientId: string, newScores: PillarScores) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newAssessment: Assessment = {
                    id: `assessment-${client.id}-${new Date().getTime()}`,
                    date: new Date().toISOString(),
                    scores: newScores,
                    overallMaturity: calculateOverallMaturity(newScores),
                };
                return {
                    ...client,
                    assessments: [...client.assessments, newAssessment],
                };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);
    
    const updateAssessment = useCallback((clientId: string, assessmentId: string, updatedScores: PillarScores) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const updatedAssessments = client.assessments.map(assessment => {
                    if (assessment.id === assessmentId) {
                        return {
                            ...assessment,
                            scores: updatedScores,
                            overallMaturity: calculateOverallMaturity(updatedScores),
                        };
                    }
                    return assessment;
                });
                return { ...client, assessments: updatedAssessments };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);


    const addClient = useCallback((name: string) => {
        const newClient: Client = {
            id: `client-${new Date().getTime()}`,
            name,
            onboardingDate: new Date().toISOString(),
            assessments: [],
            deliverables: [],
            weeklyPlans: [],
            clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
        };
        const updatedClients = [...clients, newClient];
        persistClients(updatedClients);
        persistActiveClient(newClient.id);
    }, [clients, persistClients, persistActiveClient]);

    const addDeliverable = useCallback((clientId: string, name: string, description: string, content: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newDeliverable: Deliverable = {
                    id: `deliverable-${new Date().getTime()}`,
                    name,
                    description,
                    content,
                };
                return {
                    ...client,
                    deliverables: [newDeliverable, ...(client.deliverables || [])]
                };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const deleteDeliverable = useCallback((clientId: string, deliverableId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                return {
                    ...client,
                    deliverables: (client.deliverables || []).filter(d => d.id !== deliverableId),
                };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);
    
    // Weekly Plan Functions
    const addWeeklyPlan = useCallback((clientId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const plans = client.weeklyPlans || [];
                const lastPlan = plans[plans.length - 1];
                
                const nextMonday = new Date();
                nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
                if (nextMonday.getDay() !== 1) nextMonday.setDate(nextMonday.getDate() + 7);
                nextMonday.setHours(0, 0, 0, 0);

                const startDate = lastPlan ? new Date(new Date(lastPlan.endDate).getTime() + 24 * 60 * 60 * 1000) : nextMonday;
                const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

                const newPlan: WeeklyPlan = {
                    id: `wplan-${new Date().getTime()}`,
                    weekNumber: plans.length + 1,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    cards: [],
                };
                return { ...client, weeklyPlans: [...plans, newPlan] };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const deleteWeeklyPlan = useCallback((clientId: string, planId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const updatedPlans = (client.weeklyPlans || []).filter(p => p.id !== planId)
                    .map((p, index) => ({ ...p, weekNumber: index + 1 })); // Re-number weeks
                return { ...client, weeklyPlans: updatedPlans };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const addKanbanCard = useCallback((clientId: string, planId: string, cardData: Omit<KanbanCard, 'id' | 'status'>) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const updatedPlans = (client.weeklyPlans || []).map(plan => {
                    if (plan.id === planId) {
                        const newCard: KanbanCard = {
                            ...cardData,
                            id: `kcard-${new Date().getTime()}`,
                            status: 'todo',
                        };
                        return { ...plan, cards: [...plan.cards, newCard] };
                    }
                    return plan;
                });
                return { ...client, weeklyPlans: updatedPlans };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const updateKanbanCard = useCallback((clientId: string, planId: string, cardId: string, updatedData: Partial<KanbanCard>) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const updatedPlans = (client.weeklyPlans || []).map(plan => {
                    if (plan.id === planId) {
                        const updatedCards = plan.cards.map(card => 
                            card.id === cardId ? { ...card, ...updatedData } : card
                        );
                        return { ...plan, cards: updatedCards };
                    }
                    return plan;
                });
                return { ...client, weeklyPlans: updatedPlans };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const deleteKanbanCard = useCallback((clientId: string, planId: string, cardId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const updatedPlans = (client.weeklyPlans || []).map(plan => {
                    if (plan.id === planId) {
                        const updatedCards = plan.cards.filter(card => card.id !== cardId);
                        return { ...plan, cards: updatedCards };
                    }
                    return plan;
                });
                return { ...client, weeklyPlans: updatedPlans };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const updateClientInfoAnswer = useCallback((clientId: string, sectionId: ClientInfoSectionId, questionId: string, answer: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newClientInfo = { ...client.clientInfo };
                const newQuestions = newClientInfo[sectionId].questions.map(q => 
                    q.id === questionId ? { ...q, answer } : q
                );
                newClientInfo[sectionId] = { ...newClientInfo[sectionId], questions: newQuestions };
                return { ...client, clientInfo: newClientInfo };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const addClientInfoQuestion = useCallback((clientId: string, sectionId: ClientInfoSectionId, question: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newClientInfo = { ...client.clientInfo };
                const newQuestion: ClientInfoQuestion = {
                    id: `q-${new Date().getTime()}`,
                    question,
                    answer: '',
                    isDefault: false,
                    attachments: [],
                };
                const newQuestions = [...newClientInfo[sectionId].questions, newQuestion];
                newClientInfo[sectionId] = { ...newClientInfo[sectionId], questions: newQuestions };
                return { ...client, clientInfo: newClientInfo };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const deleteClientInfoQuestion = useCallback((clientId: string, sectionId: ClientInfoSectionId, questionId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newClientInfo = { ...client.clientInfo };
                const newQuestions = newClientInfo[sectionId].questions.filter(q => q.id !== questionId);
                newClientInfo[sectionId] = { ...newClientInfo[sectionId], questions: newQuestions };
                return { ...client, clientInfo: newClientInfo };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const addClientInfoAttachment = useCallback(async (clientId: string, sectionId: ClientInfoSectionId, questionId: string, file: File) => {
        const base64Data = await fileToBase64(file);
        const newAttachment: Attachment = {
            id: `att-${new Date().getTime()}`,
            name: file.name,
            type: file.type,
            data: base64Data,
        };

        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newClientInfo = JSON.parse(JSON.stringify(client.clientInfo));
                const newQuestions = newClientInfo[sectionId].questions.map((q: ClientInfoQuestion) => {
                    if (q.id === questionId) {
                        const attachments = [...(q.attachments || []), newAttachment];
                        return { ...q, attachments };
                    }
                    return q;
                });
                newClientInfo[sectionId] = { ...newClientInfo[sectionId], questions: newQuestions };
                return { ...client, clientInfo: newClientInfo };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const deleteClientInfoAttachment = useCallback((clientId: string, sectionId: ClientInfoSectionId, questionId: string, attachmentId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newClientInfo = JSON.parse(JSON.stringify(client.clientInfo));
                const newQuestions = newClientInfo[sectionId].questions.map((q: ClientInfoQuestion) => {
                    if (q.id === questionId) {
                        const attachments = (q.attachments || []).filter(att => att.id !== attachmentId);
                        return { ...q, attachments };
                    }
                    return q;
                });
                newClientInfo[sectionId] = { ...newClientInfo[sectionId], questions: newQuestions };
                return { ...client, clientInfo: newClientInfo };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const activeClient = useMemo(() => {
        const client = clients.find(c => c.id === activeClientId) || null;
        if (!client) {
            return null;
        }

        const clientCopy = JSON.parse(JSON.stringify(client));

        // Validation for Client Info (for backward compatibility)
        if (!clientCopy.clientInfo) {
            clientCopy.clientInfo = JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO));
        } else {
             for (const sectionId of CLIENT_INFO_SECTIONS_ORDER) {
                const key = sectionId as ClientInfoSectionId;
                if (!clientCopy.clientInfo[key]) {
                    clientCopy.clientInfo[key] = JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO[key]));
                } else {
                    const defaultQuestions = DEFAULT_CLIENT_INFO[key].questions;
                    const clientQuestions = clientCopy.clientInfo[key].questions || [];
                    
                    defaultQuestions.forEach(defaultQ => {
                        if (!clientQuestions.some((clientQ: ClientInfoQuestion) => clientQ.id === defaultQ.id)) {
                            clientQuestions.unshift(JSON.parse(JSON.stringify(defaultQ)));
                        }
                    });
                    
                    // Ensure all questions have an attachments array
                    clientQuestions.forEach((q: ClientInfoQuestion) => {
                      if (!q.attachments) {
                        q.attachments = [];
                      }
                    });

                    clientCopy.clientInfo[key].questions = clientQuestions;
                }
            }
        }

        // Return a client object with validated data to prevent crashes from malformed data in localStorage
        return {
            ...clientCopy,
            assessments: client.assessments.map(assessment => {
                const validatedScores = {} as PillarScores;
                for (const pillar of PILLARS) {
                    const defaultPillarScore = { ...INITIAL_PILLAR_SCORE };
                    const existingPillarScore = assessment.scores ? assessment.scores[pillar] : {};
                    validatedScores[pillar] = { ...defaultPillarScore, ...existingPillarScore };

                    if (!Array.isArray(validatedScores[pillar].responses) || validatedScores[pillar].responses.length !== 10) {
                        validatedScores[pillar].responses = Array(10).fill(0);
                    }
                }
                return { ...assessment, scores: validatedScores };
            }),
            deliverables: client.deliverables || [],
            weeklyPlans: client.weeklyPlans || [],
        };
    }, [clients, activeClientId]);
    
    const dataContextValue = {
        isLoggedIn,
        clients,
        activeClientId,
        login,
        logout,
        setActiveClientId: persistActiveClient,
        addAssessment,
        updateAssessment,
        addClient,
        activeClient,
        addDeliverable,
        deleteDeliverable,
        addWeeklyPlan,
        deleteWeeklyPlan,
        addKanbanCard,
        updateKanbanCard,
        deleteKanbanCard,
        updateClientInfoAnswer,
        addClientInfoQuestion,
        deleteClientInfoQuestion,
        addClientInfoAttachment,
        deleteClientInfoAttachment,
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                Carregando...
            </div>
        );
    }
    
    return (
        <DataContext.Provider value={dataContextValue}>
            <div className="min-h-screen bg-gray-900 text-gray-200">
                {isLoggedIn && activeClient ? <Dashboard /> : <Login />}
            </div>
        </DataContext.Provider>
    );
};

export default App;