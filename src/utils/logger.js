const isProduction = process.env.NODE_ENV === "production";

function formatMessage(level, message, meta = {}) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  });
}

export function logger(level, message, meta) {
  const text = formatMessage(level, message, meta);

  if (level === "error") {
    console.error(text);
    return;
  }

  if (isProduction) {
    console.log(text);
    return;
  }

  console.log(text);
}

export const logInfo = (message, meta) => logger("info", message, meta);
export const logWarn = (message, meta) => logger("warn", message, meta);
export const logError = (message, meta) => logger("error", message, meta);
