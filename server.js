const app = require("./app");

const PORT = process.env.PORT || 8000;
const LOCAL_IP = process.env.LOCAL_IP || "localhost";

app.get("/", (req, res) => {
  res.send("Hello, i am running fine");
});

app.listen(PORT, LOCAL_IP, () => {
  console.log(`Server running on http://${LOCAL_IP}:${PORT}`);
});
