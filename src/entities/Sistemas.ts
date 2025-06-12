import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('sistemas')
export class Sistemas {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombreSistemas!: string;

   
    };
