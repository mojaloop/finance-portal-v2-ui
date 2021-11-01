export interface LoggedUser {
  id: string;
  active: boolean;
  expires_at: string;
  authenticated_at: string;
  issued_at: string;
  identity: {
    id: string;
    schema_id: string;
    schema_url: string;
    state: string;
    state_changed_at: string;
    traits: {
      name: {
        last: string;
        first: string;
      };
      role: string;
      email: string;
    };
    recovery_addresses: [
      {
        id: string;
        value: string;
        via: string;
      },
    ];
  };
}

export interface AuthState {
  isAuthPending: boolean;
  isLoggedIn: boolean;
  authError: null | string;
  user?: LoggedUser;
}

export interface AuthAppProps {
  onLogoutClick: () => void;
  userEmail?: string;
}
