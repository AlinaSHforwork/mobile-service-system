import pool from "../db/pool.js";

class MessageModel {
  static async create({ orderId, senderId, senderRole, content }) {
    const res = await pool.query(
      `insert into messages (order_id, sender_id, sender_role, content)
       values ($1, $2, $3, $4)
       returning id, order_id, sender_id, sender_role, content, created_at`,
      [orderId, senderId, senderRole, content]
    );
    return res.rows[0];
  }

  static async findByOrderId(orderId, { limit = 50, offset = 0 } = {}) {
    const res = await pool.query(
      `select m.*, 
              u.username as client_username,
              master.display_name as master_name
       from messages m
       left join users u on m.sender_id = u.id and m.sender_role = 'client'
       left join masters master on m.sender_id = master.id and m.sender_role = 'master'
       where m.order_id = $1
       order by m.created_at asc
       limit $2 offset $3`,
      [orderId, limit, offset]
    );
    return res.rows;
  }

  static async countByOrderId(orderId) {
    const res = await pool.query(
      `select count(*) from messages where order_id = $1`,
      [orderId]
    );
    return parseInt(res.rows[0].count);
  }

  static toSafeObject(message) {
    return {
      id: message.id,
      orderId: message.order_id,
      senderId: message.sender_id,
      senderRole: message.sender_role,
      senderName: message.sender_role === "client" ? message.client_username : message.master_name,
      content: message.content,
      createdAt: message.created_at,
    };
  }
}

export default MessageModel;
