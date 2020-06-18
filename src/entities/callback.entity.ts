import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Callback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  callbackUrl: string;

  @Column()
  type: string;

  @Column()
  accountId: number;

  @Column()
  callbackToken: string;
}
