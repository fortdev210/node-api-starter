import { cleanEnv, port, str, email } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    DB_HOST: str(),
    DB_PORT: port(),
    POSTGRES_USER: str(),
    POSTGRES_PASSWORD: str(),
    POSTGRES_DB: str(),
    SENDGRID_API_KEY: str(),
    SENDGRID_EMAIL: email(),
  });
};

export default validateEnv;
