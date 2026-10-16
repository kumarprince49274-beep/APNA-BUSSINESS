
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const base = path.dirname(fileURLToPath(import.meta.url));

export function openDatabase(
  filename = process.env.DB_PATH ||
    path.resolve('data/apna-business.sqlite')
) {
  if (filename !== ':memory:') {
    fs.mkdirSync(path.dirname(path.resolve(filename)), {
      recursive: true
    });
  }

  const db = new DatabaseSync(filename);

  db.exec(
    'PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;'
  );

  db.exec(
    fs.readFileSync(path.join(base, 'schema.sql'), 'utf8')
  );

  return db;
}

export function transaction(db, task) {
  db.exec('BEGIN IMMEDIATE');

  try {
    const result = task();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export const one = (db, sql, ...args) =>
  db.prepare(sql).get(...args);

export const all = (db, sql, ...args) =>
  db.prepare(sql).all(...args);

export const run = (db, sql, ...args) =>
  db.prepare(sql).run(...args);
