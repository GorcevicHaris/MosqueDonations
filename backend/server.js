const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());

// CORS za razvoj
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.0.103:8080"],
    credentials: true,
  })
);

// DB konfiguracija
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  port: 3004,
  database: "mosquedonations",
};

// JWT secret
const JWT_SECRET = "tajna_lozinka";

// Helper funkcija za konekciju
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

// ✅ REGISTRACIJA
app.post("/register", async (req, res) => {
  const { full_name, email, password, role, mosque_id } = req.body;
  console.log(full_name, email, password, role, mosque_id, "podaci");
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const conn = await getConnection();

    const [existing] = await conn.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists." });

    await conn.execute(
      "INSERT INTO users (full_name, email, password, role, mosque_id) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, role || "imam", mosque_id]
    );

    res.status(201).json({ message: "User registered successfully." });
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT u.*, m.name AS mosque_name FROM users u LEFT JOIN mosques m ON u.mosque_id = m.id WHERE u.email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found." });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        mosque_id: user.mosque_id,
        mosque_name: user.mosque_name,
      },
    });
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Token missing." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user; // Store user info in request
    next();
  });
};

// ✅ DELETE FRIDAY DONATION
app.delete("/donation/friday/:id", authenticateToken, async (req, res) => {
  const donationId = req.params.id;
  const userId = req.user.userId; // From JWT

  try {
    const conn = await getConnection();
    // Ensure the user can only delete their own donations
    const [result] = await conn.execute(
      "DELETE FROM friday_donations WHERE id = ? AND user_id = ?",
      [donationId, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Donation not found or unauthorized." });
    }

    res.json({ message: "Donation deleted successfully." });
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ UNOS PETKOVE DONACIJE
app.post("/donation/friday", async (req, res) => {
  const { mosque_id, user_id, amount, purpose_id, donation_date } = req.body;
  try {
    const conn = await getConnection();
    await conn.execute(
      "INSERT INTO friday_donations (mosque_id, user_id, amount, purpose_id, donation_date) VALUES (?, ?, ?, ?, ?)",
      [mosque_id, user_id, amount, purpose_id, donation_date]
    );
    res.status(201).json({ message: "Friday donation added." });
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UNOS FITRA
app.post("/donation/fitr", async (req, res) => {
  const { mosque_id, user_id, amount, year } = req.body;
  try {
    const conn = await getConnection();
    await conn.execute(
      "INSERT INTO fitr_donations (mosque_id, user_id, amount, year) VALUES (?, ?, ?, ?)",
      [mosque_id, user_id, amount, year]
    );
    res.status(201).json({ message: "Fitr donation recorded." });
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UNOS ZEKATA
app.post("/donation/zakat", async (req, res) => {
  const { mosque_id, user_id, amount, year } = req.body;
  try {
    const conn = await getConnection();
    await conn.execute(
      "INSERT INTO zakat_donations (mosque_id, user_id, amount, year) VALUES (?, ?, ?, ?)",
      [mosque_id, user_id, amount, year]
    );
    res.status(201).json({ message: "Zakat donation recorded." });
    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ STATISTIKA DONACIJA (nedeljno, mesečno, godišnje)
app.get("/stats/:mosqueId", async (req, res) => {
  const mosqueId = req.params.mosqueId;
  try {
    const conn = await getConnection();
    const [weekly] = await conn.execute(
      `
      SELECT SUM(amount) as total FROM friday_donations
      WHERE mosque_id = ? AND YEARWEEK(donation_date, 1) = YEARWEEK(CURDATE(), 1)
    `,
      [mosqueId]
    );

    const [monthly] = await conn.execute(
      `
      SELECT SUM(amount) as total FROM friday_donations
      WHERE mosque_id = ? AND MONTH(donation_date) = MONTH(CURDATE())
    `,
      [mosqueId]
    );

    const [yearly] = await conn.execute(
      `
      SELECT SUM(amount) as total FROM friday_donations
      WHERE mosque_id = ? AND YEAR(donation_date) = YEAR(CURDATE())
    `,
      [mosqueId]
    );

    res.json({
      weekly: weekly[0].total || 0,
      monthly: monthly[0].total || 0,
      yearly: yearly[0].total || 0,
    });

    await conn.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/mosques", async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute("SELECT id, name FROM mosques");
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška prilikom dohvaćanja džamija." });
  }
});
// GET /purposes - Retrieve all purposes
app.get("/purposes", authenticateToken, async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute("SELECT id, name FROM purposes");
    console.log(rows, "da li postoji");
    if (!rows.length) {
      return res.status(404).json({ message: "No purposes found." });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching purposes:", err.message);
    res.status(500).json({ error: "Failed to fetch purposes." });
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (endErr) {
        console.error("Error closing connection:", endErr.message);
      }
    }
  }
});

// server.js (add this block where your other endpoints are defined)

// GET /donations/user/:id - Retrieve donations for a specific user
app.get("/donations/user/:id", authenticateToken, async (req, res) => {
  let conn;
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // Verify the user can only fetch their own donations
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    conn = await getConnection();
    const [rows] = await conn.execute(
      `
      SELECT fd.*, p.name AS purposeName
      FROM friday_donations fd
      LEFT JOIN purposes p ON fd.purpose_id = p.id
      WHERE fd.user_id = ?
      ORDER BY fd.donation_date DESC
      `,
      [userId]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ message: "No donations found for this user." });
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching donations:", err.message);
    res.status(500).json({ error: "Failed to fetch donations." });
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (endErr) {
        console.error("Error closing connection:", endErr.message);
      }
    }
  }
});

app.get("/donations/summary/:userId", async (req, res) => {
  const { userId } = req.params;
  const conn = await getConnection();
  try {
    const [fridaySum] = await conn.execute(
      "SELECT SUM(amount) as total, COUNT(*) as count FROM friday_donations WHERE user_id = ?",
      [userId]
    );
    const [fitrSum] = await conn.execute(
      "SELECT SUM(amount) as total, COUNT(*) as count FROM fitr_donations WHERE user_id = ?",
      [userId]
    );
    const [zakatSum] = await conn.execute(
      "SELECT SUM(amount) as total, COUNT(*) as count FROM zakat_donations WHERE user_id = ?",
      [userId]
    );

    res.json({
      friday: fridaySum[0].total || 0,
      countFriday: fridaySum[0].count || 0,
      fitr: fitrSum[0].total || 0,
      countFitr: fitrSum[0].count || 0,
      zakat: zakatSum[0].total || 0,
      countZakat: zakatSum[0].count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška prilikom izvlačenja podataka." });
  } finally {
    await conn.end();
  }
});

// GET /donations/count/:userId - vraća broj fitr i zakat donacija za korisnika
app.get("/donations/count/:userId", async (req, res) => {
  const { userId } = req.params;
  const conn = await getConnection();

  try {
    const [fitrCountResult] = await conn.execute(
      "SELECT COUNT(*) AS count FROM fitr_donations WHERE user_id = ?",
      [userId]
    );

    const [zakatCountResult] = await conn.execute(
      "SELECT COUNT(*) AS count FROM zakat_donations WHERE user_id = ?",
      [userId]
    );

    res.json({
      fitrCount: fitrCountResult[0].count || 0,
      zakatCount: zakatCountResult[0].count || 0,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Greška prilikom izvlačenja broja donacija." });
  } finally {
    await conn.end();
  }
});

// ... (other existing endpoints like /purposes, /donation/friday, etc.)
// ✅ POKRETANJE SERVERA
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
