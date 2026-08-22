import prisma from '../database/prismaClient.js';

export class BaseRepository {
  constructor(modelName, client = prisma) {
    if (!client[modelName]) {
      throw new TypeError(`Unknown Prisma model: ${modelName}`);
    }
    this.client = client;
    this.model = client[modelName];
  }

  findById(id, options = {}) {
    return this.model.findUnique({ where: { id }, ...options });
  }

  findMany(args = {}) {
    return this.model.findMany(args);
  }

  create(data, options = {}) {
    return this.model.create({ data, ...options });
  }

  updateById(id, data, options = {}) {
    return this.model.update({ where: { id }, data, ...options });
  }

  deleteById(id, options = {}) {
    return this.model.delete({ where: { id }, ...options });
  }

  count(where = {}) {
    return this.model.count({ where });
  }
}
