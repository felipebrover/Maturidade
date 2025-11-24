
import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import type { Client, PillarScores, Assessment, Deliverable, ClientInfoSectionId, ClientInfoQuestion, Attachment, ChatSession, User, Journey, Objective, KeyResult, Initiative, Action } from './types';
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
    addAssessment: (clientId: string, scores: PillarScores, generalNote?: string) => void;
    updateAssessment: (clientId: string, assessmentId: string, scores: PillarScores, generalNote?: string) => void;
    deleteAssessment: (clientId: string, assessmentId: string) => void;
    addClient: (name: string) => void;
    updateClient: (clientId: string, data: Partial<Client>) => void;
    deleteClient: (clientId: string) => void;
    activeClient: Client | null;
    addDeliverable: (clientId: string, name: string, description: string, content: string) => void;
    deleteDeliverable: (clientId: string, deliverableId: string) => void;
    updateClientInfoAnswer: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, answer: string) => void;
    addClientInfoQuestion: (clientId: string, sectionId: ClientInfoSectionId, question: string) => void;
    deleteClientInfoQuestion: (clientId: string, sectionId: ClientInfoSectionId, questionId: string) => void;
    addClientInfoAttachment: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, file: File) => Promise<void>;
    addClientInfoLink: (clientId: string, sectionId: ClientInfoSectionId, questionId: string, name: string, url: string) => void;
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
    importJourney: (clientId: string, journeyTemplate: Journey) => void;
    updateJourney: (clientId: string, journeyId: string, name: string, color: string) => void;
    deleteJourney: (clientId: string, journeyId: string) => void;
    addObjective: (clientId: string, journeyId: string, name: string) => void;
    updateObjective: (clientId: string, journeyId: string, objectiveId: string, name: string) => void;
    deleteObjective: (clientId: string, journeyId: string, objectiveId: string) => void;
    addKeyResult: (clientId: string, journeyId: string, objectiveId: string, name: string) => void;
    updateKeyResult: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string) => void;
    deleteKeyResult: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string) => void;
    addInitiative: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string) => void;
    updateInitiative: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => void;
    deleteInitiative: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string) => void;
    addAction: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => void;
    updateAction: (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string, name: string, isCompleted: boolean) => void;
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
            // --- NEW CLIENTS LOADING LOGIC ---
            const storedClientsJSON = localStorage.getItem('bslabs_clients');
            let finalClients: Client[] = [];

            const defaultClientsMap = new Map(DUMMY_CLIENTS_DATA.map(c => [c.id, c]));

            if (storedClientsJSON) {
                // Fix: Add type assertion to JSON.parse to prevent 'any' type propagation,
                // which can lead to errors like spreading a non-object type.
                const storedClients: Client[] = JSON.parse(storedClientsJSON);
                const storedClientsMap = new Map(storedClients.map((c: Client) => [c.id, c]));

                const allClientIds = new Set([...defaultClientsMap.keys(), ...storedClientsMap.keys()]);
                
                allClientIds.forEach(id => {
                    // Stored client data takes precedence over default data
                    const clientData = storedClientsMap.get(id) || defaultClientsMap.get(id);
                    if (clientData) {
                        finalClients.push({ ...clientData });
                    }
                });
            } else {
                // No stored data, use default data
                finalClients = [...DUMMY_CLIENTS_DATA];
            }

            // Ensure data integrity and deep copies for all clients
            finalClients = finalClients.map(client => ({
                ...client,
                journeys: client.journeys || [],
                // Deep copy clientInfo to avoid reference issues, especially for new default clients
                clientInfo: JSON.parse(JSON.stringify(client.clientInfo || DEFAULT_CLIENT_INFO))
            }));
            
            setClients(finalClients);
            localStorage.setItem('bslabs_clients', JSON.stringify(finalClients));
            // --- END NEW CLIENTS LOADING LOGIC ---


            const storedUsers = localStorage.getItem('bslabs_users_v3');
             if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            } else {
                setUsers(INITIAL_USERS);
                localStorage.setItem('bslabs_users_v3', JSON.stringify(INITIAL_USERS));
            }

            const storedSessionUser = localStorage.getItem('bslabs_currentUser');
            if (storedSessionUser) {
                setCurrentUser(JSON.parse(storedSessionUser));
            }
            
            const storedActiveClient = localStorage.getItem('bslabs_activeClient');
            if(storedActiveClient && finalClients.some(c => c.id === storedActiveClient)) {
                setActiveClientId(storedActiveClient);
            } else if (finalClients.length > 0) {
                setActiveClientId(finalClients[0].id);
            }

        } catch (error) {
            console.error("Failed to initialize from localStorage", error);
            // Fallback to default data
            const defaultClients = DUMMY_CLIENTS_DATA.map(c => ({
                ...c, 
                journeys: c.journeys || [], 
                clientInfo: JSON.parse(JSON.stringify(c.clientInfo || DEFAULT_CLIENT_INFO))
            }));
            setClients(defaultClients);
            localStorage.setItem('bslabs_clients', JSON.stringify(defaultClients));
            setUsers(INITIAL_USERS);
            localStorage.setItem('bslabs_users_v3', JSON.stringify(INITIAL_USERS));
        }
        setIsInitialized(true);
    }, []);

    const persistClients = useCallback((updatedClients: Client[]) => {
        setClients(updatedClients);
        localStorage.setItem('bslabs_clients', JSON.stringify(updatedClients));
    }, []);

    const persistUsers = useCallback((updatedUsers: User[]) => {
        setUsers(updatedUsers);
        localStorage.setItem('bslabs_users_v3', JSON.stringify(updatedUsers));
    }, []);
    
    const persistActiveClient = useCallback((id: string | null) => {
        setActiveClientId(id);
        if (id) {
            localStorage.setItem('bslabs_activeClient', id);
        } else {
            localStorage.removeItem('bslabs_activeClient');
        }
    }, []);

    const persistCurrentUser = useCallback((user: User | null) => {
        setCurrentUser(user);
        if (user) {
            localStorage.setItem('bslabs_currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('bslabs_currentUser');
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

    const addAssessment = useCallback((clientId: string, newScores: PillarScores, generalNote?: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newAssessment: Assessment = {
                    id: `assessment-${client.id}-${new Date().getTime()}`,
                    date: new Date().toISOString(),
                    scores: newScores,
                    overallMaturity: calculateOverallMaturity(newScores),
                    generalNote: generalNote || ''
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
    
    const updateAssessment = useCallback((clientId: string, assessmentId: string, updatedScores: PillarScores, generalNote?: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const updatedAssessments = client.assessments.map(assessment => {
                    if (assessment.id === assessmentId) {
                        return {
                            ...assessment,
                            scores: updatedScores,
                            overallMaturity: calculateOverallMaturity(updatedScores),
                            generalNote: generalNote !== undefined ? generalNote : assessment.generalNote
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
    
    const recalculateProgressForClient = (client: Client): Client => {
        const newClient = JSON.parse(JSON.stringify(client));
        newClient.journeys.forEach((j: Journey) => {
            let totalObjectiveProgress = 0;
            j.objectives.forEach((o: Objective) => {
                let totalKeyResultProgress = 0;
                o.keyResults.forEach((k: KeyResult) => {
                    let totalInitiativeProgress = 0;
                    k.initiatives.forEach((i: Initiative) => {
                        // Level 4: Actions
                        const completedActions = i.actions.filter((a: Action) => a.isCompleted).length;
                        // Update Initiative Progress based on Actions
                        i.progress = i.actions.length > 0 ? Math.round((completedActions / i.actions.length) * 100) : 0;
                        
                        totalInitiativeProgress += i.progress;
                    });
                    // Update KR Progress based on Initiatives
                    k.progress = k.initiatives.length > 0 ? Math.round(totalInitiativeProgress / k.initiatives.length) : 0;
                    totalKeyResultProgress += k.progress;
                });
                // Update Objective Progress based on Key Results
                o.progress = o.keyResults.length > 0 ? Math.round(totalKeyResultProgress / o.keyResults.length) : 0;
                totalObjectiveProgress += o.progress;
            });
            // Update Journey Progress based on Objectives
            j.progress = j.objectives.length > 0 ? Math.round(totalObjectiveProgress / j.objectives.length) : 0;
        });
        return newClient;
    };

    const findAndMapClient = (clientId: string, callback: (client: Client) => Client) => {
        const updatedClients = clients.map(c => c.id === clientId ? callback(c) : c);
        // Immediately recalculate progress after any change to the planning structure
        const finalClients = updatedClients.map(c => c.id === clientId ? recalculateProgressForClient(c) : c);
        persistClients(finalClients);
    };

    const addJourney = (clientId: string, name: string) => findAndMapClient(clientId, client => {
        const newJourney: Journey = { id: `j-${Date.now()}`, name, color: '#4f46e5', objectives: [], progress: 0 };
        return { ...client, journeys: [...client.journeys, newJourney] };
    });
    
    const importJourney = (clientId: string, journeyTemplate: Journey) => findAndMapClient(clientId, client => {
        // Deep copy and regenerate IDs to avoid conflicts
        const newJourney: Journey = {
            ...JSON.parse(JSON.stringify(journeyTemplate)),
            id: `j-imported-${Date.now()}`,
            objectives: journeyTemplate.objectives.map(obj => ({
                ...obj,
                id: `o-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                keyResults: obj.keyResults.map(kr => ({
                    ...kr,
                    id: `kr-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    initiatives: kr.initiatives.map(init => ({
                        ...init,
                        id: `init-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        actions: init.actions.map(act => ({
                            ...act,
                            id: `act-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                        }))
                    }))
                }))
            }))
        };
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
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: [...j.objectives, { id: `o-${Date.now()}`, name, keyResults: [], progress: 0 }] } : j)
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

    const updateKeyResult = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, name } : k) } : o) } : j)
    }));

    const deleteKeyResult = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.filter(k => k.id !== keyResultId) } : o) } : j)
    }));

    const addInitiative = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: [...k.initiatives, { id: `i-${Date.now()}`, name, actions: [], progress: 0 }] } : k) } : o) } : j)
    }));

    const updateInitiative = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, name } : i) } : k) } : o) } : j)
    }));

    const deleteInitiative = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.filter(i => i.id !== initiativeId) } : k) } : o) } : j)
    }));

    const addAction = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, name: string) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, actions: [...i.actions, { id: `a-${Date.now()}`, name, isCompleted: false }] } : i) } : k) } : o) } : j)
    }));

    const updateAction = (clientId: string, journeyId: string, objectiveId: string, keyResultId: string, initiativeId: string, actionId: string, name: string, isCompleted: boolean) => findAndMapClient(clientId, client => ({
        ...client, journeys: client.journeys.map(j => j.id === journeyId ? { ...j, objectives: j.objectives.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(k => k.id === keyResultId ? { ...k, initiatives: k.initiatives.map(i => i.id === initiativeId ? { ...i, actions: i.actions.map(a => a.id === actionId ? { ...a, name, isCompleted } : a) } : i) } : k) } : o) } : j)
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

    const addClientInfoLink = useCallback((clientId: string, sectionId: ClientInfoSectionId, questionId: string, name: string, url: string) => {
        const updatedClients = clients.map(client => {
            if (client.id === clientId) {
                const newClientInfo = JSON.parse(JSON.stringify(client.clientInfo));
                const newAttachment: Attachment = {
                    id: `link-${new Date().getTime()}`,
                    name: name,
                    type: 'link',
                    data: url
                };
                
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
        updateClientInfoAnswer,
        addClientInfoQuestion,
        deleteClientInfoQuestion,
        addClientInfoAttachment,
        addClientInfoLink,
        deleteClientInfoAttachment,
        addChatSession,
        updateChatSession,
        deleteChatSession,
        updateClientDiagnosticSummary,
        addUser,
        updateUser,
        deleteUser,
        addJourney, importJourney, updateJourney, deleteJourney,
        addObjective, updateObjective, deleteObjective,
        addKeyResult, updateKeyResult, deleteKeyResult,
        addInitiative, updateInitiative, deleteInitiative,
        addAction, updateAction, deleteAction,
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
