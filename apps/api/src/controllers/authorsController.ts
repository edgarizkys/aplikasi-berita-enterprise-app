import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../utils/appError';
import AuthorService from '../services/authorService';
import { validateRequest } from '../middleware/validateRequest';

const prisma = new PrismaClient();

// Validation schemas
const createAuthorSchema = z.object({
  name: z.string().min(3, 'Nama harus minimal 3 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  department: z.string().min(2, 'Departemen harus minimal 2 karakter').max(50),
  bio: z.string().max(1000, 'Biografi maksimal 1000 karakter').optional().nullable(),
  role: z.enum(['Editor', 'Contributor', 'Admin']),
});

const updateAuthorSchema = z.object({
  name: z.string().min(3, 'Nama harus minimal 3 karakter').max(100).optional(),
  email: z.string().email('Email tidak valid').optional(),
  department: z.string().min(2, 'Departemen harus minimal 2 karakter').max(50).optional(),
  bio: z.string().max(1000, 'Biografi maksimal 1000 karakter').optional().nullable(),
  role: z.enum(['Editor', 'Contributor', 'Admin']).optional(),
});

const authorIdSchema = z.object({
  id: z.string().uuid('ID penulis tidak valid'),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(20),
  search: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
});

class AuthorsController {
  private authorService: AuthorService;

  constructor() {
    this.authorService = new AuthorService(prisma);
  }

  /**
   * Get all authors with pagination and filtering
   */
  getAllAuthors = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new AppError('Tenant ID diperlukan', 400, 'MISSING_TENANT_ID');
    }

    const { page, limit, search, department, role } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    const filters: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      filters.department = { contains: department, mode: 'insensitive' };
    }

    if (role) {
      filters.role = role;
    }

    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        where: filters,
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          bio: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.author.count({ where: filters }),
    ]);

    res.json({
      success: true,
      data: authors,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  });

  /**
   * Get single author by ID
   */
  getAuthorById = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new AppError('Tenant ID diperlukan', 400, 'MISSING_TENANT_ID');
    }

    const { id } = authorIdSchema.parse(req.params);

    const author = await prisma.author.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!author) {
      throw new AppError('Penulis tidak ditemukan', 404, 'AUTHOR_NOT_FOUND');
    }

    res.json({
      success: true,
      data: author,
    });
  });

  /**
   * Create new author
   */
  createAuthor = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new AppError('Tenant ID diperlukan', 400, 'MISSING_TENANT_ID');
    }

    const validatedData = createAuthorSchema.parse(req.body);

    // Check if email already exists in tenant
    const existingAuthor = await prisma.author.findFirst({
      where: {
        email: validatedData.email,
        tenantId,
        deletedAt: null,
      },
    });

    if (existingAuthor) {
      throw new AppError('Email sudah terdaftar', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const author = await prisma.author.create({
      data: {
        tenantId,
        name: validatedData.name,
        email: validatedData.email,
        department: validatedData.department,
        bio: validatedData.bio || null,
        role: validatedData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: author,
      meta: {
        message: 'Penulis berhasil dibuat',
      },
    });
  });

  /**
   * Update author
   */
  updateAuthor = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new AppError('Tenant ID diperlukan', 400, 'MISSING_TENANT_ID');
    }

    const { id } = authorIdSchema.parse(req.params);
    const validatedData = updateAuthorSchema.parse(req.body);

    // Check if author exists
    const existingAuthor = await prisma.author.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!existingAuthor) {
      throw new AppError('Penulis tidak ditemukan', 404, 'AUTHOR_NOT_FOUND');
    }

    // Check if email is being updated and already exists
    if (validatedData.email && validatedData.email !== existingAuthor.email) {
      const emailExists = await prisma.author.findFirst({
        where: {
          email: validatedData.email,
          tenantId,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new AppError('Email sudah terdaftar', 409, 'EMAIL_ALREADY_EXISTS');
      }
    }

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: author,
      meta: {
        message: 'Penulis berhasil diperbarui',
      },
    });
  });

  /**
   * Delete author (soft delete)
   */
  deleteAuthor = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new AppError('Tenant ID diperlukan', 400, 'MISSING_TENANT_ID');
    }

    const { id } = authorIdSchema.parse(req.params);

    // Check if author exists
    const existingAuthor = await prisma.author.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!existingAuthor) {
      throw new AppError('Penulis tidak ditemukan', 404, 'AUTHOR_NOT_FOUND');
    }

    // Check if author has unpublished articles
    const unpublishedArticles = await prisma.article.count({
      where: {
        authorId: id,
        status: 'draft',
        deletedAt: null,
      },
    });

    if (unpublishedArticles > 0) {
      throw new AppError(
        `Penulis memiliki ${unpublishedArticles} artikel draft yang belum dipublikasikan`,
        409,
        'AUTHOR_HAS_DRAFT_ARTICLES'
      );
    }

    await prisma.author.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: { id },
      meta: {
        message: 'Penulis berhasil dihapus',
      },
    });
  });

  /**
   * Get author statistics
   */
  getAuthorStats = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new AppError('Tenant ID diperlukan', 400, 'MISSING_TENANT_ID');
    }

    const { id } = authorIdSchema.parse(req.params);

    const author = await prisma.author.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!author) {
      throw new AppError('Penulis tidak ditemukan', 404, 'AUTHOR_NOT_FOUND');
    }

    const [totalArticles, publishedArticles, draftArticles, totalViews] = await Promise.all([
      prisma.article.count({
        where: {
          authorId: id,
          deletedAt: null,
        },
      }),
      prisma.article.count({
        where: {
          authorId: id,
          status: 'published',
          deletedAt: null,
        },
      }),
      prisma.article.count({
        where: {
          authorId: id,
          status: 'draft',
          deletedAt: null,
        },
      }),
      prisma.article.aggregate({
        where: {
          authorId: id,
          deletedAt: null,
        },
        _sum: {
          views: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        authorId: id,
        authorName: author.name,
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews: totalViews._sum.views || 0,
      },
    });
  });
}

export default AuthorsController;