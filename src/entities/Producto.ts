import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombreProducto!: string;

    @Column()
    cantidad_stock!: string;

    @Column('text')
    descripcion!: string;

    @Column('decimal')
    precio!: number;

    @Column()
    divisa!: string;

    @Column('decimal')
    descuento!: number;
}
