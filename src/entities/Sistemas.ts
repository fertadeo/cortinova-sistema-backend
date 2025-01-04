import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Sistemas {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;
}