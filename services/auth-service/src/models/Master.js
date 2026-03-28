import bcrypt from "bcryptjs";
import pool from "../db/pool.js";

class MasterModel {
  static async findOneByUsername(username, { withSensitive = false } = {}) {
    const res = await pool.query(
      `select id, username, display_name, is_active, last_login,
              ${withSensitive ? "password" : "null::text as password"}
         from masters
        where username = $1`,
      [username],
    );
    return res.rows[0] || null;
  }

  static async findById(id) {
    const res = await pool.query(
      `select id, username, display_name, is_active, last_login
         from masters
        where id = $1`,
      [id],
    );
    return res.rows[0] || null;
  }

  static async comparePassword(master, candidatePassword) {
    return bcrypt.compare(candidatePassword, master.password);
  }

  static async recordLogin(masterId) {
    await pool.query(
      `update masters set last_login = now() where id = $1`,
      [masterId],
    );
  }

  static toSafeObject(master) {
    return {
      id: master.id,
      username: master.username,
      displayName: master.display_name || master.username,
      role: "master",
      lastLogin: master.last_login,
    };
  }
}

export default MasterModel;