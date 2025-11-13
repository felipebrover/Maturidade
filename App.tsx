import React, { useState, useCallback, useEffect, createContext, useContext, useMemo } from 'react';
import type { Client, PillarScores, Assessment } from './types';
import { calculateOverallMaturity } from './utils';
import { DUMMY_CLIENTS_DATA, PILLARS, INITIAL_PILLAR_SCORE } from './constants';
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
        };
        const updatedClients = [...clients, newClient];
        persistClients(updatedClients);
        persistActiveClient(newClient.id);
    }, [clients, persistClients, persistActiveClient]);

    const activeClient = useMemo(() => {
        const client = clients.find(c => c.id === activeClientId) || null;
        if (!client) {
            return null;
        }

        // Return a client object with validated assessments to prevent crashes from malformed data in localStorage
        return {
            ...client,
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
            })
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
        activeClient
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