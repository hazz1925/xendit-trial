import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TestPayload {
  public static readonly TYPE_PAYMENT = 'PAYMENT'

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('text')
  payload: string;
}
