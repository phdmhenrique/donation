import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser, loginUser, completeRegistration } from "../api/auth";
import { apiUser } from "../api/axiosConfig";

interface ImageInfo {
  id: string;
  name: string;
  imageLink: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  profileImage: ImageInfo;
  landscapeImage: ImageInfo;
}

interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  firstAccess: boolean;
  isLoading: boolean;
  signup: (userData: SignupData) => Promise<void>;
  login: (loginData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  completeRegistrationProcess: (registrationData: any) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken") || null
  );
  const [firstAccess, setFirstAccess] = useState<boolean>(
    JSON.parse(localStorage.getItem("firstAccess") || "false")
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (["/", "/create-account"].includes(location.pathname)) {
      localStorage.clear();
    }
  }, [location.pathname]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          await checkAccess();
        } catch (error) {
          console.error("Erro ao inicializar acesso:", error);
          logout();
        }
      }
    };
    initializeAuth();
  }, [token]);

  const signup = async (userData: SignupData) => {
    try {
      const data = await registerUser(userData);
      setUser(data.user);
    } catch (error) {
      throw new Error((error as Error).message || "Erro ao tentar registrar novo usuário!");
    }
  };

  const completeRegistrationProcess = async (registrationData: any) => {
    try {
      await completeRegistration(registrationData, token);
      setFirstAccess(JSON.parse(localStorage.getItem("firstAccess") || "false"));
      await checkAccess();
    } catch (error) {
      throw new Error((error as Error).message || "Erro ao completar o registro!");
    }
  };

  const checkAccess = async () => {
    try {
      const accessResponse = await apiUser.checkAccess();
      const isFirstAccess = accessResponse.data.firstAccess;
      setFirstAccess(isFirstAccess);
      localStorage.setItem("firstAccess", JSON.stringify(isFirstAccess));
  
      if (isFirstAccess) {
        navigate("/create-account/stages");
      } else {
        const profileData = await apiUser.profile();
        setUser(profileData.data); // Definindo o usuário
        localStorage.setItem("user", JSON.stringify(profileData.data));
        navigate("/home");
      }
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);
    }
  };
  

  const login = async (loginData: { email: string; password: string }) => {
    try {
      const loginResponse = await loginUser(loginData);
      setToken(loginResponse.accessToken);
      localStorage.setItem("accessToken", loginResponse.accessToken);
  
      // Aguardar a resposta do perfil antes do checkAccess para definir o usuário
      const profileData = await apiUser.profile();
      setUser(profileData.data);
      localStorage.setItem("user", JSON.stringify(profileData.data));
  
      await checkAccess();
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };
  
  

  const logout = () => {
    setUser(null);
    setToken(null);
    setFirstAccess(false);
    localStorage.clear();
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        firstAccess,
        isLoading,
        signup,
        login,
        logout,
        completeRegistrationProcess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
