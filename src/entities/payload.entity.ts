import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('text')
  payload: string;
}
