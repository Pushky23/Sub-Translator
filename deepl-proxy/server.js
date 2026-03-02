const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;

const DEEPL_API_KEY = "000000000000000000000000"; // Replace with your DeepL API key

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

app.post("/translate", async (req, res) => {
  const text = req.body.text;
  const targetLang = req.body.target_lang || "PT-PT";

  console.log("Received text for translation:", text); // Debugging
  console.log("Target language:", targetLang); // Debugging

  try {
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      body: new URLSearchParams({
        text: text,
        target_lang: targetLang,
      }),
    });

    const data = await response.json();
    console.log("Translation response from DeepL:", data); // Debugging
    res.json(data);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
