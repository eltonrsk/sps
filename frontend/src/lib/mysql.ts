import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root', // Default XAMPP user
  password: '', // Default XAMPP password (empty)
  database: 'student_pickup_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export const db = {
  // Helper function to execute queries
  query: async (sql: string, params: any[] = []) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(sql, params);
      return rows;
    } finally {
      connection.release();
    }
  },

  // Helper function to get a single row
  queryOne: async (sql: string, params: any[] = []) => {
    const results = await db.query(sql, params);
    return Array.isArray(results) ? results[0] : results;
  },

  // Helper function to get all rows
  queryAll: async (sql: string, params: any[] = []) => {
    const results = await db.query(sql, params);
    return Array.isArray(results) ? results : [];
  }
};

// Auth helper functions (you'll need to implement proper authentication)
export const auth = {
  getUser: async () => {
    // For now, return a mock user - you'll need to implement proper auth
    return { user: { id: 'mock-user-id' } };
  }
};