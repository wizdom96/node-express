import { Knex } from "knex";
import winston from "winston";

interface Category {
  id?: number;
  name: string;
  description?: string;
}

export default class CategoryService {
  private knex: Knex;
  private logger: winston.Logger;
  private tableName: string = "categories";

  constructor({ knex, logger }: { knex: Knex; logger: winston.Logger }) {
    this.knex = knex;
    this.logger = logger;
  }

  async getAllCategories(): Promise<Category[]> {
    this.logger.info("Fetching all categories");
    return await this.knex(this.tableName).select("*");
  }

  async createCategory(data: Category): Promise<Category> {
    this.logger.info("Creating category", { name: data.name });
    const [id] = await this.knex(this.tableName).insert(data).returning("id");
    return await this.knex(this.tableName).where({ id }).first();
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    this.logger.info("Fetching category by ID", { id });
    return await this.knex(this.tableName).where({ id }).first();
  }

  async updateCategory(
    id: number,
    data: Partial<Category>
  ): Promise<Category | undefined> {
    this.logger.info("Updating category", { id, data });
    await this.knex(this.tableName).where({ id }).update(data);
    return await this.knex(this.tableName).where({ id }).first();
  }

  async deleteCategory(id: number): Promise<number> {
    this.logger.info("Deleting category", { id });
    return await this.knex(this.tableName).where({ id }).del();
  }

  async deleteAllCategories(): Promise<number> {
    this.logger.info("Deleting all categories");
    return await this.knex(this.tableName).del();
  }
}
