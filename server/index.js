const test = require("dotenv").config();
const express = require("express");
const querystring = require("node:querystring");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const port = 3000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = "http://localhost:3000/callback";

const app = express();
//look into this more, it no longer logs out sessionID if you disable app folder?
// app.use(express.static("app"));
app.use(cookieParser(`${process.env.COOKIE_SECRET}`));

app.get("/", (req, res) => {
  res.cookie("access_token", "random access", { signed: true });
  let test = req.signedCookies;
  console.log(test);
  res.send("hello world");
});

app.get("/login", (req, res) => {
  let state = crypto.randomBytes(16).toString("hex");
  let scope = "user-read-private user-read-email";
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

app.get("/callback", async (req, res) => {
  let code = req.query.code;
  let state = req.query.state;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  const response = await fetch(authOptions.url, {
    headers: authOptions.headers,
    method: "POST",
    body: new URLSearchParams(authOptions.form),
  });
  const result = await response.json();
  const access_token = result.access_token;
  const refresh_token = result.refresh_token;

  if (access_token) {
    const data = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const profile = await data.json();
    console.log(profile);
  }

  res.send("authenticated successfully");
});

app.get("/api", (req, res) => {
  res.send({ data: "my api info" });
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
