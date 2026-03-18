const express = require("express");
const session = require("express-session");
const svgCaptcha = require("svg-captcha");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: true
}));

// Generate captcha
function generateCaptcha(req, key) {
  const captcha = svgCaptcha.create();
  req.session[key] = captcha.text;
  return captcha.data;
}

// Home page
app.get("/", (req, res) => {
  const captcha1 = generateCaptcha(req, "captcha1");
  const captcha2 = generateCaptcha(req, "captcha2");

  res.send(`
    <h2>Verify you're human</h2>
    <form method="POST" action="/verify">
      <div>
        <p>Captcha 1:</p>
        ${captcha1}
        <input name="captcha1" required />
      </div>

      <div>
        <p>Captcha 2:</p>
        ${captcha2}
        <input name="captcha2" required />
      </div>

      <button type="submit">Verify</button>
    </form>
  `);
});

// Verify captchas
app.post("/verify", (req, res) => {
  const { captcha1, captcha2 } = req.body;

  if (
    captcha1 === req.session.captcha1 &&
    captcha2 === req.session.captcha2
  ) {
    return res.send("<h1>✅ Verified! You're human.</h1>");
  }

  res.send("<h1>❌ Failed CAPTCHA. Try again.</h1><a href='/'>Retry</a>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
