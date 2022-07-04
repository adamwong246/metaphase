export type IUser = {
  username: string;
}

export type IGameSession = {
  uid: string;
}

export type IInjections = { src?: string, content: string };

export type IAccount = {
  userid: string;
  username: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
};