const { Ignitor } = require("@adonisjs/ignitor");

new Ignitor(require("@adonisjs/fold"))
  .appRoot(__dirname + "/../")
  .fireHttpServer()
  .then(() => console.log("Server started for testing"))
  .catch(console.error);
