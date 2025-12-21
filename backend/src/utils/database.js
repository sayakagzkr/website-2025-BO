const { getConnection, initDatabase, closePool } = require('./mysql');

/**
 * MySQL Database Driver with SQLite-like interface
 * Provides compatibility layer for existing code
 */

class DatabaseDriver {
  constructor() {
    this.connection = null;
  }

  async getConn() {
    if (!this.connection) {
      this.connection = await getConnection();
    }
    return this.connection;
  }

  async releaseConn() {
    if (this.connection) {
      this.connection.release();
      this.connection = null;
    }
  }

  /**
   * Execute a query and return all results
   * @param {string} sql - SQL query
   * @param {array} params - Query parameters
   * @returns {array} Results array
   */
  async all(sql, params = []) {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query(sql, params);
      return rows;
    } finally {
      conn.release();
    }
  }

  /**
   * Execute a query and return first result
   * @param {string} sql - SQL query
   * @param {array} params - Query parameters
   * @returns {object|null} First result or null
   */
  async get(sql, params = []) {
    const conn = await getConnection();
    try {
      const [rows] = await conn.query(sql, params);
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  /**
   * Execute a query (INSERT, UPDATE, DELETE)
   * @param {string} sql - SQL query
   * @param {array} params - Query parameters
   * @returns {object} Result with insertId and affectedRows
   */
  async run(sql, params = []) {
    const conn = await getConnection();
    try {
      const [result] = await conn.query(sql, params);
      return {
        lastID: result.insertId,
        changes: result.affectedRows,
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };
    } finally {
      conn.release();
    }
  }

  /**
   * Begin transaction
   */
  async beginTransaction() {
    const conn = await getConnection();
    await conn.beginTransaction();
    this.connection = conn;
  }

  /**
   * Commit transaction
   */
  async commit() {
    if (this.connection) {
      await this.connection.commit();
      await this.releaseConn();
    }
  }

  /**
   * Rollback transaction
   */
  async rollback() {
    if (this.connection) {
      await this.connection.rollback();
      await this.releaseConn();
    }
  }

  /**
   * Execute multiple statements (for migrations)
   * @param {string} sql - SQL statements
   */
  async exec(sql) {
    const conn = await getConnection();
    try {
      const statements = sql.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await conn.query(statement);
        }
      }
    } finally {
      conn.release();
    }
  }

  /**
   * Prepare a statement (returns a prepared statement object)
   * @param {string} sql - SQL query
   */
  prepare(sql) {
    return {
      all: async (params = []) => this.all(sql, params),
      get: async (params = []) => this.get(sql, params),
      run: async (params = []) => this.run(sql, params),
    };
  }
}

// Create singleton instance
const db = new DatabaseDriver();

module.exports = { 
  db, 
  initDatabase,
  closePool
};
