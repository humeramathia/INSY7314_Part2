require("dotenv").config();

const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, () => {
  console.log(`HustleHub+ API listening on port ${PORT}`);
});
