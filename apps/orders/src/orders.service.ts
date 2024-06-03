import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.dto';
import { OrdersRepository } from './order.repository';
import { BILLING_SERVICE } from './constants/service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async getOrders() {
    return this.orderRepository.find({});
  }

  async createOrder(request: CreateOrderRequest) {
    // const session = await this.orderRepository.startTransaction();
    try {
      const order = await this.orderRepository.create(request);

      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
        }),
      );

      // await session.commitTransaction();

      return order;
    } catch (error) {
      console.log('error....', error);
      // await session.abortTransaction();
      throw error;
    }
  }
}
