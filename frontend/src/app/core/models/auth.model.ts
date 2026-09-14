// Modelos para autenticacion y decodificacion de tokens JWT de Azure AD

export interface DecodedTokenClaims {
  aud?: string;
  iss?: string;
  iat?: number;
  nbf?: number;
  exp?: number;
  sub?: string;
  oid?: string;
  tid?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  roles?: string[];
  scp?: string;
  [key: string]: unknown;
}

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  tenantId: string;
  roles: string[];
  scopes: string[];
  isAuthenticated: boolean;
  isMockMode: boolean;
  rawToken?: string;
  tokenExpiration?: Date;
}

export interface TokenInspectionData {
  header: Record<string, unknown>;
  payload: DecodedTokenClaims;
  signature: string;
  rawToken: string;
  isValid: boolean;
  isExpired: boolean;
  expiresInSeconds: number;
  roles: string[];
  scopes: string[];
  audience: string;
  issuer: string;
}
