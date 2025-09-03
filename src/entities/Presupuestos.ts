import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("presupuestos")
export class Presupuesto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    numero_presupuesto!: string;

    @Column()
    cliente_id!: number;

    @Column()
    fecha!: Date;

    @Column("decimal", { precision: 10, scale: 2 })
    total!: number;

    @Column()
    estado!: string;

    @CreateDateColumn()
    created_at!: Date;

    @Column("json")
    presupuesto_json!: any;

    // Nuevas columnas para motorización
    @Column("boolean", { default: false })
    incluirMotorizacion!: boolean;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    precioMotorizacion!: number;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    subtotal!: number;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    descuento!: number;
}