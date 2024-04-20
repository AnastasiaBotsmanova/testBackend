import {injectable} from 'inversify';
import 'reflect-metadata';

export interface Price {
  id: number,
  goodId: number,
  storeId: number,
  amount: number,
}

export interface IPricesService {
  list: () => Price[],
  create: (price: Omit<Price, 'id'>) => Price,
  update: (price: Price) => Price,
  byId: (id: number) => Price | undefined,
  del: (id: number) => void
	getPrice: (goodId: number, storeId: number) => number,
}

@injectable()
class PricesService implements IPricesService {
  prices: Price[] = [
    {
      id: 1,
      goodId: 1,
      storeId: 1,
      amount: 50,
    },
    {
      id: 2,
      goodId: 1,
      storeId: 2,
      amount: 100,
    },
    {
      id: 3,
      goodId: 2,
      storeId: 1,
      amount: 30,
    },
    {
      id: 4,
      goodId: 2,
      storeId: 2,
      amount: 60,
    },
  ];

  list = () => this.prices;

  create = (price: Omit<Price, 'id'>) => {
    const maxId = Math.max(...this.prices.map(price => price.id));
    const id = maxId + 1;

    this.prices.push({
      ...price,
      id,
    });

    return this.byId(id) as Price;
  };

  update = (price: Price) => {
    this.prices = this.prices.map(
      curent => (curent.id === price.id ? price : curent),
    );

    return this.byId(price.id) as Price;
  };

  byId = (id: number) => this.prices.find(price => price.id === id);

  del = (id: number) => {
    this.prices = this.prices.filter(price => price.id !== id);
  };

	getPrice = (goodId: number, storeId: number) =>
    this.prices.find(price => price.goodId === goodId && price.storeId === storeId)?.amount ?? 0;
}

export default PricesService;