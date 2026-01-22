import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

export enum TaskType {
  TASK = 'task',
  BUG = 'bug',
  STORY = 'story',
  EPIC = 'epic',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.TASK,
  })
  type: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ManyToOne(() => Project, (project) => project.tasks)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User;

  @Column({ nullable: true })
  assigneeId: string;

  @ManyToOne(() => User, (user) => user.reportedTasks)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column()
  reporterId: string;

  @Column({ type: 'int', nullable: true })
  estimatedHours: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
