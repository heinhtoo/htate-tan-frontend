export type CustomSession = {
  accessToken: string;
  user: {
    isRootUser: boolean;
    isOwner: boolean;
  };
};

export type CustomToken = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
};
