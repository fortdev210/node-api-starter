import { cleanEnv, port, str } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    DB_HOST: str(),
    DB_PORT: port(),
    POSTGRES_USER: str(),
    POSTGRES_PASSWORD: str(),
    POSTGRES_DB: str(),
  });
};

export default validateEnv;
