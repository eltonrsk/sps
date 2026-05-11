type StoredUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'parent' | 'teacher' | 'security';
  phone_number?: string;
  is_active: boolean;
};

const TOKEN_KEY = 'authToken';
const PROFILE_KEY = 'userProfile';

let inMemoryToken: string | null = null;
let inMemoryUser: StoredUser | null = null;

const readUserFromSession = (): StoredUser | null => {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
};

export const authStorage = {
  setAuth(token: string, user: StoredUser) {
    inMemoryToken = token;
    inMemoryUser = user;
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  },

  clearAuth() {
    inMemoryToken = null;
    inMemoryUser = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
  },

  getToken() {
    if (inMemoryToken) {
      return inMemoryToken;
    }
    const token = sessionStorage.getItem(TOKEN_KEY);
    inMemoryToken = token;
    return token;
  },

  getUser() {
    if (inMemoryUser) {
      return inMemoryUser;
    }
    const user = readUserFromSession();
    inMemoryUser = user;
    return user;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
