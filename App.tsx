import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import type { Client, PillarScores, Assessment, Deliverable, WeeklyPlan, KanbanCard, ClientInfoSectionId, ClientInfoQuestion, Attachment, ChatSession, User, Journey, Objective, KeyResult, Initiative, Action, KanbanCardStatus } from './types';
import { calculateOverallMaturity, fileToBase64 } from './utils';
import { DUMMY_CLIENTS_DATA, PILLARS, INITIAL_PILLAR_SCORE, DEFAULT_CLIENT_INFO, CLIENT_INFO_SECTIONS_ORDER, INITIAL_USERS } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Data Context
interface DataContextType {
    currentUser: User | null;
    users: User[];
    clients: Client[];
    activeClientId: string | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    setActiveClientId: (id: string | null) => void;
    addAssessment: (clientId: string, scores: PillarScores) => void;
    updateAssessment: (clientId: string, assessmentId: string, scores: PillarScores) => void;
    deleteAssessment: (clientId: string, assessmentId: string) => void;
    addClient: (name: string) => void;
    updateClient: (clientId: string, data: Partial<Client>) => void;
    deleteClient: (clientId: string) => void;
    activeClient: Client | null;
    addDeliverable: (clientId: string, name: string, description: string, content: string) => void;
    deleteDeliverable: (clientId: string, deliverableId: string) => void;
    addWeeklyPlan: (clientId: string) => void;
    deleteWeeklyPlan: (clientId: string, planId: string) => void;
    addKanbanCard: (clientId: string, planId: string, cardData: Omit<KanbanCard, 'id' | 'status'>, status: KanbanCardStatus) => void;
    updateKanbanCard: (clientId: string, planId: string, cardId: string, updatedData: Partial<KanbanCard>) => void;
    deleteKanbanCard: (clientId: string, planId: string, cardId: string) => void;
    updateClientInfoAnswer: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, answer: string) => void;
    addClientInfoQuestion: (clientId: string, sectionId: ClientInfoSectionId, question: string) => void;
    deleteClientInfoQuestion: (clientId: string, sectionId: ClientInfoSectionId, questionId: string) => void;
    addClientInfoAttachment: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, file: File) => Promise<void>;
    deleteClientInfoAttachment: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, attachmentId: string) => void;
    addChatSession: (clientId: string) => ChatSession;
    updateChatSession: (clientId: string, sessionId: string, updatedData: Partial<ChatSession>) => void;
    deleteChatSession: (clientId: string, sessionId: string) => void;
    updateClientDiagnosticSummary: (clientId: string, summary: string) => void;
    addUser: (userData: Omit<User, 'id'>) => boolean;
    updateUser: (userId: string, userData: Partial<User>) => void;
    deleteUser: (userId: string) => void;
    // Journeys
    addJourney: (clientId: string, name: string) => void;
    updateJourney: (clientId: string, journeyId: string, name: string, color: string) => void;
    deleteJourney: (clientId: string, journeyId: string) => void;
    addObjective: (clientId: string, journeyId: string, name: string) => void;
    updateObjective: (clientId: string, journeyId: string, objectiveId: string, name: string) => void;
    deleteObjective: (clientId: string, journeyId: string, objectiveId: string) => void;
    addKeyResult: (clientId: string, journeyId: string, objectiveId: string, name: string) => void;
    updateKeyResult: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string, progress: number) => void;
    deleteKeyResult: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string) => void;
    addInitiative: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string) => void;
    updateInitiative: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => void;
    deleteInitiative: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string) => void;
    addAction: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => void;
    updateAction: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string, name: string) => void;
    toggleActionComplete: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string) => void;
    deleteAction: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string) => void;
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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [activeClientId, setActiveClientId] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        try {
            const storedClients = localStorage.getItem('commercialos_clients');
            if (storedClients) {
                // Backward compatibility: add journeys if not present
                const parsedClients = JSON.parse(storedClients).map((c: Client) => ({...c, journeys: c.journeys || []}));
                setClients(parsedClients);
            } else {
                setClients(DUMMY_CLIENTS_DATA.map(c => ({...c, journeys: c.journeys || []})));
                localStorage.setItem('commercialos_clients', JSON.stringify(DUMMY_CLIENTS_DATA));
            }

            const storedUsers = localStorage.getItem('commercialos_users');
             if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            } else {
                setUsers(INITIAL_USERS);
                localStorage.setItem('commercialos_users', JSON.stringify(INITIAL_USERS));
            }

            const storedSessionUser = localStorage.getItem('commercialos_currentUser');
            if (storedSessionUser) {
                setCurrentUser(JSON.parse(storedSessionUser));
            }
            
            const storedActiveClient = localStorage.getItem('commercialos_activeClient');
            if(storedActiveClient) {
                setActiveClientId(storedActiveClient);
            } else if (DUMMY_CLIENTS_DATA.length > 0) {
                setActiveClientId(DUMMY_CLIENTS_DATA[0].id);
            }

        } catch (error) {
            console.error("Failed to initialize from localStorage", error);
            setClients(DUMMY_CLIENTS_DATA.map(c => ({...c, journeys: c.journeys || []})));
            setUsers(INITIAL_USERS);
        }
        setIsInitialized(true);
    }, []);

    const persistClients = useCallback((updatedClients: Client[]) => {
        setClients(updatedClients);
        localStorage.setItem('commercialos_clients', JSON.stringify(updatedClients));
    }, []);

    const persistUsers = useCallback((updatedUsers: User[]) => {
        setUsers(updatedUsers);
        localStorage.setItem('commercialos_users', JSON.stringify(updatedUsers));
    }, []);
    
    const persistActiveClient = useCallback((id: string | null) => {
        setActiveClientId(id);
        if (id) {
            localStorage.setItem('commercialos_activeClient', id);
        } else {
            localStorage.removeItem('commercialos_activeClient');
        }
    }, []);

    const persistCurrentUser = useCallback((user: User | null) => {
        setCurrentUser(user);
        if (user) {
            localStorage.setItem('commercialos_currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('commercialos_currentUser');
        }
    }, []);


    const login = useCallback((username: string, password: string): boolean => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            persistCurrentUser(user);
            if(user.role === 'admin' && clients.length > 0 && !activeClientId) {
                persistActiveClient(clients[0].id);
            }
            return true;
        }
        return false;
    }, [users, clients, activeClientId, persistActiveClient, persistCurrentUser]);

    const logout = useCallback(() => {
        persistCurrentUser(null);
    }, [persistCurrentUser]);

    // User management functions
    const addUser = useCallback((userData: Omit<User, 'id'>) => {
        if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
            alert('Username already exists.');
            return false;
        }
        const newUser: User = { ...userData, id: `user-${new Date().getTime()}` };
        persistUsers([...users, newUser]);
        return true;
    }, [users, persistUsers]);

    const updateUser = useCallback((userId: string, userData: Partial<User>) => {
        persistUsers(users.map(u => u.id === userId ? { ...u, ...userData } : u));
    }, [users, persistUsers]);
    
    const deleteUser = useCallback((userId: string) => {
        persistUsers(users.filter(u => u.id !== userId));
    }, [users, persistUsers]);

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

    const deleteAssessment = useCallback((clientId: string, assessmentId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const updatedAssessments = client.assessments.filter(
                    assessment => assessment.id !== assessmentId
                );
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
            logoUrl: '',
            onboardingDate: new Date().toISOString(),
            assessments: [],
            deliverables: [],
            weeklyPlans: [],
            clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
            chatSessions: [],
            diagnosticSummary: '',
            journeys: [],
        };
        const updatedClients = [...clients, newClient];
        persistClients(updatedClients);
        persistActiveClient(newClient.id);
    }, [clients, persistClients, persistActiveClient]);

    const updateClient = useCallback((clientId: string, data: Partial<Client>) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                return { ...client, ...data };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const deleteClient = useCallback((clientId: string) => {
        const updatedClients = clients.filter(client => client.id !== clientId);
        persistClients(updatedClients);
        if (activeClientId === clientId) {
            const newActiveId = updatedClients.length > 0 ? updatedClients[0].id : null;
            persistActiveClient(newActiveId);
        }
    }, [clients, persistClients, activeClientId, persistActiveClient]);

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

    const addKanbanCard = useCallback((clientId: string, planId: string, cardData: Omit<KanbanCard, 'id' | 'status'>, status: KanbanCardStatus = 'todo') => {
        let finalClients = clients;
        if (cardData.actionId) {
            finalClients = finalClients.map(c => {
                if (c.id === clientId) {
                    const journeys = c.journeys.map(j => ({
                        ...j,
                        objectives: j.objectives.map(o => ({
                            ...o,
                            keyResults: o.keyResults.map(k => ({
                                ...k,
                                initiatives: k.initiatives.map(i => ({
                                    ...i,
                                    actions: i.actions.map(a => a.id === cardData.actionId ? { ...a, isInKanban: true } : a)
                                }))
                            }))
                        }))
                    }));
                    return { ...c, journeys };
                }
                return c;
            });
        }

        const updatedClients = finalClients.map(client => {
            if (client.id === clientId) {
                const updatedPlans = (client.weeklyPlans || []).map(plan => {
                    if (plan.id === planId) {
                        const newCard: KanbanCard = {
                            ...cardData,
                            id: `kcard-${new Date().getTime()}`,
                            status: status,
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
        let cardToDelete: KanbanCard | undefined;
        const client = clients.find(c => c.id === clientId);
        if(client) {
            const plan = client.weeklyPlans.find(p => p.id === planId);
            if(plan) {
                cardToDelete = plan.cards.find(c => c.id === cardId);
            }
        }
        
        let finalClients = clients;
        if (cardToDelete?.actionId) {
            finalClients = finalClients.map(c => {
                 if (c.id === clientId) {
                    const journeys = c.journeys.map(j => ({
                        ...j,
                        objectives: j.objectives.map(o => ({
                            ...o,
                            keyResults: o.keyResults.map(k => ({
                                ...k,
                                initiatives: k.initiatives.map(i => ({
                                    ...i,
                                    actions: i.actions.map(a => a.id === cardToDelete?.actionId ? { ...a, isInKanban: false } : a)
                                }))
                            }))
                        }))
                    }));
                    return { ...c, journeys };
                }
                return c;
            });
        }

        const updatedClients = finalClients.map(client => {
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

    // GOALS / JOURNEYS CRUD
    const findAndMapClient = (clientId: string, callback: (client: Client) => Client) => {
        persistClients(clients.map(c => c.id === clientId ? callback(c) : c));
    };

    const addJourney = (clientId: string, name: string) => findAndMapClient(clientId, client => {
        const newJourney: Journey = { id: `j-${Date.now()}`, name, color: '#4f46e5', objectives: [] };
        return { ...client, journeys: [...client.journeys, newJourney] };
    });

    const updateJourney = (clientId: string, journeyId: string, name: string, color: string) => findAndMapClient(clientId, client => ({
        ...client,
        journeys: client.journeys.map(j => j.id === journeyId ? { ...j, name, color } : j)
    }));

    const deleteJourney = (clientId: string, journeyId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.filter(j => j.id !== journeyId)
    }));

    const addObjective = (clientId: string, journeyId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: [...j.objectives, { id: `o-${Date.now()}`, name, keyResults: [] }] } : j)
    }));

    const updateObjective = (clientId: string, journeyId: string, objectiveId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, name } : o) } : j)
    }));

    const deleteObjective = (clientId: string, journeyId: string, objectiveId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.filter(o => o.id !== objectiveId) } : j)
    }));

    const addKeyResult = (clientId: string, journeyId: string, objectiveId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: [...o.keyResults, { id: `k-${Date.now()}`, name, progress: 0, initiatives: [] }] } : o) } : j)
    }));

    const updateKeyResult = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string, progress: number) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, name, progress } : k) } : o) } : j)
    }));

    const deleteKeyResult = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.filter(k => k.id !== keyResultId) } : o) } : j)
    }));

    const addInitiative = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: [...k.initiatives, { id: `i-${Date.now()}`, name, actions: [] }] } : k) } : o) } : j)
    }));

    const updateInitiative = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, name } : i) } : k) } : o) } : j)
    }));

    const deleteInitiative = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.filter(i => i.id !== initiativeId) } : k) } : o) } : j)
    }));

    const addAction = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, actions: [...i.actions, { id: `a-${Date.now()}`, name, isCompleted: false, isInKanban: false }] } : i) } : k) } : o) } : j)
    }));

    const updateAction = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, actions: i.actions.map(a => a.id === actionId ? { ...a, name } : a) } : i) } : k) } : o) } : j)
    }));

    const toggleActionComplete = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, actions: i.actions.map(a => a.id === actionId ? { ...a, isCompleted: !a.isCompleted } : a) } : i) } : k) } : o) } : j)
    }));
    
    const deleteAction = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, actions: i.actions.filter(a => a.id !== actionId) } : i) } : k) } : o) } : j)
    }));
    // END GOALS CRUD

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

    // Chat Session Functions
    const addChatSession = useCallback((clientId: string): ChatSession => {
        const newSession: ChatSession = {
            id: `chat-${new Date().getTime()}`,
            title: 'Nova Conversa',
            messages: [],
            tone: 'Profissional',
            size: 'Médio',
            orientation: '',
            sourceIds: [],
        };
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const chatSessions = [...(client.chatSessions || []), newSession];
                return { ...client, chatSessions };
            }
            return client;
        });
        persistClients(updatedClients);
        return newSession;
    }, [clients, persistClients]);

    const updateChatSession = useCallback((clientId: string, sessionId: string, updatedData: Partial<ChatSession>) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const chatSessions = (client.chatSessions || []).map(session =>
                    session.id === sessionId ? { ...session, ...updatedData } : session
                );
                return { ...client, chatSessions };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const deleteChatSession = useCallback((clientId: string, sessionId: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const chatSessions = (client.chatSessions || []).filter(session => session.id !== sessionId);
                return { ...client, chatSessions };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);

    const updateClientDiagnosticSummary = useCallback((clientId: string, summary: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                return { ...client, diagnosticSummary: summary };
            }
            return client;
        });
        persistClients(updatedClients);
    }, [clients, persistClients]);


    const activeClient = useMemo(() => {
        const currentClientId = currentUser?.role === 'client' ? currentUser.clientId : activeClientId;
        if (!currentClientId) return null;

        const client = clients.find(c => c.id === currentClientId) || null;
        if (!client) {
            // If a client user's client was deleted, log them out.
            if (currentUser?.role === 'client') {
                logout();
            }
            return null;
        }

        const clientCopy = JSON.parse(JSON.stringify(client));
        
        if (!clientCopy.journeys) clientCopy.journeys = [];

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
        
        if (!clientCopy.chatSessions) clientCopy.chatSessions = [];
        if (clientCopy.diagnosticSummary === undefined) clientCopy.diagnosticSummary = '';

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
            chatSessions: client.chatSessions || [],
        };
    }, [clients, activeClientId, currentUser, logout]);
    
    const dataContextValue: DataContextType = {
        currentUser,
        users,
        clients,
        activeClientId,
        login,
        logout,
        setActiveClientId: persistActiveClient,
        addAssessment,
        updateAssessment,
        deleteAssessment,
        addClient,
        updateClient,
        deleteClient,
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
        addChatSession,
        updateChatSession,
        deleteChatSession,
        updateClientDiagnosticSummary,
        addUser,
        updateUser,
        deleteUser,
        addJourney, updateJourney, deleteJourney,
        addObjective, updateObjective, deleteObjective,
        addKeyResult, updateKeyResult, deleteKeyResult,
        addInitiative, updateInitiative, deleteInitiative,
        addAction, updateAction, deleteAction, toggleActionComplete,
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
                {currentUser ? <Dashboard /> : <Login />}
            </div>
        </DataContext.Provider>
    );
};

export default App;