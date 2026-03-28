import pool from "../db/pool.js";

export const VALID_STATUSES = [
  "new",
  "waiting customer response",
  "waiting spare parts",
  "in progress",
  "failed",
  "done",
];

class OrderModel {
  static async create({ clientId, deviceType, deviceModel, osVersion, dateOfPurchase, issueDescription }) {
    const res = await pool.query(
      `insert into orders (client_id, device_type, device_model, os_version, date_of_purchase, issue_description, status)
       values ($1,$2,$3,$4,$5,$6,'new')
       returning *`,
      [clientId, deviceType, deviceModel, osVersion, dateOfPurchase || null, issueDescription]
    );
    return res.rows[0];
  }

  static async findById(id) {
    const res = await pool.query(
      `select o.*, u.username as client_username, m.display_name as master_name 
       from orders o
       left join users u on o.client_id = u.id
       left join masters m on o.assigned_to = m.id
       where o.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  static async findByClientId(clientId, { limit = 50, offset = 0, search = "" } = {}) {
    let query = `select o.*, u.username as client_username, m.display_name as master_name 
                 from orders o
                 left join users u on o.client_id = u.id
                 left join masters m on o.assigned_to = m.id
                 where o.client_id = $1`;
    const params = [clientId];
    if (search) {
      params.push(`%${search}%`);
      query += ` and (o.device_model ilike $${params.length} or o.issue_description ilike $${params.length} or o.status ilike $${params.length})`;
    }
    query += ` order by o.created_at desc limit $${params.length + 1} offset $${params.length + 2}`;
    params.push(limit, offset);
    const res = await pool.query(query, params);
    return res.rows;
  }

  static async countByClientId(clientId, { search = "" } = {}) {
    let query = `select count(*) from orders where client_id = $1`;
    const params = [clientId];
    if (search) {
      params.push(`%${search}%`);
      query += ` and (device_model ilike $${params.length} or issue_description ilike $${params.length} or status ilike $${params.length})`;
    }
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count);
  }

  static async findAll({ limit = 50, offset = 0, search = "", status = "" } = {}) {
    let query = `select o.*, u.username as client_username, m.display_name as master_name 
                 from orders o
                 left join users u on o.client_id = u.id
                 left join masters m on o.assigned_to = m.id
                 where 1=1`;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` and (o.device_model ilike $${params.length} or o.issue_description ilike $${params.length} or o.technician_comment ilike $${params.length})`;
    }
    if (status) {
      params.push(status);
      query += ` and o.status = $${params.length}`;
    }
    query += ` order by o.created_at desc limit $${params.length + 1} offset $${params.length + 2}`;
    params.push(limit, offset);
    const res = await pool.query(query, params);
    return res.rows;
  }

  static async countAll({ search = "", status = "" } = {}) {
    let query = `select count(*) from orders where 1=1`;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` and (device_model ilike $${params.length} or issue_description ilike $${params.length} or technician_comment ilike $${params.length})`;
    }
    if (status) {
      params.push(status);
      query += ` and status = $${params.length}`;
    }
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count);
  }

  static async updateStatus(id, { status, technicianComment, assignedTo, cost }) {
    const fields = [];
    const params = [];

    if (status !== undefined) {
      params.push(status);
      fields.push(`status = $${params.length}`);
    }
    if (technicianComment !== undefined) {
      params.push(technicianComment);
      fields.push(`technician_comment = $${params.length}`);
    }
    if (assignedTo !== undefined) {
      params.push(assignedTo);
      fields.push(`assigned_to = $${params.length}`);
    }
    if (cost !== undefined) {
      params.push(cost);
      fields.push(`cost = $${params.length}`);
    }

    if (fields.length === 0) return null;

    params.push(id);
    const res = await pool.query(
      `update orders set ${fields.join(", ")} where id = $${params.length} returning *`,
      params
    );
    return res.rows[0] || null;
  }

  static async delete(id) {
    const res = await pool.query(`delete from orders where id = $1 returning id`, [id]);
    return res.rowCount > 0;
  }

  static async findByMasterId(masterId, { limit = 50, offset = 0, search = "", status = "" } = {}) {
    let query = `select o.*, u.username as client_username, m.display_name as master_name 
                 from orders o
                 left join users u on o.client_id = u.id
                 left join masters m on o.assigned_to = m.id
                 where o.assigned_to = $1`;
    const params = [masterId];
    if (search) {
      params.push(`%${search}%`);
      query += ` and (o.device_model ilike $${params.length} or o.issue_description ilike $${params.length} or u.username ilike $${params.length})`;
    }
    if (status) {
      params.push(status);
      query += ` and o.status = $${params.length}`;
    }
    query += ` order by o.created_at desc limit $${params.length + 1} offset $${params.length + 2}`;
    params.push(limit, offset);
    const res = await pool.query(query, params);
    return res.rows;
  }

  static async countByMasterId(masterId, { search = "", status = "" } = {}) {
    let query = `select count(*) from orders o
                 where o.assigned_to = $1`;
    const params = [masterId];
    if (search) {
      params.push(`%${search}%`);
      query += ` and (o.device_model ilike $${params.length} or o.issue_description ilike $${params.length})`;
    }
    if (status) {
      params.push(status);
      query += ` and o.status = $${params.length}`;
    }
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count);
  }


  static toSafeObject(order) {
    return {
      id: order.id,
      clientId: order.client_id,
      clientUsername: order.client_username || null,
      masterName: order.master_name || null,
      deviceType: order.device_type,
      deviceModel: order.device_model,
      osVersion: order.os_version,
      dateOfPurchase: order.date_of_purchase,
      issueDescription: order.issue_description,
      technicianComment: order.technician_comment,
      status: order.status,
      assignedTo: order.assigned_to,
      cost: order.cost,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  }
}

export default OrderModel;