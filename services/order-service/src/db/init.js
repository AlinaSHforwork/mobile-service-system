import pool from './pool.js';

async function initOrderSchema() {
  try {
    // Create pgcrypto extension first
    await pool.query('create extension if not exists pgcrypto;');

    // Create orders table
    await pool.query(`
      create table if not exists orders (
        id uuid primary key default gen_random_uuid(),
        client_id uuid not null,
        device_type text not null,
        device_model text not null,
        os_version text not null,
        date_of_purchase date,
        issue_description text not null,
        technician_comment text,
        status text not null check (status in (
          'new', 
          'in progress', 
          'waiting customer response',
          'waiting spare parts',
          'failed',
          'done'
        )) default 'new',
        assigned_to uuid,
        cost decimal(10, 2),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);

    // Create indexes
    await pool.query('create index if not exists idx_orders_client_id on orders(client_id);');
    await pool.query('create index if not exists idx_orders_status on orders(status);');
    await pool.query('create index if not exists idx_orders_assigned_to on orders(assigned_to);');

    // Create trigger function
    await pool.query(`
      create or replace function set_updated_at()
      returns trigger as $$
      begin
        new.updated_at = now();
        return new;
      end;
      $$ language plpgsql;
    `);

    // Create trigger
    await pool.query(`
      drop trigger if exists trg_orders_updated_at on orders;
      create trigger trg_orders_updated_at
      before update on orders
      for each row execute function set_updated_at();
    `);

    // Create messages table for chat
    await pool.query(`
      create table if not exists messages (
        id uuid primary key default gen_random_uuid(),
        order_id uuid not null references orders(id) on delete cascade,
        sender_id uuid not null,
        sender_role text not null check (sender_role in ('client', 'master')),
        content text not null,
        created_at timestamptz not null default now()
      );
    `);

    // Create indexes for messages
    await pool.query('create index if not exists idx_messages_order_id on messages(order_id);');
    await pool.query('create index if not exists idx_messages_sender_id on messages(sender_id);');
    
  } catch (err) {
    console.error("Error initializing order schema:", err.message);
    throw err;
  }
}

export { initOrderSchema };
