import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mySecretKey from "./secret.js";

const users = [
  // fake db
  { id: 1, email: "todd@bocacode.com", password: "abc123" },
  { id: 2, email: "damian@bocacode.com", password: "def256" },
  { id: 3, email: "vitoria@bocacode.com", password: "ghi789" },
];

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // check to seeif that email and password exist in our db
  // if they do, create and send back a token
  // if they don't, send back an error message
  let user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user) {
    res.status(401).send("Invalid email and password");
    return;
  }
  user.password = undefined; // remove password from the user object
  // now we want to create and sign a token...
  const token = jwt.sign(user, mySecretKey, { expiresIn: "1d" });
  res.send(token);
});
app.get("/public", (req, res) => {
  res.send("Welcome!"); // anyone can see this
  app.get("/private", (req, res) => {
    //let's require a valid token to see this
    const token = req.headers.authorization || "";
    if (!token) {
      res.status(401).send("You must be logged in to see this");
      return;
    }
    jwt.verify(token, mySecretKey, (err, decoded) => {
      if (err) {
        res.status(401).send("You must be logged in to see this");
        return;
      }
      // here we know that token is valid...
      res.send(`Welcome ${decoded.email}!`);
    });
  });
});

export const myApi = functions.https.onRequest(app);
