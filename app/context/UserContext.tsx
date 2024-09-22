// UserContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

import { IAuthUser } from "~/hooks/useFirestore";

interface UserContextType {
  user: IAuthUser | null;
  loginUser: (userData: IAuthUser) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IAuthUser | null>(null);

  const loginUser = (userData: IAuthUser) => {
    setUser(userData);
  };

  const logoutUser = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the UserContext
// example: const { user, loginUser, logoutUser } = useUser();
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
