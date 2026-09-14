import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminConfig {
  simulatedTime: Date | null;
  ignoreStoreStatus: boolean;
  ignoreDeliveryRule: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  adminConfig: AdminConfig;
  setAdminConfig: React.Dispatch<React.SetStateAction<AdminConfig>>;
}

const DEV_PIN = '123456';
const AUTH_KEY = 'vaguinho_dev_auth';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const ADMIN_CONFIG_KEY = 'vaguinho_admin_config';

  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => {
    const saved = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          simulatedTime: parsed.simulatedTime ? new Date(parsed.simulatedTime) : null,
          ignoreStoreStatus: !!parsed.ignoreStoreStatus,
          ignoreDeliveryRule: !!parsed.ignoreDeliveryRule,
        };
      } catch (e) {
        console.error('Error parsing saved admin config', e);
      }
    }
    return {
      simulatedTime: null,
      ignoreStoreStatus: false,
      ignoreDeliveryRule: false,
    };
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify({
      simulatedTime: adminConfig.simulatedTime ? adminConfig.simulatedTime.toISOString() : null,
      ignoreStoreStatus: adminConfig.ignoreStoreStatus,
      ignoreDeliveryRule: adminConfig.ignoreDeliveryRule,
    }));
  }, [adminConfig]);

  const login = (pin: string): boolean => {
    if (pin.trim() === DEV_PIN) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setAdminConfig({ simulatedTime: null, ignoreStoreStatus: false, ignoreDeliveryRule: false });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, adminConfig, setAdminConfig }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
