// UserContext.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type IUserRecord = {
  uid?: string;
  email?: string;
  displayName?: string;
  avatar?: string;
};

interface UserContextType {
  user: IUserRecord | null;
  loginUser: (userData: IUserRecord) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: IUserRecord | null;
}) => {
  const [user, setUser] = useState<IUserRecord | null>(initialUser);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  const loginUser = (userData: IUserRecord) => {
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
