// URL de la base de datos de test: misma instancia de Postgres que la de desarrollo
// (ya viene levantada por docker-compose), pero apuntando a "helpdesk_test" en vez de
// "helpdesk" -- así los tests nunca tocan los datos de desarrollo/demo.
export function testDatabaseUrl(base = process.env.DATABASE_URL) {
  return base.replace(/\/([^/?]+)(\?.*)?$/, '/helpdesk_test$2');
}
