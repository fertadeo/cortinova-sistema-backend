import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Proveedores } from './Proveedores';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: '' })
  nombreProducto!: string;

  @Column({ default: '0' })
  cantidad_stock!: string;

  @Column({ default: '' })
  descripcion!: string;

  @Column({ default: '0' })
  precioCosto!: string;

  @Column({ default: '0' })
  precio!: string;

  @Column({ default: 'ARS' })
  divisa!: string;

  @Column({ default: 0 })
  descuento!: number;

  @Column({ type: 'varchar', nullable: true })
  rubro_id!: string | null;

  @Column({ type: 'varchar', nullable: true })
  sistema_id!: string | null;

  @Column({ default: true })
  disponible!: boolean;

  @Column({ type: 'int', nullable: true })
  proveedor_id!: number | null;

  @ManyToOne(() => Proveedores, (proveedor) => proveedor.productos, { nullable: true })
  @JoinColumn({ name: 'proveedor_id' })  // Especifica que la columna de clave foránea es 'proveedorid'
  proveedor!: Proveedores | null;
  // proveedor_id: any;
}