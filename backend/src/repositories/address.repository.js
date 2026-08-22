import prisma from '../database/prismaClient.js';

export class AddressRepository {
  constructor(client = prisma) {
    this.client = client;
  }

  list(userId) {
    return this.client.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  }

  findOwned(id, userId) {
    return this.client.address.findFirst({ where: { id, userId } });
  }

  async create(userId, data) {
    return this.client.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { userId } });
      const isDefault = data.isDefault === true || count === 0;
      if (isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
      return tx.address.create({ data: { ...data, userId, isDefault } });
    });
  }

  async update(id, userId, data) {
    return this.client.$transaction(async (tx) => {
      const address = await tx.address.findFirst({ where: { id, userId } });
      if (!address) return null;
      if (data.isDefault === true) await tx.address.updateMany({ where: { userId, isDefault: true, id: { not: id } }, data: { isDefault: false } });
      return tx.address.update({ where: { id }, data });
    });
  }

  async delete(id, userId) {
    return this.client.$transaction(async (tx) => {
      const address = await tx.address.findFirst({ where: { id, userId } });
      if (!address) return null;
      await tx.address.delete({ where: { id } });
      if (address.isDefault) {
        const replacement = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
        if (replacement) await tx.address.update({ where: { id: replacement.id }, data: { isDefault: true } });
      }
      return address;
    });
  }
}

export const addressRepository = new AddressRepository();
