import { ConflictException, NotFoundException } from '@nestjs/common';

export function rethrowPartPersistenceError(error: unknown): never {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')
    throw new ConflictException('A part with that SKU already exists');
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025')
    throw new NotFoundException('Part not found');
  throw error;
}
