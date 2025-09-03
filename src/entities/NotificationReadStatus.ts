import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Notification } from './Notifications';

@Entity('notification_read_status')
@Index(['user_id', 'is_read'])
@Index(['notification_id'])
@Index(['read_at'])
export class NotificationReadStatus {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'notification_id', type: 'varchar', length: 36 })
  notification_id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  user_id!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  is_read!: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  read_at?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // Relación con la notificación (opcional, para consultas)
  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification?: Notification;
}

