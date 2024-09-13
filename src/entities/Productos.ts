import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Producto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sku!: string;

    @Column()
    nombre!: string;

    @Column()
    disponibilidad!: string;

    @Column('text')
    descripcion!: string;

    @Column('decimal')
    precio!: number;

    @Column()
    divisa!: string;

    @Column('decimal')
    descuento!: number;
}
