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
}