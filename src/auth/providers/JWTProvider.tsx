import { axios } from '@/api/axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState
} from 'react';
import { useQueryClient } from '@tanstack/react-query';

import * as authHelper from '../_helpers';
import { type AuthModel } from '@/auth';
import { ResponseModel } from '@/api/response';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { UserModel } from '@/api/user';

export const LOGIN_URL = `/login`;
export const REGISTER_URL = `/register`;
export const FORGOT_PASSWORD_URL = `/forgot-password`;
export const RESET_PASSWORD_URL = `/reset-password`;

interface AuthContextProps {
  isLoading: boolean;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  register: (email: string, password: string, password_confirmation: string) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const queryClient = useQueryClient();

  // Use our custom hook
  const { data: currentUserData, refetch } = useCurrentUser();

  const verify = async () => {
    if (auth) {
      try {
        if (currentUserData) {
          setCurrentUser(currentUserData);
        }
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  useEffect(() => {
    verify().finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic token expiration check
  useEffect(() => {
    if (!auth) return;

    // Check token expiration every minute
    const interval = setInterval(() => {
      const currentAuth = authHelper.getAuth();
      if (!currentAuth && auth) {
        // Token was removed due to expiration in getAuth
        setAuth(undefined);
        setCurrentUser(undefined);
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [auth, queryClient]);

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
      // Invalidate queries when logging out
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const { data: auth } = await axios.post<ResponseModel<AuthModel>>(LOGIN_URL, {
        username,
        password
      });
      saveAuth(auth.result);
      // Fetch user data after login
      const result = await refetch();
      if (result.data) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const register = async (email: string, password: string, password_confirmation: string) => {
    try {
      const { data: auth } = await axios.post(REGISTER_URL, {
        email,
        password,
        password_confirmation
      });
      saveAuth(auth);
      // Fetch user data after registration
      const result = await refetch();
      if (result.data) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    await axios.post(FORGOT_PASSWORD_URL, {
      email
    });
  };

  const changePassword = async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation
    });
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading: loading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        requestPasswordResetLink,
        changePassword,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
