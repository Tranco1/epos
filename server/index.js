const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "myerp",
  password: "aass",
  port: 5432,
});


// ⚙️ Secret key for JWT (store in .env in production)
const JWT_SECRET = "mysecretkey";
const fixed_dealer_id = 1;

// 🔐 Login route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username or email
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 and dealer_id = $2",
      [username, fixed_dealer_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.name,
        dealer_id: user.dealer_id,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        dealer_id: user.dealer_id,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📝 Register new user
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // Check if user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE name = $1 OR email = $2",
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (name, email, dealer_id, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, dealer_id",
      [username, email, fixed_dealer_id || null, hashed]
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 🟢 Get products joined with category name
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.price, p.dealer_id, p.img, c.cname AS category
      FROM products p
      JOIN category c ON c.id = p.category
      WHERE p.dealer_id = 1
      ORDER BY c.sortcode, p.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 Submit an order
app.post("/api/orders", async (req, res) => {
  const { customer_name, cart } = req.body;
  if (!customer_name || !cart || cart.length === 0) {
    return res.status(400).json({ error: "Missing customer name or cart" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderResult = await client.query(
      "INSERT INTO orders (customer_name, total) VALUES ($1, $2) RETURNING id",
      [customer_name, total]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of cart) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.listen(5000, "0.0.0.0", () =>
  console.log("✅ API running on http://0.0.0.0:5000")
);
