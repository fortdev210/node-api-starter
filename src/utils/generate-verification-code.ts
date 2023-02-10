export const generateVerificationCode = (): string => {
  return Math.random().toString(36).slice(-6);
};
