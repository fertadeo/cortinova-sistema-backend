import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  STOCK_BAJO = 'stock_bajo',
  NUEVO_CLIENTE = 'nuevo_cliente',
  PEDIDO_LISTO = 'pedido_listo',
  NUEVA_MEDIDA = 'nueva_medida',
  PEDIDO_ATRASADO = 'pedido_atrasado',
  PRESUPUESTO_DISPONIBLE = 'presupuesto_disponible',
  VENTA_REALIZADA = 'venta_realizada',
  SISTEMA = 'sistema'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('notifications')
@Index(['user_id', 'is_read'])
@Index(['user_id', 'type'])
@Index(['created_at'])
@Index(['expires_at'])
@Index(['is_global'])
@Index(['created_by'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  user_id?: string;

  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  created_by?: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    name: 'type'
  })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  is_read!: boolean;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  is_archived!: boolean;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  priority!: NotificationPriority;

  @Column({ name: 'action_url', type: 'varchar', length: 500, nullable: true })
  action_url?: string;

  @Column({ name: 'action_text', type: 'varchar', length: 100, nullable: true })
  action_text?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expires_at?: Date;

  @Column({ name: 'is_global', type: 'boolean', default: true })
  is_global!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}