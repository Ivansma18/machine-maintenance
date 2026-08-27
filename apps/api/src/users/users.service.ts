import { randomBytes, scrypt } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuditContext } from '../audit/audit.types';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';

const userInclude = {
  roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
} satisfies Prisma.UserInclude;

function deriveKey(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: userInclude,
      orderBy: { name: 'asc' },
    });
    return users.map((user) => this.publicUser(user));
  }

  async roles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateUserDto, context: AuditContext) {
    const roleIds = dto.roleIds ?? [];
    await this.ensureRoles(roleIds);
    const passwordHash = await this.hashPassword(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username.trim().toLowerCase(),
          email: dto.email.trim().toLowerCase(),
          name: dto.name.trim(),
          passwordHash,
          roles: { create: roleIds.map((roleId) => ({ role: { connect: { id: roleId } } })) },
        },
        include: userInclude,
      });
      await this.audit.record({
        ...context,
        action: 'user.created',
        entityType: 'User',
        entityId: user.id,
        after: this.publicUser(user),
      });
      return this.publicUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ConflictException('Username or email is already in use');
      throw error;
    }
  }

  async updateStatus(id: string, isActive: boolean, context: AuditContext) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      include: userInclude,
    });
    if (!isActive)
      await this.prisma.session.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    await this.audit.record({
      ...context,
      action: isActive ? 'user.activated' : 'user.deactivated',
      entityType: 'User',
      entityId: id,
      before: existing,
      after: { isActive },
    });
    return this.publicUser(user);
  }

  async assignRoles(id: string, dto: AssignUserRolesDto, context: AuditContext) {
    const existing = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException(`User ${id} not found`);
    await this.ensureRoles(dto.roleIds);
    await this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: id } });
      if (dto.roleIds.length)
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
        });
    });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id }, include: userInclude });
    await this.audit.record({
      ...context,
      action: 'user.roles.updated',
      entityType: 'User',
      entityId: id,
      after: { roleIds: dto.roleIds },
    });
    return this.publicUser(user);
  }

  async resetPassword(id: string, context: AuditContext) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const temporaryPassword = this.generateTemporaryPassword();
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await this.hashPassword(temporaryPassword) },
    });
    await this.prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.audit.record({
      ...context,
      action: 'user.password.reset',
      entityType: 'User',
      entityId: id,
      reason: 'Manual administrative password reset',
    });
    return { temporaryPassword };
  }

  private async ensureRoles(roleIds: string[]) {
    const count = await this.prisma.role.count({ where: { id: { in: roleIds } } });
    if (count !== roleIds.length) throw new BadRequestException('One or more roles do not exist');
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('base64url');
    const key = await deriveKey(password, salt);
    return `scrypt$16384$8$1$${salt}$${key.toString('hex')}`;
  }

  private generateTemporaryPassword() {
    return `Tmp-${randomBytes(9).toString('base64url')}-9a`;
  }

  private publicUser(user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: user.roles.map(({ role }: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(({ permission }: any) => permission.key),
      })),
      permissions: [
        ...new Set(
          user.roles.flatMap(({ role }: any) =>
            role.permissions.map(({ permission }: any) => permission.key),
          ),
        ),
      ],
    };
  }
}
