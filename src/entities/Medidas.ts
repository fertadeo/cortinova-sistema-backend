import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Medidas {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  elemento: string = ''; // Ej: "Ventana comedor", "Puerta principal"

  @Column('decimal', { precision: 10, scale: 2 })
  ancho: number = 0;

  @Column('decimal', { precision: 10, scale: 2 })
  alto: number = 0;

  @Column()
  cantidad: number = 1; // Cantidad de elementos idénticos con esta medida

  @Column({ nullable: true })
  ubicacion: string = ''; // Ej: "Comedor", "Cocina"

  @Column({ type: 'text', nullable: true })
  detalles: string = ''; // Detalles adicionales, observaciones

  @Column({ type: 'int', nullable: true })
  clienteId: number = 0;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaMedicion: Date = new Date();

  @Column({ nullable: true })
  medidoPor: string = '';
}
