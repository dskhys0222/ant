export interface RegistrationData {
  username: string;
  password: string;
  host: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
  status?: number;
}
