import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, unique: true })
  user_id!: string;

  @Column({ name: 'email_enabled', type: 'boolean', default: true })
  email_enabled!: boolean;

  @Column({ name: 'push_enabled', type: 'boolean', default: true })
  push_enabled!: boolean;

  @Column({ name: 'sound_enabled', type: 'boolean', default: true })
  sound_enabled!: boolean;

  @Column({ name: 'stock_threshold', type: 'int', default: 10 })
  stock_threshold!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}