import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("presupuestos_emitidos")
export class Presupuesto {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column("varchar", { length: 100 })
    numero_presupuesto?: string;

    @CreateDateColumn()
    fecha?: Date;

    @Column()
    cliente_id?: number;

    @Column("text")
    detalle_presupuesto?: string;

    @Column("varchar", { length: 255 })
    cliente_nombre?: string;

    @Column("decimal", { precision: 10, scale: 2 })
    subtotal?: number;

    @Column("decimal", { precision: 10, scale: 2 })
    total_final?: number;

    @Column("json", { nullable: true })
    productos?: {
        nombre: string;
        descripcion: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
    }[];
}