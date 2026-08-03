import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reglas_negocio')
export class ReglaNegocio {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Nombre visible del sistema (ej. "Roller", "Dubai") */
  @Column({ name: 'nombre_sistema', type: 'varchar', length: 120 })
  nombreSistema!: string;

  /**
   * Clave para matchear el sistema seleccionado (case-insensitive includes).
   * Ej: "roller", "dubai", "bandas verticales", "veneciana"
   */
  @Column({ name: 'match_key', type: 'varchar', length: 120, unique: true })
  matchKey!: string;

  /** Mínimo facturable en m² (0 = sin mínimo) */
  @Column({ name: 'area_minima_m2', type: 'decimal', precision: 10, scale: 2, default: 0 })
  areaMinimaM2!: number;

  /** Ancho mínimo facturable en cm (0 = sin mínimo) */
  @Column({ name: 'ancho_minimo_cm', type: 'decimal', precision: 10, scale: 2, default: 0 })
  anchoMinimoCm!: number;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
