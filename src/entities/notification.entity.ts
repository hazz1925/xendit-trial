import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity()
@Unique(['paymentId'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  webhookId: number;

  @Column()
  paymentId: number;

  @Column()
  tries: number;

  @Column()
  status: string;

  @Column('text')
  payload: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
