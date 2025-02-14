import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
  } from 'typeorm';
  import { Clientes } from './Clientes';
  import { PedidoEstado } from './enums/PedidoEstado';
  
  @Entity('pedido')
  export class Pedido {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    clienteid!: number;
  
    @Column()
    fecha_pedido!: Date;

    @Column('json')
    pedido_json!: any;
  
    @Column()
    presupuesto_id!: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    total!: number;
  
    @ManyToOne(() => Clientes)
    @JoinColumn({ name: 'clienteid' })
    cliente!: Clientes;

    @Column({
        type: 'enum',
        enum: PedidoEstado,
        default: PedidoEstado.EMITIDO
    })
    estado!: PedidoEstado;
  }
  