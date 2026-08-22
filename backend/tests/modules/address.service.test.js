import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressService } from '../../src/modules/auth/address.service.js';

describe('AddressService', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    service = new AddressService(repository);
  });

  it('scopes list and create operations to the authenticated user', async () => {
    repository.list.mockResolvedValue([]);
    repository.create.mockResolvedValue({ id: 'address-1' });
    await service.list('user-1');
    await service.create('user-1', { recipient: 'User' });
    expect(repository.list).toHaveBeenCalledWith('user-1');
    expect(repository.create).toHaveBeenCalledWith('user-1', { recipient: 'User' });
  });

  it('does not expose another user address through update or delete', async () => {
    repository.update.mockResolvedValue(null);
    repository.delete.mockResolvedValue(null);
    await expect(service.update('user-1', 'address-2', { label: 'Nhà' })).rejects.toMatchObject({ statusCode: 404 });
    await expect(service.delete('user-1', 'address-2')).rejects.toMatchObject({ statusCode: 404 });
  });
});
