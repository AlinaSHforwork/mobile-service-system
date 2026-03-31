import pool from './pool.js';

async function initAuthSchema() {
  try {
    await pool.query('create extension if not exists pgcrypto;');

    await pool.query(`
      create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        username text not null unique,
        password text not null,
        role text not null check (role in ('client','master')) default 'client',
        refresh_tokens text[] not null default '{}',
        login_attempts int not null default 0,
        lock_until timestamptz,
        last_login timestamptz,
        is_active boolean not null default true,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);

    await pool.query(`
      create table if not exists masters (
        id uuid primary key default gen_random_uuid(),
        username text not null unique,
        password text not null,
        display_name text,
        is_active boolean not null default true,
        last_login timestamptz,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);

    await pool.query(`
      create index if not exists idx_masters_username on masters(username);
    `);

    await pool.query(`
      create or replace function set_updated_at()
      returns trigger as $$
      begin
        new.updated_at = now();
        return new;
      end;
      $$ language plpgsql;
    `);

    await pool.query(`
      drop trigger if exists trg_users_updated_at on users;
      create trigger trg_users_updated_at
      before update on users
      for each row execute function set_updated_at();
    `);

    await pool.query(`
      drop trigger if exists trg_masters_updated_at on masters;
      create trigger trg_masters_updated_at
      before update on masters
      for each row execute function set_updated_at();
    `);

  } catch (err) {
    console.error("Error initializing auth schema:", err.message);
    throw err;
  }
}

export { initAuthSchema };