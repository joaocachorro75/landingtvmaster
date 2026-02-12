import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Plan, Lead, SiteContent, AppView } from '../types';
import { INITIAL_CONTENT, INITIAL_PLANS } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage if available, else use constants
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem('site_content');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with INITIAL_CONTENT to ensure new fields (like enableReseller, instructions) exist
        return { ...INITIAL_CONTENT, ...parsed };
      }
      return INITIAL_CONTENT;
    } catch (e) {
      console.error("Error parsing site_content", e);
      return INITIAL_CONTENT;
    }
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    try {
      const saved = localStorage.getItem('site_plans');
      return saved && saved !== "undefined" ? JSON.parse(saved) : INITIAL_PLANS;
    } catch (e) {
      console.error("Error parsing site_plans", e);
      return INITIAL_PLANS;
    }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('site_leads');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing site_leads", e);
      return [];
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Persistence effects
  useEffect(() => { localStorage.setItem('site_content', JSON.stringify(content)); }, [content]);
  useEffect(() => { localStorage.setItem('site_plans', JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem('site_leads', JSON.stringify(leads)); }, [leads]);

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);
  const setView = (view: AppView) => setCurrentView(view);

  const updateContent = (newContent: Partial<SiteContent>) => {
    setContent(prev => ({ ...prev, ...newContent }));
  };

  const updatePlan = (id: string, updatedPlan: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updatedPlan } : p));
  };

  const addPlan = (plan: Plan) => {
    setPlans(prev => [...prev, plan]);
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  // Helper to format phone to International Standard (specifically Brazil focus)
  const formatToInternational = (phone: string): string => {
    // 1. Remove non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // 2. Logic for Brazilian numbers
    // If length is 10 (Landline with DDD) or 11 (Mobile with DDD), assume it needs '55'
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      cleaned = '55' + cleaned;
    }
    
    // If it's already 12 or 13 (has 55), keep it.
    // Ideally, we return the clean numeric string. 
    return cleaned;
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'date'>) => {
    // Format the incoming number immediately
    const formattedWhatsapp = formatToInternational(leadData.whatsapp);

    // Check for duplicates using the formatted number
    const exists = leads.some(l => formatToInternational(l.whatsapp) === formattedWhatsapp);

    if (exists) {
      return false;
    }

    const newLead: Lead = {
      ...leadData,
      whatsapp: formattedWhatsapp, // Save the formatted version
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setLeads(prev => [newLead, ...prev]);
    return true;
  };

  const updateLead = (id: string, data: Partial<Lead>) => {
    let formattedWhatsapp = undefined;

    // If updating whatsapp, format and check duplicates
    if (data.whatsapp) {
      formattedWhatsapp = formatToInternational(data.whatsapp);
      
      const exists = leads.some(l => l.id !== id && formatToInternational(l.whatsapp) === formattedWhatsapp);
      if (exists) {
        return false;
      }
    }

    setLeads(prev => prev.map(l => l.id === id ? { 
      ...l, 
      ...data, 
      whatsapp: formattedWhatsapp || l.whatsapp // Use new formatted number if present, else keep old
    } : l));
    return true;
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

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
