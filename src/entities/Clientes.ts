import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Clientes {
  @PrimaryGeneratedColumn()
    id: number = 0;

  @Column()
    nombre: string = '';

  @Column()
    email: string = '';

  @Column()
    telefono: string = '';

  @Column()
    direccion: string = '' ;
}
