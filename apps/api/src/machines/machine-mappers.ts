import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';

export function toMachineCreateData(dto: CreateMachineDto): Prisma.MachineCreateInput {
  return {
    name: dto.name,
    serialNumber: dto.serialNumber,
    location: dto.location,
    manufacturer: dto.manufacturer,
    model: dto.model,
    status: dto.status,
    criticality: dto.criticality,
    installedAt: toMachineDate(dto.installedAt),
    category: { connect: { id: dto.categoryId } },
  };
}

export function toMachineUpdateData(dto: UpdateMachineDto): Prisma.MachineUpdateInput {
  return {
    name: dto.name,
    serialNumber: dto.serialNumber,
    location: dto.location,
    manufacturer: dto.manufacturer,
    model: dto.model,
    status: dto.status,
    criticality: dto.criticality,
    installedAt: dto.installedAt === undefined ? undefined : toMachineDate(dto.installedAt),
    category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
  };
}

export function toMachineDate(value?: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

export function handleMachinePersistenceError(error: unknown): never {
  if (isPrismaError(error, 'P2002')) {
    throw new ConflictException('A machine with this serial number already exists');
  }
  if (isPrismaError(error, 'P2025')) {
    throw new NotFoundException('Machine not found');
  }
  throw error;
}

function isPrismaError(error: unknown, code: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}
