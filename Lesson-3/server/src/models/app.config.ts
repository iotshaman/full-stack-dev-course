import { PoolConfig } from 'mysql';

export class AppConfig {
  port: string;
  mysqlConfig: PoolConfig;
}