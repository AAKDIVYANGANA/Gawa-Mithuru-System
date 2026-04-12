import { useContext } from 'react';
import { AuthContext } from './createAuthContext';

export function useAuth() {
  return useContext(AuthContext);
}
