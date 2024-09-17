import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombreProducto!: string;

    @Column()
    cantidad_stock!: string;

    @Column()
    descripcion!: string;

    @Column()
    precioCosto!: string;

    @Column()
    precio!: number;

    @Column()
    divisa!: string;

    @Column()
    descuento!: number;
}
