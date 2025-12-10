export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type MessageResponse = {
  message: string;
};
