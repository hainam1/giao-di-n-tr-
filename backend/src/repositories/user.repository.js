import { BaseRepository } from './base.repository.js';

export class UserRepository extends BaseRepository {
  constructor(client) {
    super('user', client);
  }

  findByEmail(email) {
    return this.model.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  findActiveById(id) {
    return this.model.findFirst({
      where: { id, status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        note: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  markLogin(id, at = new Date()) {
    return this.model.update({
      where: { id },
      data: { lastLoginAt: at },
    });
  }

  createUser(data) {
    return this.model.create({ data });
  }

  updateProfile(id, data) {
    return this.model.update({ where: { id }, data });
  }
}

export const userRepository = new UserRepository();
