#!/usr/bin/env node
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('DATABASE_URL not set, skipping bootstrap');
    return;
  }

  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Bootstrap admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM admins');
      if (rows[0].count === 0) {
        const hash = await bcrypt.hash(adminPassword, 12);
        await pool.query(
          'INSERT INTO admins (username, email, password, status) VALUES ($1, $2, $3, $4)',
          ['admin', adminEmail, hash, 'active']
        );
        console.log('Admin created:', adminEmail);
      } else {
        console.log('Admin already exists, skipping');
      }
    }

    // Bootstrap default roles
    const { rows: roleCount } = await pool.query('SELECT COUNT(*)::int as count FROM roles');
    if (roleCount[0].count === 0) {
      const roles = [
        ['admin', 'Administrator', JSON.stringify(['*']), false, true],
        ['user', 'User', JSON.stringify(['order.create', 'order.read', 'ticket.create', 'ticket.read']), true, true],
        ['staff', 'Staff', JSON.stringify(['order.read', 'ticket.read', 'ticket.update']), false, false],
        ['order_manager', 'Order Manager', JSON.stringify(['order.read', 'order.update', 'order.refill']), false, false],
        ['support_agent', 'Support Agent', JSON.stringify(['ticket.read', 'ticket.update']), false, false],
      ];
      for (const [name, displayName, permissions, isDefault, isSystem] of roles) {
        await pool.query(
          'INSERT INTO roles (name, "displayName", permissions, "isDefault", "isSystem") VALUES ($1, $2, $3, $4, $5)',
          [name, displayName, permissions, isDefault, isSystem]
        );
      }
      console.log('Default roles created');
    }

    // Bootstrap default settings
    const { rows: settingCount } = await pool.query('SELECT COUNT(*)::int as count FROM settings');
    if (settingCount[0].count === 0) {
      const defaults = {
        site_name: 'AmarFollower',
        site_url: process.env.NEXTAUTH_URL || 'https://amarfollower.com',
        currency: 'BDT',
        min_deposit: '10',
        min_order: '1',
        referral_bonus: '5',
        default_commission: '10',
      };
      for (const [key, value] of Object.entries(defaults)) {
        await pool.query('INSERT INTO settings (key, value) VALUES ($1, $2)', [key, value]);
      }
      console.log('Default settings created');
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('Bootstrap error:', e.message);
  process.exit(1);
});
