// LIBS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ENTITIES
import { CustomersEntity } from './entities/customers.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ProfileEntity } from '../profiles/entities/profile.entity';

// SERVICES
import { CreateCustomersService } from './services/create/create-customers.service';
import { GetCustomersService } from './services/get/get-customers.service';
import { UpdateCustomersService } from './services/update/update-customers.service';

// RESOLVERS
import { GetCustomersResolver } from './resolvers/get/get-customers.resolver';
import { CreateCustomersResolver } from './resolvers/create/create-customers.resolver';
import { UpdateCustomersResolver } from './resolvers/update/update-customers.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([CustomersEntity, UserEntity, ProfileEntity]),
  ],
  providers: [
    CreateCustomersService,
    CreateCustomersResolver,
    GetCustomersService,
    GetCustomersResolver,
    UpdateCustomersService,
    UpdateCustomersResolver,
  ],
  exports: [CreateCustomersService, GetCustomersService],
})

export class CustomersModule { }