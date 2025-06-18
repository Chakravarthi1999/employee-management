"use client";

import axios from "axios";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import getApiUrl from "@/constants/endpoints";
import ConfirmModal from "@/components/ui/confirmModal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  type: string;
  dob: string;
  image: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (userData: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          toast.error("Login session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          router.push("/");
        }
        return Promise.reject(error);
      }
    );

    const initializeAuth = async () => {
      const id = localStorage.getItem("userId");
      const storedToken = localStorage.getItem("token");

      if (id && storedToken) {
        try {
          const res = await axios.get(`${getApiUrl("getbyid")}/${id}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (res.data && res.data.length > 0) {
            setUser(res.data[0]);
            setToken(storedToken);
          }
        } catch (error) {
          console.log("Auth initialization error:", error);
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
        }
      }

      setLoading(false);
    };

    initializeAuth();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("userId", String(userData.id));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setShowLogoutModal(true);
    setPendingLogout(true);
  };

  const confirmLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    setPendingLogout(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, login, logout, loading }}
    >
      {children}

      {showLogoutModal && (
        <ConfirmModal
          message="Are you sure you want to logout?"
          onConfirm={confirmLogout}
          onCancel={() => {
            setShowLogoutModal(false);
            setPendingLogout(false);
          }}
        />
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
