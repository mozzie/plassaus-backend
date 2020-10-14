// src/config/config.service.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) { }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value || '';
  }

  public ensureValues(keys: string[]) : ConfigService {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() : string {
    return this.getValue('PORT', true);
  }

  public isProduction() : boolean {
    const mode = this.getValue('MODE', false);
    return mode !== 'DEV';
  }

  public getJwtSecret(): string {
    return this.getValue('JWT_SECRET');
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const dbPrefix = this.getValue('MODE', false) === 'TEST' ? 'test' : '';
    return {
      type: 'mysql',
      host: this.getValue('MYSQL_HOST'),
      port: parseInt(this.getValue('MYSQL_PORT'), 10),
      username: this.getValue('MYSQL_USERNAME'),
      password: this.getValue('MYSQL_PASSWORD'),
      database: `${dbPrefix}${this.getValue('MYSQL_DATABASE')}`,
      //      entities: [User],
      entities: [`${__dirname}/../**/*.entity.ts`, `${__dirname}/../model/*.entity.js`],
      synchronize: false,
      migrations: [`${__dirname}/../migration/*.ts`],
      migrationsRun: true,
      migrationsTableName: 'plassaus_backend_migrations',
      logging: true,
      cli: {
        migrationsDir: '/../migration/',
      },
      // ssl: this.isProduction(),
    };
  }
}

const configService = new ConfigService(process.env)
  .ensureValues([
    'MYSQL_HOST',
    'MYSQL_PORT',
    'MYSQL_USERNAME',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
  ]);

export default configService;
