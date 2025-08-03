import express, { Express } from "express";
import { createContainer, asClass, asValue } from "awilix";
import { Knex, knex } from "knex";
import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { Agenda } from "@hokify/agenda";
import tutorialRoutes from "./routes/tutorialRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import TutorialService from "./services/TutorialService";
import CategoryService from "./services/CategoryService";
import loggerMiddleware from "./middleware/loggerMiddleware";
import cleanupJobs from "./jobs/cleanupJobs";

dotenv.config();

const app: Express = express();
const container = createContainer({
  injectionMode: "PROXY",
  strict: true,
});

app.use(express.json());

const knexConfig = {
  client: "sqlite3",
  connection: {
    filename: process.env.SQLITE_FILENAME || "",
  },
  useNullAsDefault: true,
};

const knexInstance: Knex = knex(knexConfig);

container.register({
  tutorialService: asClass(TutorialService).singleton(),
  categoryService: asClass(CategoryService).singleton(),
  knex: asValue(knexInstance),
});

app.use(loggerMiddleware(container));

app.use("/api/tutorials", tutorialRoutes(container));
app.use("/api/categories", categoryRoutes(container));

app.get("/", (req, res) => res.send("Node.js"));

async function connectWithRetry(
  client: MongoClient,
  retries: number = 10,
  delay: number = 3000
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await client.connect();
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      container
        .resolve("logger")
        .info(`Retrying MongoDB connection (${i + 1}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

(async () => {
  try {
    await knexInstance.raw("SELECT 1");
    container.resolve("logger").info("Database connection successful");

    await knexInstance.migrate.latest();
    container
      .resolve("logger")
      .info("Database migrations completed successfully");

    const mongoConnectionString = process.env.MONGO_CONNECTION || "";
    const mongoClient = new MongoClient(mongoConnectionString);
    await connectWithRetry(mongoClient);
    container.resolve("logger").info("MongoDB connection successful");
    const agenda = new Agenda({
      mongo: mongoClient.db("agenda") as any,
      processEvery: "5 minutes",
      maxConcurrency: 5,
    });

    cleanupJobs(agenda, container);

    await agenda.start();
    container.resolve("logger").info("Agenda job scheduler started");

    await agenda.every("24 hours", "delete unpublished tutorials");
    container
      .resolve("logger")
      .info("Scheduled job: delete unpublished tutorials every 24 hours");

    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => {
      container.resolve("logger").info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err: any) {
    container
      .resolve("logger")
      .error("Database connection, migration, or Agenda setup failed", {
        error: err.message,
        stack: err.stack,
      });
    console.error(
      "Database connection, migration, or Agenda setup failed",
      err
    );
    process.exit(1);
  }
})();
