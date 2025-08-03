import express, { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AwilixContainer } from "awilix";
import TutorialService from "../services/TutorialService";
import winston from "winston";

export default function (container: AwilixContainer): Router {
  const router: Router = express.Router();
  const tutorialService: TutorialService = container.resolve("tutorialService");
  const logger: winston.Logger = container.resolve("logger");

  const tutorialValidation = [
    body("title")
      .isString()
      .notEmpty()
      .withMessage("Title is required and must be a string"),
    body("published")
      .optional()
      .isBoolean()
      .withMessage("Published must be a boolean"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("category_id")
      .optional()
      .isInt()
      .withMessage("Category ID must be an integer"),
  ];

  router.get("/", async (req: Request, res: Response) => {
    try {
      const tutorials = await tutorialService.getAllTutorials();
      res.json(tutorials);
    } catch (err: any) {
      logger.error("Error fetching tutorials", { error: err.message });
      res.status(500).json({ message: err.message });
    }
  });

  router.post("/", tutorialValidation, async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const tutorial = await tutorialService.createTutorial(req.body);
      res.status(201).json(tutorial);
    } catch (err: any) {
      logger.error("Error creating tutorial", { error: err.message });
      res.status(400).json({ message: err.message });
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const tutorial = await tutorialService.getTutorialById(
        Number(req.params.id)
      );
      if (!tutorial)
        return res.status(404).json({ message: "Tutorial not found" });
      res.json(tutorial);
    } catch (err: any) {
      logger.error("Error fetching tutorial by ID", {
        error: err.message,
        id: req.params.id,
      });
      res.status(500).json({ message: err.message });
    }
  });

  router.put(
    "/:id",
    tutorialValidation,
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const tutorial = await tutorialService.updateTutorial(
          Number(req.params.id),
          req.body
        );
        if (!tutorial)
          return res.status(404).json({ message: "Tutorial not found" });
        res.json(tutorial);
      } catch (err: any) {
        logger.error("Error updating tutorial", {
          error: err.message,
          id: req.params.id,
        });
        res.status(400).json({ message: err.message });
      }
    }
  );

  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const result = await tutorialService.deleteTutorial(
        Number(req.params.id)
      );
      if (!result)
        return res.status(404).json({ message: "Tutorial not found" });
      res.json({ message: "Tutorial deleted" });
    } catch (err: any) {
      logger.error("Error deleting tutorial", {
        error: err.message,
        id: req.params.id,
      });
      res.status(500).json({ message: err.message });
    }
  });

  router.delete("/", async (req: Request, res: Response) => {
    try {
      await tutorialService.deleteAllTutorials();
      res.json({ message: "All tutorials deleted" });
    } catch (err: any) {
      logger.error("Error deleting all tutorials", { error: err.message });
      res.status(500).json({ message: err.message });
    }
  });

  return router;
}
