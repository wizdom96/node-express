import { Knex } from "knex";
import winston from "winston";
import CategoryService from "./CategoryService";

interface Tutorial {
  id?: number;
  title: string;
  description?: string;
  published?: boolean;
  category_id?: number;
}

export default class TutorialService {
  private knex: Knex;
  private logger: winston.Logger;
  private categoryService: CategoryService;
  private tableName: string = "tutorials";

  constructor({
    knex,
    logger,
    categoryService,
  }: {
    knex: Knex;
    logger: winston.Logger;
    categoryService: CategoryService;
  }) {
    this.knex = knex;
    this.logger = logger;
    this.categoryService = categoryService;
  }

  async validateCategoryId(categoryId?: number): Promise<void> {
    if (categoryId) {
      const category = await this.categoryService.getCategoryById(categoryId);
      if (!category) {
        throw new Error(`Category with ID ${categoryId} does not exist`);
      }
    }
  }

  async getAllTutorials(): Promise<Tutorial[]> {
    this.logger.info("Fetching all tutorials");
    return await this.knex(this.tableName).select("*");
  }

  async createTutorial(data: Tutorial): Promise<Tutorial> {
    this.logger.info("Creating tutorial", { title: data.title });
    await this.validateCategoryId(data.category_id);
    const [id] = await this.knex(this.tableName).insert(data).returning("id");
    return await this.knex(this.tableName).where({ id }).first();
  }

  async getTutorialById(id: number): Promise<Tutorial | undefined> {
    this.logger.info("Fetching tutorial by ID", { id });
    return await this.knex(this.tableName).where({ id }).first();
  }

  async updateTutorial(
    id: number,
    data: Partial<Tutorial>
  ): Promise<Tutorial | undefined> {
    this.logger.info("Updating tutorial", { id, data });
    await this.validateCategoryId(data.category_id);
    await this.knex(this.tableName).where({ id }).update(data);
    return await this.knex(this.tableName).where({ id }).first();
  }

  async deleteTutorial(id: number): Promise<number> {
    this.logger.info("Deleting tutorial", { id });
    return await this.knex(this.tableName).where({ id }).del();
  }

  async deleteAllTutorials(): Promise<number> {
    this.logger.info("Deleting all tutorials");
    return await this.knex(this.tableName).del();
  }

  async deleteUnpublishedTutorials(): Promise<number> {
    this.logger.info("Deleting all unpublished tutorials");
    return await this.knex(this.tableName)
      .where({ published: 0 })
      .orWhere({ published: false })
      .del();
  }
}
