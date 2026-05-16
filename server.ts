import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "printex-secret-key-123";
const db = new Database("printex.db");
console.log("Connected to SQLite database: printex.db");

// Initialize Database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partNum TEXT,
      description TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      minStock INTEGER DEFAULT 1,
      priceKsh REAL DEFAULT 0,
      supplier TEXT,
      location TEXT,
      image TEXT
    );
  `);
  console.log("Database tables initialized/verified");
} catch (err) {
  console.error("Database initialization error:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log all requests for debugging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
  });

  // --- Auth API ---

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = "usr_" + Math.random().toString(36).substring(2, 15);
      
      console.log(`Attempting to register user: ${email}`);
      const insert = db.prepare("INSERT INTO users (id, fullName, email, password) VALUES (?, ?, ?, ?)");
      insert.run(id, fullName, email.toLowerCase(), hashedPassword);
      
      console.log(`User registered successfully: ${id}`);
      const token = jwt.sign({ id, email, fullName }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ success: true, token, user: { id, email, fullName, role: "user" } });
    } catch (error: any) {
      console.error("Signup error details:", error);
      if (error.code === "SQLITE_CONSTRAINT") {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Internal server error: " + error.message });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, fullName: user.fullName }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ success: true, token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
    } catch (error: any) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Internal server error: " + error.message });
    }
  });

  app.post("/api/auth/verify", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ valid: false });
    
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = db.prepare("SELECT id, fullName, email, role FROM users WHERE id = ?").get(decoded.id);
      if (!user) return res.status(401).json({ valid: false });
      res.json({ valid: true, user });
    } catch (error) {
      res.status(401).json({ valid: false });
    }
  });

  // --- Inventory API (Optional for now, but good for real data) ---
  app.get("/api/inventory", (req, res) => {
    const parts = db.prepare("SELECT * FROM inventory").all();
    res.json(parts);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
