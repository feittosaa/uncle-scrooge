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
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
};

/**
 * Insere um novo usuário na tabela 'users'.
 * @param {string} nome O nome do usuário.
 * @param {string} email O email do usuário (deve ser único).
 * @param {string} senha A senha do usuário.
 * @returns {Promise<SQLite.SQLiteRunResult>}
 */
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
    throw error; // Re-lança o erro
  }
};

/**
 * Busca um usuário pelo email na tabela 'users'.
 * @param {string} email O email do usuário a ser buscado.
 * @returns {Promise<object | undefined>} O objeto do usuário se encontrado, ou undefined.
 */
export const getUserByEmail = async (email) => {
  try {
    if (!db) {
      throw new Error('Banco de dados não inicializado. Chame initDB() primeiro.');
    }
    // Usa db.getFirstAsync para buscar uma única linha de dados.
    const user = await db.getFirstAsync('SELECT * FROM users WHERE email = ?;', [email]);
    if (user) {
      console.log('Usuário encontrado:', user.nome);
    } else {
      console.log('Nenhum usuário encontrado com o email:', email);
    }
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error; // Re-lança o erro
  }
};

/**
 * EXTRAS: Exemplo de como obter todos os usuários (opcional).
 * @returns {Promise<Array<object>>} Um array de objetos de usuários.
 */
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