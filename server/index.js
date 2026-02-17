require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");

const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// -----------------------------
// App Info
// -----------------------------
const APP_NAME = process.env.APP_NAME || "Application";
const APP_VERSION = process.env.APP_VERSION || "1.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;

// -----------------------------
// Security Middlewares
// -----------------------------
app.use(helmet());

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

app.use(limiter);

// -----------------------------
// Bootstrap Application
// -----------------------------
const startServer = async () => {
  try {
    const dbConnection = await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log("\n==================================================");
      console.log(`🚀 ${APP_NAME} Started Successfully`);
      console.log("==================================================");
      console.log(`📦 Version       : v${APP_VERSION}`);
      console.log(`🌍 Environment   : ${NODE_ENV}`);
      console.log(`🗄️  Database     :  ${dbConnection.connection.host}`);
      console.log(`🗄️  Database     :  ✅ Connected Successfully`);
      console.log(`🔗 Base URL      : http://localhost:${PORT}`);
      console.log(`📡 API Base      : http://localhost:${PORT}/api/v${APP_VERSION}`);
      console.log("==================================================\n");
    });

    // Graceful Shutdown
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
