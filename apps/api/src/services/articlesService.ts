import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { CreateArticleSchema, UpdateArticleSchema, ListArticlesSchema } from '../schemas/articles';

const prisma = new PrismaClient();

export class ArticlesService {
  async listArticles(tenantId: string, filters: any) {
    try {
      const validatedFilters = ListArticlesSchema.parse(filters);
      const { page = 1, limit = 20, category, status, search, featured } = validatedFilters;
      const offset = (page - 1) * limit;

      const whereConditions: Prisma.ArticleWhereInput = {
        tenantId,
        deletedAt: null,
        ...(category && { category }),
        ...(status && { status }),
        ...(featured !== undefined && { featured }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where: whereConditions,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.article.count({ where: whereConditions }),
      ]);

      return {
        data: articles,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal mengambil daftar artikel', 500, 'DB_ERROR');
      }
      throw error;
    }
  }

  async getArticleById(tenantId: string, articleId: string) {
    try {
      const article = await prisma.article.findFirst({
        where: {
          id: articleId,
          tenantId,
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              bio: true,
            },
          },
          comments: {
            where: { approved: true, deletedAt: null },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!article) {
        throw new AppError('Artikel tidak ditemukan', 404, 'ARTICLE_NOT_FOUND');
      }

      // Increment views
      await prisma.article.update({
        where: { id: articleId },
        data: { views: { increment: 1 } },
      });

      return article;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal mengambil detail artikel', 500, 'DB_ERROR');
      }
      throw error;
    }
  }

  async createArticle(tenantId: string, payload: any) {
    try {
      const validatedData = CreateArticleSchema.parse(payload);
      const { title, content, authorId, category, status, publishedDate, featured } = validatedData;

      // Verify author exists and belongs to tenant
      const author = await prisma.author.findFirst({
        where: {
          id: authorId,
          tenantId,
          deletedAt: null,
        },
      });

      if (!author) {
        throw new AppError('Penulis tidak ditemukan', 404, 'AUTHOR_NOT_FOUND');
      }

      // Verify category exists
      const categoryRecord = await prisma.category.findFirst({
        where: {
          name: category,
          tenantId,
          deletedAt: null,
        },
      });

      if (!categoryRecord) {
        throw new AppError('Kategori tidak ditemukan', 404, 'CATEGORY_NOT_FOUND');
      }

      const article = await prisma.article.create({
        data: {
          tenantId,
          title,
          content,
          authorId,
          category,
          status: status || 'draft',
          publishedDate: publishedDate ? new Date(publishedDate) : null,
          featured: featured || false,
          views: 0,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return article;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new AppError('Data artikel tidak valid', 400, 'VALIDATION_ERROR');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal membuat artikel', 500, 'DB_ERROR');
      }
      throw error;
    }
  }

  async updateArticle(tenantId: string, articleId: string, payload: any) {
    try {
      const validatedData = UpdateArticleSchema.parse(payload);

      // Verify article exists
      const article = await prisma.article.findFirst({
        where: {
          id: articleId,
          tenantId,
          deletedAt: null,
        },
      });

      if (!article) {
        throw new AppError('Artikel tidak ditemukan', 404, 'ARTICLE_NOT_FOUND');
      }

      // Verify author if provided
      if (validatedData.authorId) {
        const author = await prisma.author.findFirst({
          where: {
            id: validatedData.authorId,
            tenantId,
            deletedAt: null,
          },
        });

        if (!author) {
          throw new AppError('Penulis tidak ditemukan', 404, 'AUTHOR_NOT_FOUND');
        }
      }

      // Verify category if provided
      if (validatedData.category) {
        const categoryRecord = await prisma.category.findFirst({
          where: {
            name: validatedData.category,
            tenantId,
            deletedAt: null,
          },
        });

        if (!categoryRecord) {
          throw new AppError('Kategori tidak ditemukan', 404, 'CATEGORY_NOT_FOUND');
        }
      }

      const updateData: Prisma.ArticleUpdateInput = {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.content && { content: validatedData.content }),
        ...(validatedData.authorId && { authorId: validatedData.authorId }),
        ...(validatedData.category && { category: validatedData.category }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.publishedDate && { publishedDate: new Date(validatedData.publishedDate) }),
        ...(validatedData.featured !== undefined && { featured: validatedData.featured }),
      };

      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedArticle;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new AppError('Data artikel tidak valid', 400, 'VALIDATION_ERROR');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal memperbarui artikel', 500, 'DB_ERROR');
      }
      throw error;
    }
  }

  async deleteArticle(tenantId: string, articleId: string) {
    try {
      const article = await prisma.article.findFirst({
        where: {
          id: articleId,
          tenantId,
          deletedAt: null,
        },
      });

      if (!article) {
        throw new AppError('Artikel tidak ditemukan', 404, 'ARTICLE_NOT_FOUND');
      }

      const deletedArticle = await prisma.article.update({
        where: { id: articleId },
        data: { deletedAt: new Date() },
      });

      return deletedArticle;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal menghapus artikel', 500, 'DB_ERROR');
      }
      throw error;
    }
  }

  async getFeaturedArticles(tenantId: string, limit: number = 5) {
    try {
      const articles = await prisma.article.findMany({
        where: {
          tenantId,
          featured: true,
          status: 'published',
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { publishedDate: 'desc' },
        take: limit,
      });

      return articles;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal mengambil artikel unggulan', 500, 'DB_ERROR');
      }
      throw error;
    }
  }

  async getArticlesByCategory(tenantId: string, category: string, limit: number = 10) {
    try {
      const articles = await prisma.article.findMany({
        where: {
          tenantId,
          category,
          status: 'published',
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { publishedDate: 'desc' },
        take: limit,
      });

      return articles;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal mengambil artikel berdasarkan kategori', 500, 'DB_ERROR');
      }
      throw error;
    }
  }

  async getArticlesByAuthor(tenantId: string, authorId: string, limit: number = 20) {
    try {
      const articles = await prisma.article.findMany({
        where: {
          tenantId,
          authorId,
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return articles;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError('Gagal mengambil artikel penulis', 500, 'DB_ERROR');
      }
      throw error;
    }
  }
}

export default new ArticlesService();