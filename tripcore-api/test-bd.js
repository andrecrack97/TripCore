const { sql, config } = require('./db');

sql.connect(config)
  .then(pool => pool.request().query('SELECT TOP 1 * FROM Viajes'))
  .then(result => {
    console.log('Conexión exitosa:', result.recordset);
    sql.close();
  })
  .catch(err => {
    console.error('Error de conexión:', err);
    sql.close();
  });
