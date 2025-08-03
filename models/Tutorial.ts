import { Knex } from "knex";

export default function (knex: Knex) {
  return {
    tableName: "tutorials",
    schema: (table: Knex.CreateTableBuilder) => {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.text("description");
      table.boolean("published").defaultTo(false);
      table.integer("category_id").unsigned().references("categories.id");
    },
  };
}
