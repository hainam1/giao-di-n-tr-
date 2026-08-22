import prisma from '../../database/prismaClient.js';

export const getAllSamplesService = async (query) => prisma.sampleItem.findMany({
  where: {
    ...(query.status && { status: query.status }),
    ...(query.search && { title: { contains: query.search, mode: 'insensitive' } }),
  },
  orderBy: { createdAt: 'desc' },
});

export const getSampleByIdService = async (id) =>
  prisma.sampleItem.findUnique({ where: { id } });

export const createSampleService = async (data) =>
  prisma.sampleItem.create({ data });

export const updateSampleService = async (id, data) => {
  const exists = await prisma.sampleItem.findUnique({ where: { id }, select: { id: true } });
  return exists ? prisma.sampleItem.update({ where: { id }, data }) : null;
};

export const deleteSampleService = async (id) => {
  const deleted = await prisma.sampleItem.deleteMany({ where: { id } });
  return deleted.count > 0;
};
