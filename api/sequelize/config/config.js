require('dotenv').config({ path: '.env' });

module.exports = {
  development: {
    username: process.env.DB_USER || 'clinical_user',
    password: process.env.DB_PASS || 'clinical_pass',
    database: process.env.DB_NAME || 'clinical_platform',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: { timestamps: false }
  }
};