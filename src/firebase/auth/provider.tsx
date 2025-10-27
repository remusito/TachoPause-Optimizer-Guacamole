'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type Auth,
  type User,
  type AuthError,
} from 'firebase/auth';
import { useFirebase } from '../provider';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAchievements } from '@/hooks/use-achievements-provider';
import { useDeveloperMode } from '@/hooks/use-developer-mode';

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<any>;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
  purchasePremium: () => Promise<void>;
  auth: Auth | null;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Generic error handler for login page
export const getAuthErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está en uso.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/weak-password':
            return 'La contraseña debe tener al menos 6 caracteres.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
             return 'Correo electrónico o contraseña incorrectos.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos. Inténtalo de nuevo más tarde.';
        case 'auth/popup-blocked':
            return 'La ventana emergente de inicio de sesión fue bloqueada por el navegador. Por favor, habilita las ventanas emergentes.';
        case 'auth/operation-not-allowed':
             return 'El inicio de sesión con este método no está habilitado.';
        case 'auth/cancelled-popup-request':
             return 'Se ha cancelado la petición de inicio de sesión.';
        case 'auth/popup-closed-by-user':
            return 'La ventana de inicio de sesión ha sido cerrada por el usuario.';
        case 'auth/unauthorized-domain':
            return 'Este dominio no está autorizado para el inicio de sesión con Google. Por favor, añádelo en la configuración de Firebase Authentication.';
        case 'auth/configuration-not-found':
            return 'La configuración de Firebase no es correcta. Contacta al soporte.'
        default:
            console.error('Auth error no manejado:', error.code);
            return 'Ha ocurrido un error inesperado.';
    }
}

// Provider component for authentication
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth, firestore } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();
  const { unlockAchievement } = useAchievements();
  const { isActive: isDeveloperModeActive } = useDeveloperMode();

  // Handle Firebase user state changes and check premium status
  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔵 onAuthStateChanged:', user?.email || 'No user');
      setUser(user);
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().premium === true) {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const signInWithGoogle = async () => {
    console.log('🔵 Iniciando signInWithGoogle...');
    if (!auth || !firestore) throw new Error('Firebase is not initialized');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('🔵 Abriendo popup de Google...');
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Login exitoso:', result.user.email);
      
      const user = result.user;
      const userRef = doc(firestore, "users", user.uid);
      
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        console.log('🔵 Creando usuario en Firestore...');
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            premium: false,
          },
          { merge: true }
        );
        console.log('✅ Usuario creado en Firestore');
      } else {
        console.log('✅ Usuario ya existe en Firestore');
      }
      
      toast({
        title: `¡Bienvenido, ${user.displayName || user.email}!`,
        description: "Has iniciado sesión correctamente.",
      });
    } catch (error) {
      console.error('❌ Error en signInWithGoogle:', error);
      const message = getAuthErrorMessage(error as AuthError);
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
      setUser(null);
      setIsPremium(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!auth || !firestore) throw new Error('Firebase is not initialized');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const userRef = doc(firestore, 'users', cred.user.uid);
    return setDoc(
      userRef,
      {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: null,
        photoURL: null,
        createdAt: new Date().toISOString(),
        premium: false,
      },
      { merge: true }
    );
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const purchasePremium = async () => {
    if (isDeveloperModeActive) {
        toast({ title: 'Modo Desarrollador Activo', description: 'Las funciones Premium ya están desbloqueadas.' });
        return;
    }
    if (!auth || !firestore || !user) {
      throw new Error('User not authenticated or Firebase not initialized.');
    }
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(
      userRef,
      {
        premium: true,
        fecha_pago: new Date().toISOString(),
      },
      { merge: true }
    );
    setIsPremium(true);
    unlockAchievement('premium_supporter');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPremium: isDeveloperModeActive || isPremium,
        signInWithGoogle,
        signOut,
        signUpWithEmail,
        signInWithEmail,
        purchasePremium,
        auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
