"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getAccountsByUser, Account } from "@/lib/accounts";

interface UserData {
  sliqId: string;
  email: string;
  name: string;
  initials: string;
  userId?: string; // Add userId to fetch accounts
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updateUser: (updates: Partial<UserData>) => void;
  clearUser: () => void;
  account: Account | null;
  balance: number;
  isLoadingAccount: boolean;
  refreshAccount: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingAccount, setIsLoadingAccount] = useState<boolean>(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("sliqpay_user");
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("sliqpay_user");
      }
    }
  }, []);

  // Fetch account balance from backend - memoized to prevent infinite loops
  const refreshAccount = useCallback(async () => {
    if (!user?.userId) return;
    
    setIsLoadingAccount(true);
    try {
      const { accounts } = await getAccountsByUser(user.userId);
      if (accounts && accounts.length > 0) {
        // Get the NGN account (or first account)
        const ngnAccount = accounts.find(acc => acc.currency === 'NGN') || accounts[0];
        setAccount(ngnAccount);
        setBalance(ngnAccount.balance);
      }
    } catch (error) {
      console.error("Failed to fetch account balance:", error);
      // Set default balance if API fails
      setBalance(25000);
    } finally {
      setIsLoadingAccount(false);
    }
  }, [user?.userId]);

  // Fetch account when user is set
  useEffect(() => {
    if (user?.userId) {
      refreshAccount();
    }
  }, [user?.userId, refreshAccount]);

  // Sync user data to localStorage whenever it changes
  const setUser = (userData: UserData | null) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem("sliqpay_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("sliqpay_user");
    }
  };

  // Update specific fields of user data
  const updateUser = (updates: Partial<UserData>) => {
    setUserState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem("sliqpay_user", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear user data (for logout)
  const clearUser = () => {
    setUserState(null);
    setAccount(null);
    setBalance(0);
    localStorage.removeItem("sliqpay_user");
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      updateUser, 
      clearUser,
      account,
      balance,
      isLoadingAccount,
      refreshAccount
    } as UserContextType}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
