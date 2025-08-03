module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: process.env.SQLITE_FILENAME || "",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },
};
