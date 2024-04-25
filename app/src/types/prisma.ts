import { Prisma } from "@prisma/client";

export type PrismaResult<T> = Prisma.Result<T, undefined, 'create'>;