import knex from "knex";
import winston from "winston";
import TutorialService from "../services/TutorialService";
import CategoryService from "../services/CategoryService";

async function main() {
  console.log("Starting delete unpublished tutorials...");

  const db = knex({
    client: "sqlite3",
    connection: {
      filename: process.env.SQLITE_FILENAME || "",
    },
    useNullAsDefault: true,
  });

  const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
  });

  try {
    const categoryService = new CategoryService({ knex: db, logger });
    const tutorialService = new TutorialService({
      knex: db,
      logger,
      categoryService,
    });

    console.log("Checking unpublished tutorials...");

    const unpublishedTutorials = await db("tutorials").where({ published: 0 });
    console.log(`Found ${unpublishedTutorials.length} unpublished tutorials`);

    if (unpublishedTutorials.length === 0) {
      console.log("ℹNo unpublished tutorials to delete");
      await db.destroy();
      process.exit(0);
    }

    const deletedCount = await tutorialService.deleteUnpublishedTutorials();
    console.log(`Deleted ${deletedCount} unpublished tutorials`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.destroy();
  }

  process.exit(0);
}

main().catch(console.error);
