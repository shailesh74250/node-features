import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  description?: string;
}
