import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';

export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  TESTER = 'tester',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DEVELOPER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks: Task[];

  @OneToMany(() => Task, (task) => task.reporter)
  reportedTasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
