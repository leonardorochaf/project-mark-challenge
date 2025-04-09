import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TopicVersion } from './topic-version.entity';
import { Resource } from './resource.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Topic, (topic) => topic.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Topic;

  @OneToMany(() => Topic, (topic) => topic.parent)
  children: Topic[];

  @OneToMany(() => TopicVersion, (version) => version.topic)
  versions: TopicVersion[];

  @OneToMany(() => Resource, (resource) => resource.topic)
  resources: Resource[];
}
