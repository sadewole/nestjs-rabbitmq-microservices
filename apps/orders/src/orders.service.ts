import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.dto';
import { OrdersRepository } from './order.repository';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BILLING_SERVICE } from '@app/common';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async getOrders() {
    return this.orderRepository.find({});
  }

  async createOrder(request: CreateOrderRequest, authentication: string) {
    try {
      const order = await this.orderRepository.create(request);

      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
          Authentication: authentication,
        }),
      );

      return order;
    } catch (error) {
      throw error;
    }
  }
}
