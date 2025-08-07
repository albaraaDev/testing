type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Use Vite's built-in env variable
const getDefaultLogLevel = (): LogLevel => {
  const mode = import.meta.env.MODE;
  return mode === 'development' ? 'debug' : 'warn';
};

let currentLevel: LogLevel = getDefaultLogLevel();

const setLogLevel = (level: LogLevel): void => {
  if (levels.includes(level)) {
    currentLevel = level;
  } else {
    console.warn(`[Logger] Invalid log level: ${level}`);
  }
};

const shouldLog = (level: LogLevel): boolean => {
  return logLevelPriority[level] >= logLevelPriority[currentLevel];
};

const logger = {
  setLevel: setLogLevel,

  debug: (...args: unknown[]): void => {
    if (shouldLog('debug')) console.debug('[DEBUG]', ...args);
  },

  info: (...args: unknown[]): void => {
    if (shouldLog('info')) console.info('[INFO]', ...args);
  },

  warn: (...args: unknown[]): void => {
    if (shouldLog('warn')) console.warn('[WARN]', ...args);
  },

  error: (...args: unknown[]): void => {
    if (shouldLog('error')) console.error('[ERROR]', ...args);
  }
};

export default logger;
