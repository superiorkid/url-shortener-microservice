require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const validUrl = require("valid-url");
const axios = require("axios");
const urls = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;
  const q = urls.parse(url, true);
  const protocol = q.protocol.slice(0, q.protocol.length - 1);
  console.log(protocol);

  if (!validUrl.isUri(url) || protocol !== "https") {
    res.json({
      error: "invalid url",
    });
  }

  let randomNumber = Math.floor(Math.random() * 10000 + 1);
  try {
    axios
      .post("http://localhost:3001/urls", {
        short_url: randomNumber,
        original_url: url,
      })
      .then((r) => {
        res.json(r.data);
      });
  } catch (error) {
    res.json({
      message: "error",
    });
  }
});

app.get("/api/shorturl/:shortUrl", async (req, res) => {
  await axios.get("http://localhost:3001/urls").then((r) => {
    const datas = r.data.find((url) => {
      return url.short_url === Number(req.params.shortUrl);
    });

    res.redirect(datas.original_url);
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
