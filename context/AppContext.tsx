
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Plan, Lead, SiteContent, AppView } from '../types';
import { INITIAL_CONTENT, INITIAL_PLANS } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with Defaults
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isLoading, setIsLoading] = useState(true);

  // --- API INTERACTION ---

  // Load Data from Server on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const data = await res.json();
          
          // Merge server data with defaults to ensure type safety
          if (data.content && Object.keys(data.content).length > 0) {
            setContent(prev => ({ ...prev, ...data.content }));
          }
          if (data.plans && data.plans.length > 0) {
            setPlans(data.plans);
          }
          if (data.leads) {
            setLeads(data.leads);
          }
        }
      } catch (error) {
        console.error("Failed to load data from server", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save Config (Content & Plans) to Server
  const saveConfigToServer = async (newContent: SiteContent, newPlans: Plan[]) => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent, plans: newPlans })
      });
    } catch (error) {
      console.error("Failed to save config", error);
    }
  };

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);
  const setView = (view: AppView) => setCurrentView(view);

  const updateContent = (newContent: Partial<SiteContent>) => {
    setContent(prev => {
      const updated = { ...prev, ...newContent };
      saveConfigToServer(updated, plans); // Sync
      return updated;
    });
  };

  const updatePlan = (id: string, updatedPlan: Partial<Plan>) => {
    setPlans(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedPlan } : p);
      saveConfigToServer(content, updated); // Sync
      return updated;
    });
  };

  const addPlan = (plan: Plan) => {
    setPlans(prev => {
      const updated = [...prev, plan];
      saveConfigToServer(content, updated); // Sync
      return updated;
    });
  };

  const deletePlan = (id: string) => {
    setPlans(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveConfigToServer(content, updated); // Sync
      return updated;
    });
  };

  // Helper to format phone to International Standard
  const formatToInternational = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  };

  // Leads are handled differently (concurrent-safe-ish backend push)
  const addLead = (leadData: Omit<Lead, 'id' | 'date'>) => {
    const formattedWhatsapp = formatToInternational(leadData.whatsapp);
    
    // Optimistic check
    const exists = leads.some(l => formatToInternational(l.whatsapp) === formattedWhatsapp);
    if (exists) return false;

    const newLeadStub: Lead = {
      ...leadData,
      whatsapp: formattedWhatsapp,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };

    // Update Local immediately for UI feedback
    setLeads(prev => [newLeadStub, ...prev]);

    // Send to server
    fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadStub)
    }).catch(err => console.error("Error saving lead", err));

    return true;
  };

  const updateLead = (id: string, data: Partial<Lead>) => {
    let formattedWhatsapp = undefined;
    if (data.whatsapp) {
      formattedWhatsapp = formatToInternational(data.whatsapp);
      const exists = leads.some(l => l.id !== id && formatToInternational(l.whatsapp) === formattedWhatsapp);
      if (exists) return false;
    }

    const updatedData = { ...data };
    if (formattedWhatsapp) updatedData.whatsapp = formattedWhatsapp;

    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));

    fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'update', data: updatedData })
    }).catch(err => console.error("Error updating lead", err));

    return true;
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    
    fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' })
    }).catch(err => console.error("Error deleting lead", err));
  };

  if (isLoading) {
      // Optional: Return a loader component or just null
      return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;
  }

  return (
    <AppContext.Provider value={{
      plans,
      leads,
      content,
      isLoggedIn,
      currentView,
      setView,
      login,
      logout,
      updateContent,
      updatePlan,
      addPlan,
      deletePlan,
      addLead,
      updateLead,
      deleteLead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
