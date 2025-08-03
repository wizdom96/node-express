import express, { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AwilixContainer } from "awilix";
import CategoryService from "../services/CategoryService";
import winston from "winston";

export default function (container: AwilixContainer): Router {
  const router: Router = express.Router();
  const categoryService: CategoryService = container.resolve("categoryService");
  const logger: winston.Logger = container.resolve("logger");

  const categoryValidation = [
    body("name")
      .isString()
      .notEmpty()
      .withMessage("Name is required and must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
  ];

  router.get("/", async (req: Request, res: Response) => {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (err: any) {
      logger.error("Error fetching categories", { error: err.message });
      res.status(500).json({ message: err.message });
    }
  });

  router.post("/", categoryValidation, async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (err: any) {
      logger.error("Error creating category", { error: err.message });
      res.status(400).json({ message: err.message });
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const category = await categoryService.getCategoryById(
        Number(req.params.id)
      );
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (err: any) {
      logger.error("Error fetching category by ID", {
        error: err.message,
        id: req.params.id,
      });
      res.status(500).json({ message: err.message });
    }
  });

  router.put(
    "/:id",
    categoryValidation,
    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const category = await categoryService.updateCategory(
          Number(req.params.id),
          req.body
        );
        if (!category)
          return res.status(404).json({ message: "Category not found" });
        res.json(category);
      } catch (err: any) {
        logger.error("Error updating category", {
          error: err.message,
          id: req.params.id,
        });
        res.status(400).json({ message: err.message });
      }
    }
  );

  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const result = await categoryService.deleteCategory(
        Number(req.params.id)
      );
      if (!result)
        return res.status(404).json({ message: "Category not found" });
      res.json({ message: "Category deleted" });
    } catch (err: any) {
      logger.error("Error deleting category", {
        error: err.message,
        id: req.params.id,
      });
      res.status(500).json({ message: err.message });
    }
  });

  router.delete("/", async (req: Request, res: Response) => {
    try {
      await categoryService.deleteAllCategories();
      res.json({ message: "All categories deleted" });
    } catch (err: any) {
      logger.error("Error deleting all categories", { error: err.message });
      res.status(500).json({ message: err.message });
    }
  });

  return router;
}
