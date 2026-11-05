import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/firebase';

export interface User {
  name: string;
  email: string;
  isVip: boolean;
}

const VIP_KEY = 'dz-edupro-vip';

/** VIP status is persisted per-email in localStorage (not in Firebase). */
function vipKey(email: string): string {
  return `${VIP_KEY}:${email}`;
}

function loadVip(email: string): boolean {
  try {
    return localStorage.getItem(vipKey(email)) === '1';
  } catch {
    return false;
  }
}

function saveVip(email: string, isVip: boolean): void {
  try {
    if (isVip) localStorage.setItem(vipKey(email), '1');
    else localStorage.removeItem(vipKey(email));
  } catch {
    /* ignore */
  }
}

/** Convert a Firebase user into the app's User shape. */
export function toAppUser(fbUser: FirebaseUser): User {
  return {
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'طالب',
    email: fbUser.email || '',
    isVip: fbUser.email ? loadVip(fbUser.email) : false,
  };
}

/** Subscribe to Firebase auth state changes. Returns an unsubscribe function. */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (fbUser) => {
    callback(fbUser ? toAppUser(fbUser) : null);
  });
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return toAppUser(cred.user);
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return toAppUser(cred.user);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/** Mark the current user as VIP (persisted in localStorage by email). */
export function setVip(email: string, isVip: boolean): void {
  saveVip(email, isVip);
}
