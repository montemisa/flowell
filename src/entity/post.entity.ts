import { Entity, OneToOne, JoinColumn,Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm'

@Entity()
export class Post {
   @PrimaryGeneratedColumn()
   id: number

   @Column()
   title: string

   @Column()
   text: string

   @Column()
   creatorId : number

   @UpdateDateColumn()
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
