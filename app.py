from flask import Flask

app = Flask(__name__)


HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello, World!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      height: 100%;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      overflow: hidden;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }

    @keyframes gradient {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .card {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 24px;
      padding: 64px 80px;
      text-align: center;
      color: #fff;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-14px); }
    }

    .wave {
      display: inline-block;
      font-size: 5rem;
      animation: wave 2.2s ease-in-out infinite;
      transform-origin: 70% 70%;
    }

    @keyframes wave {
      0%, 60%, 100% { transform: rotate(0deg); }
      10%           { transform: rotate(14deg); }
      20%           { transform: rotate(-8deg); }
      30%           { transform: rotate(14deg); }
      40%           { transform: rotate(-4deg); }
      50%           { transform: rotate(10deg); }
    }

    h1 {
      font-size: 3.2rem;
      font-weight: 800;
      letter-spacing: -1px;
      margin-top: 12px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    p {
      margin-top: 16px;
      font-size: 1.2rem;
      opacity: 0.9;
      font-weight: 300;
    }

    .badge {
      display: inline-block;
      margin-top: 28px;
      padding: 8px 20px;
      font-size: 0.85rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 999px;
      opacity: 0.85;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="wave">👋</div>
    <h1>Hello, World!</h1>
    <p>Welcome to my fancy little web server.</p>
    <span class="badge">Powered by Flask \u2022 Docker</span>
  </div>
</body>
</html>
"""


@app.route("/")
def hello_world():
    return HTML_PAGE


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
