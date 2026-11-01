#!/usr/bin/env node
/**
 * SQLite CLI Utility for Lab 2
 * Allows executing interactive or argument-based SQL queries directly against goodreads.db
 * Usage:
 *   node db-cli.js "SELECT * FROM book;"
 *   node db-cli.js
 */

const path = require('path');
const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const dbPath = path.join(__dirname, 'goodreads.db');

async function runCli() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  const queryArg = process.argv.slice(2).join(' ').trim();

  if (queryArg) {
    try {
      console.log(`sqlite> ${queryArg}`);
      if (queryArg.toUpperCase().startsWith('SELECT') || queryArg.toUpperCase().startsWith('PRAGMA')) {
        const rows = await db.all(queryArg);
        if (rows.length === 0) {
          console.log('(0 rows returned)');
        } else {
          console.table(rows);
          console.log(`(${rows.length} rows returned)`);
        }
      } else {
        const result = await db.run(queryArg);
        console.log(`Query OK, changes: ${result.changes}, lastID: ${result.lastID}`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
    } finally {
      await db.close();
    }
    return;
  }

  // Interactive REPL Mode
  console.log('====================================================');
  console.log('SQLite Interactive CLI (goodreads.db)');
  console.log('Type your SQL statement and press Enter.');
  console.log('Type ".tables", ".schema book", or ".exit" to quit.');
  console.log('====================================================');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'sqlite> ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    if (input === '.exit' || input === 'exit' || input === 'quit') {
      await db.close();
      rl.close();
      return;
    }

    if (input === '.tables') {
      try {
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
        console.log(tables.map(t => t.name).join('  '));
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
      rl.prompt();
      return;
    }

    if (input.startsWith('.schema')) {
      try {
        const schema = await db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='book';");
        if (schema.length > 0) console.log(schema[0].sql);
      } catch (err) {
        console.error(`Error: ${err.message}`);
      }
      rl.prompt();
      return;
    }

    try {
      if (input.toUpperCase().startsWith('SELECT') || input.toUpperCase().startsWith('PRAGMA')) {
        const rows = await db.all(input);
        if (rows.length === 0) {
          console.log('(0 rows returned)');
        } else {
          console.table(rows);
          console.log(`(${rows.length} rows returned)`);
        }
      } else {
        const result = await db.run(input);
        console.log(`Query OK, changes: ${result.changes}, lastID: ${result.lastID}`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }

    rl.prompt();
  }).on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });
}

runCli();
