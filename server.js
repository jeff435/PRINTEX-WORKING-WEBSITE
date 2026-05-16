const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// YOUR SUPABASE CONFIGURATION
const supabaseUrl = 'https://ptejnpweiahssjyjyqed.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZWpucHdlaWFoc3NqeWp5cWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzE0NzcsImV4cCI6MjA5NDI0NzQ3N30.jDZc6YhMKXORXL69NlaMu0GWU96AZQecBaszT15Gxg0';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'printex-super-secret-key-change-this';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ENDPOINTS ============

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: passwordHash, full_name: fullName || '' }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Generate JWT
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET);
    
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, email, fullName: user.full_name }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!user || error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET);
    
    res.json({
      success: true,
      token,
      user: { id: user.id, email, fullName: user.full_name }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', decoded.userId)
      .single();
    
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============ INVENTORY ENDPOINTS ============

// Get all parts for current user
app.get('/api/parts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: parts, error } = await supabase
      .from('user_parts')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('id');
    
    if (error) throw error;
    res.json(parts || []);
    
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Add or update part
app.post('/api/parts', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const part = req.body;
    
    if (part.id) {
      const { data, error } = await supabase
        .from('user_parts')
        .update({
          part_num: part.partNum,
          description: part.desc,
          category: part.category,
          stock: part.stock,
          min_stock: part.minStock,
          price_ksh: part.priceKsh,
          supplier: part.supplier,
          location: part.location,
          image: part.image
        })
        .eq('id', part.id)
        .eq('user_id', decoded.userId)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from('user_parts')
        .insert({
          user_id: decoded.userId,
          part_num: part.partNum,
          description: part.desc,
          category: part.category,
          stock: part.stock || 0,
          min_stock: part.minStock || 1,
          price_ksh: part.priceKsh || 0,
          supplier: part.supplier || '',
          location: part.location || '',
          image: part.image || null
        })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    }
    
  } catch (error) {
    console.error('Parts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete part
app.delete('/api/parts/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { error } = await supabase
      .from('user_parts')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', decoded.userId);
    
    if (error) throw error;
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ INVOICE ENDPOINTS ============

app.get('/api/invoices', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: invoices, error } = await supabase
      .from('user_invoices')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(invoices || []);
    
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const inv = req.body;
    
    const { data, error } = await supabase
      .from('user_invoices')
      .insert({
        user_id: decoded.userId,
        invoice_number: inv.invoiceNumber,
        date: inv.date,
        customer: inv.customer,
        notes: inv.notes,
        type: inv.type,
        items: inv.items,
        subtotal: inv.subtotal,
        discount_pct: inv.discountPct,
        discount_amt: inv.discountAmt,
        vat: inv.vat,
        vat_rate: inv.vatRate,
        grand: inv.grand,
        payment_status: inv.paymentStatus || 'pending'
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { error } = await supabase
      .from('user_invoices')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', decoded.userId);
    
    if (error) throw error;
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Printex backend running on port ${PORT}`);
});
