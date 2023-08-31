import { Sequelize } from 'sequelize';

export const DEFAULT_RESOLVER = (functionName: string, args: any[]): Sequelize => {
  const sequelize = args.find((a) => a instanceof Sequelize);
  if (sequelize == null) throw new Error(`@Transactional cannot find sequelize instance of function ${functionName}.`);
  return sequelize
}

export const MSSQL_DATASOURCE_RESOLVER = (functionName: string, args: any[]): Sequelize => {
  const dataSource = args.find((a) => a.mssql);
  if (dataSource == null) throw new Error(`@Transactional cannot find the dataSource parameter of function ${functionName}.`);
  return dataSource.mssql.sequelize;
}
