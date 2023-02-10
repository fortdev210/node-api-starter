import * as dotenv from "dotenv";
// More info on Configuration Here: https://www.npmjs.com/package/winston
import * as winston from "winston";

// Attach .env variables to process.env
const env = process.env.NODE_ENV;
if (env !== "production") {
  dotenv.config();
}

// Logging levels in winston conform to the severity ordering specified by
// from most important to least important._
export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};

export const alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    colors: {
      info: "green", // Useful for system announcements + messages
      warn: "yellow", // NOT errors, but close
      verbose: "blue", // You're doing the most
      debug: "blue", // Debugging values (aka, console.log)
      error: "red", // Errors
    },
  }),
  winston.format.align(),
  winston.format.label({
    label: "[LOGGER]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  winston.format.printf((info) => {
    const { label, timestamp, level, message, ...args } = info;

    const ts = timestamp.slice(0, 19).replace("T", " ");
    return `${label}, ${ts} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
    }`;
  })
);

// Where are we sending the output to
// *note this will print to PaperTrail
export const configTransports = () => {
  // You can set/unset DEBUG as needed. Any value in DEBUG will be truthy here
  // This is required to avoid duplicate consoles
  const consoleLevel = process.env.DEBUG ? "debug" : "info";

  const transports = [
    new winston.transports.Console({ level: consoleLevel }),
    new winston.transports.File({
      level: "info",
      filename: "info.log",
    }),
    new winston.transports.File({
      level: "error",
      filename: "./src/errors/error.log",
    }),
  ];

  return transports;
};
