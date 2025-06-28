import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rubros')
export class Rubro {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombreRubros!: string;
}
