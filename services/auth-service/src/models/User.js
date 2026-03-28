import bcrypt from "bcryptjs";
import pool from "../db/pool.js";

class UserModel {
  static async findOneByUsername(username, { withSensitive = false } = {}) {
    const res = await pool.query(
      `select id, username, role, last_login, is_active,
              ${withSensitive ? "password, login_attempts, lock_until, refresh_tokens" : "null::text as password, null::int as login_attempts, null::timestamptz as lock_until, null::text[] as refresh_tokens"}
         from users where username = $1`,
      [username],
    );
    return res.rows[0] || null;
  }

  static async findById(id, { withSensitive = false } = {}) {
    const res = await pool.query(
      `select id, username, role, last_login, is_active,
              ${withSensitive ? "password, login_attempts, lock_until, refresh_tokens" : "null::text as password, null::int as login_attempts, null::timestamptz as lock_until, null::text[] as refresh_tokens"}
         from users where id = $1`,
      [id],
    );
    return res.rows[0] || null;
  }

  static async create({ username, password, role = "client" }) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashed = await bcrypt.hash(password, rounds);
    const res = await pool.query(
      `insert into users (username, password, role) values ($1,$2,$3)
       returning id, username, role, last_login, is_active, created_at`,
      [username, hashed, role],
    );
    return res.rows[0];
  }

  static async comparePassword(user, candidatePassword) {
    return bcrypt.compare(candidatePassword, user.password);
  }

  static isLocked(user) {
    return user.lock_until && new Date(user.lock_until).getTime() > Date.now();
  }

  static async incrementLoginAttempts(user) {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME_MS = 15 * 60 * 1000;

    // if lock expired, reset
    if (user.lock_until && new Date(user.lock_until).getTime() < Date.now()) {
      await pool.query(
        `update users set login_attempts = 1, lock_until = null where id = $1`,
        [user.id],
      );
      return;
    }

    const attempts = (user.login_attempts || 0) + 1;
    const lockUntil = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_TIME_MS) : null;
    await pool.query(
      `update users set login_attempts = $2, lock_until = $3 where id = $1`,
      [user.id, attempts, lockUntil],
    );
  }

  static async resetLoginAttempts(user) {
    await pool.query(
      `update users set login_attempts = 0, lock_until = null, last_login = now() where id = $1`,
      [user.id],
    );
  }

  static toSafeObject(user) {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    };
  }

  static async addRefreshToken(userId, token) {
    await pool.query(
      `update users set refresh_tokens = (select case when array_length(refresh_tokens,1) >= 5 then (array_append(slice.refresh_tokens, $2)) else array_append(refresh_tokens, $2) end from (select coalesce(refresh_tokens, '{}') as refresh_tokens from users where id=$1) slice) where id=$1`,
      [userId, token],
    );
  }

  static async hasRefreshToken(userId, token) {
    const res = await pool.query(
      `select 1 from users where id=$1 and $2 = any(refresh_tokens)`,
      [userId, token],
    );
    return res.rowCount > 0;
  }

  static async rotateRefreshToken(userId, oldToken, newToken) {
    await pool.query(
      `update users
         set refresh_tokens = array_append(array_remove(coalesce(refresh_tokens,'{}'), $2), $3)
       where id=$1`,
      [userId, oldToken, newToken],
    );
  }

  static async removeRefreshToken(userId, token) {
    await pool.query(
      `update users set refresh_tokens = array_remove(coalesce(refresh_tokens,'{}'), $2) where id=$1`,
      [userId, token],
    );
  }
}

export default UserModel;
