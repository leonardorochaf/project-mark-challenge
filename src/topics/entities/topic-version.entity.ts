import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Topic } from './topic.entity';

@Entity()
@Index(['topicId', 'version'], { unique: true })
export class TopicVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  version: number;

  @Column()
  name: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  isLatest: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  topicId: string;

  @ManyToOne(() => Topic, (topic) => topic.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topicId' })
  topic: Topic;
}
