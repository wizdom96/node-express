module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: process.env.SQLITE_FILENAME || "./tutorials.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },
};
