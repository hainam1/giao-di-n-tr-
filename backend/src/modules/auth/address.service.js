import { AppError } from '../../core/errorHandler.js';
import { addressRepository } from '../../repositories/address.repository.js';

export class AddressService {
  constructor(repository = addressRepository) {
    this.addresses = repository;
  }

  list(userId) {
    return this.addresses.list(userId);
  }

  create(userId, data) {
    return this.addresses.create(userId, data);
  }

  async update(userId, id, data) {
    const address = await this.addresses.update(id, userId, data);
    if (!address) throw new AppError('Không tìm thấy địa chỉ', 404);
    return address;
  }

  async delete(userId, id) {
    const address = await this.addresses.delete(id, userId);
    if (!address) throw new AppError('Không tìm thấy địa chỉ', 404);
    return address;
  }
}

export const addressService = new AddressService();
