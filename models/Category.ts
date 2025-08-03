import { Knex } from "knex";

export default function (knex: Knex) {
  return {
    tableName: "categories",
    schema: (table: Knex.CreateTableBuilder) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.text("description");
    },
  };
}
