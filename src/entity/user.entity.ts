import { Entity, OneToOne, JoinColumn,Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

@Entity()
export class User {
   @PrimaryGeneratedColumn()
   id: number

   @Column({unique: true})
   username: string

   @Column()
   password: string

   @Column({unique: true})
   email: string

   @CreateDateColumn()
   createdAt : String

   @UpdateDateColumn()
   updtedAt : String

//    @OneToMany(type => CartEntity, cart => cart.id)
//    @JoinColumn()
//    cart: CartEntity[]

//    @OneToOne(type => OrderEntity, order => order.id)
//    @JoinColumn()
//    order : OrderEntity;
}
