export interface Env {
  mongoConnectionUrl: string;
}

export const env: () => Env = () => ({
  mongoConnectionUrl: process.env.MONGO_CONNECTION_URL ?? '',
});
