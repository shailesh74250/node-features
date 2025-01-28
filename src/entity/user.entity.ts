import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'terminated'], default: 'inactive' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', update: false })
  creation_datetime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  update_datetime: Date;

}