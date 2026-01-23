import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: this.configService.get<string>('DB_HOST'),
    port: Number(this.configService.get<number>('DB_PORT')),
    username: this.configService.get<string>('DB_USERNAME'),
    password: this.configService.get<string>('DB_PASSWORD'),
    database: this.configService.get<string>('DB_DATABASE'),

    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: this.configService.get<string>('DB_SYNCHRONIZE') === 'true',
    logging: this.configService.get<string>('NODE_ENV') === 'development',

    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000,
    },
  };
}

}
