import express from "express";
import registerRoute from "./routes/register.route.js";
import loginRoute from "./routes/login.route.js";
import usersRoute from "./routes/users.route.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", (_req, res) => res.json({ ok: true, service: "pbkdf2-api" }));


app.use("/register", registerRoute); // POST /register
app.use("/login",    loginRoute);    // POST /login
app.use("/users",    usersRoute);    // GET/DELETE /users, GET /users/full

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API PBKDF2 escuchando en http://localhost:${PORT}`));


