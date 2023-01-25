import * as winston from "winston";

import { alignColorsAndTime, configTransports, levels } from "./winston.config";

export const createWinstonLogger = () => {
  return winston.createLogger({
    levels: levels,
    format: winston.format.combine(alignColorsAndTime),
    transports: configTransports(),
  });
};

export default createWinstonLogger();
