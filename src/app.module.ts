import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    // Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Prisma Module
    PrismaModule,
    
    // Supabase Module
    SupabaseModule,
    
    // Feature Modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    ActivityLogsModule,
  ],
})
export class AppModule {}
