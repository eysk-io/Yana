use Mix.Config

# Configure your database
config :life_saver, LifeSaver.Repo,
  username: "postgres",
  password: "postgres",
  database: "life_saver_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :life_saver, LifeSaverWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn
