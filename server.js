const app = require("./app");

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hello, i am running fine");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
