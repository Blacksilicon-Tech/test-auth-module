export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres", // changed
    password: process.env.DB_PASS || "password", // changed
    database: process.env.DB_NAME || "auth_db" // changed
  },

  jwt: {
    secret: process.env.JWT_SECRET || "dev_only_secret_change_me",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  },

  security: {
    otpExpiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES || "10", 10),
    lockoutThreshold: parseInt(process.env.LOCKOUT_THRESHOLD || "3", 10),
    lockoutMinutes: parseInt(process.env.LOCKOUT_MINUTES || "15", 10)
  },

  mail: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || "no-reply@example.com",
    logOnly: (process.env.MAIL_LOG_ONLY || "true").toLowerCase() === "true"
  }
});