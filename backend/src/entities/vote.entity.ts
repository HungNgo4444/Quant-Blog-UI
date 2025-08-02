import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum VoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

export enum TargetType {
  QUESTION = 'question',
  ANSWER = 'answer',
}

@Entity('votes')
@Unique(['user_id', 'target_id', 'target_type'])
export class Vote {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  target_id: string;

  @Column({
    type: 'enum',
    enum: TargetType,
  })
  target_type: TargetType;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  vote_type: VoteType;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
} 