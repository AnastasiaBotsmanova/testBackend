import {injectable} from 'inversify';
import 'reflect-metadata';
import {inject} from 'inversify';
import {IPricesService} from './PricesService';
import {Service} from './types';

export interface Order {
  id: number,
  goodId: number,
  storeId: number,
  quantity: number,
  total: number,
}

export interface IOrdersService {
	list: () => Order[],
  create: (order: Omit<Order, 'id' | 'total'>) => Order,
  update: (order: Omit<Order, 'total'>) => Order,
  byId: (id: number) => Order | undefined,
  del: (id: number) => void
}

@injectable()
class OrdersService implements IOrdersService {
  orders: Order[] = [
    {
      id: 1,
      goodId: 1,
      storeId: 1,
      quantity: 5,
      total: 250,
    },
    {
      id: 2,
      goodId: 1,
      storeId: 2,
      quantity: 10,
      total: 1000,
    },
  ];

  pricesService: IPricesService;

  constructor(@inject(Service.Prices) pricesService: IPricesService) {
    this.pricesService = pricesService;
  }

  list = () => this.orders;

  create = (order: Omit<Order, 'id' | 'total'>) => {
    const maxId = Math.max(...this.orders.map(order => order.id));
    const id = maxId + 1;

    const price = this.pricesService.getPrice(order.goodId, order.storeId);

    this.orders.push({
      ...order,
      id,
      total: order.quantity * price,
    });

    return this.byId(id) as Order;
  };

	update = (order: Omit<Order, 'total'>) => {
    const price = this.pricesService.getPrice(order.goodId, order.storeId);

    this.orders = this.orders.map(
      curent => (curent.id === order.id ? {...order, total: order.quantity * price} : curent),
    );

    return this.byId(order.id) as Order;
  };

	byId = (id: number) => this.orders.find(order => order.id === id);

  del = (id: number) => {
    this.orders = this.orders.filter(order => order.id !== id);
  };
}

export default OrdersService;