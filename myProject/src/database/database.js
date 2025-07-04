import * as SQLite from 'expo-sqlite';

let db;

export const initDB = async () => {
  try {
    db = await SQLite.openDatabaseAsync('users.db');
    console.log('Banco de dados "users.db" aberto com sucesso!');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
      );
    `);
    console.log('Tabela "users" criada ou já existe.');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS account_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        quantia_gasta REAL NOT NULL,
        nome_conta TEXT NOT NULL,
        categoria TEXT NOT NULL,
        data_registro TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabela "account_records" criada ou já existe.');

    await createGoalsTable();

  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
};

export const insertUser = async (nome, email, senha) => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    const result = await db.runAsync(
      'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?);',
      [nome, email, senha]
    );
    console.log('Usuário inserido com sucesso! ID:', result.lastInsertRowId);
    return result;
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    const user = await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
    if (user) {
      console.log('Usuário encontrado:', user.nome);
    } else {
      console.log('Nenhum usuário encontrado com o email:', email);
    }
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
};

export const insertAccountRecord = async (userId, quantiaGasta, nomeConta, categoria, dataRegistro) => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    const result = await db.runAsync(
      'INSERT INTO account_records (user_id, quantia_gasta, nome_conta, categoria, data_registro) VALUES (?, ?, ?, ?, ?);',
      [userId, quantiaGasta, nomeConta, categoria, dataRegistro]
    );
    console.log('Registro de conta inserido com sucesso! ID:', result.lastInsertRowId);
    return result;
  } catch (error) {
    console.error('Erro ao inserir registro de conta:', error);
    throw error;
  }
};

export const getAllAccountRecordsByUserId = async (userId) => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    const records = await db.getAllAsync(
      'SELECT * FROM account_records WHERE user_id = ? ORDER BY data_registro DESC, created_at DESC;',
      [userId]
    );
    console.log(`Registros de conta para o usuário ${userId}:`, records);
    return records;
  } catch (error) {
    console.error('Erro ao buscar registros de conta:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    const allUsers = await db.getAllAsync('SELECT * FROM users;');
    console.log('Todos os usuários:', allUsers);
    return allUsers;
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw error;
  }
};

export const deleteAccountRecordById = async (id) => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    await db.runAsync('DELETE FROM account_records WHERE id = ?;', [id]);
    console.log(`Registro com ID ${id} deletado com sucesso.`);
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    throw error;
  }
};

export const updateAccountRecord = async (id, userId, quantia, nome, categoria, data) => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    await db.runAsync(
      `UPDATE account_records
       SET user_id = ?, quantia_gasta = ?, nome_conta = ?, categoria = ?, data_registro = ?
       WHERE id = ?;`,
      [userId, quantia, nome, categoria, data, id]
    );
    console.log(`Registro com ID ${id} atualizado com sucesso.`);
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    throw error;
  }
};

export const createGoalsTable = async () => {
  try {
    if (!db) throw new Error('Banco de dados não inicializado.');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        categoria TEXT NOT NULL,
        valor_meta REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabela "goals" criada ou já existe.');
  } catch (error) {
    console.error('Erro ao criar tabela goals:', error);
  }
};

export const insertGoal = async (userId, categoria, valorMeta) => {
  if (!db) throw new Error('Banco de dados não inicializado.');
  return db.runAsync(
    'INSERT INTO goals (user_id, categoria, valor_meta) VALUES (?, ?, ?);',
    [userId, categoria, valorMeta]
  );
};

export const getGoalsByUserIdArray = async (userId) => {
  if (!db) throw new Error('Banco de dados não inicializado.');

  const rows = await db.getAllAsync(
    'SELECT id, categoria, valor_meta FROM goals WHERE user_id = ?;',
    [userId]
  );

  return rows;
};

export const getGoalsByUserId = async (userId) => {
  if (!db) throw new Error('Banco de dados não inicializado.');
  const rows = await db.getAllAsync(
    'SELECT categoria, valor_meta FROM goals WHERE user_id = ?;',
    [userId]
  );

  const metasPorCategoria = {};
  for (const row of rows) {
    metasPorCategoria[row.categoria] = row.valor_meta;
  }

  return metasPorCategoria;
};

export const updateGoal = async (id, categoria, valorMeta) => {
  if (!db) throw new Error('Banco de dados não inicializado.');
  return db.runAsync(
    'UPDATE goals SET categoria = ?, valor_meta = ? WHERE id = ?;',
    [categoria, valorMeta, id]
  );
};

export const deleteGoal = async (id) => {
  if (!db) throw new Error('Banco de dados não inicializado.');
  return db.runAsync('DELETE FROM goals WHERE id = ?;', [id]);
};
