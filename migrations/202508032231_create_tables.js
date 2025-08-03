exports.up = function (knex) {
  return knex.schema
    .createTable("categories", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.text("description");
    })
    .createTable("tutorials", function (table) {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.text("description");
      table.boolean("published").defaultTo(false);
      table.integer("category_id").unsigned().references("categories.id");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("tutorials")
    .dropTableIfExists("categories");
};
