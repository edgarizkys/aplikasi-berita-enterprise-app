import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { articleService } from '../services/articleService';
import { createArticleSchema, updateArticleSchema, queryArticlesSchema } from '../schemas/articleSchemas';
import { PaginationMeta } from '../types/pagination';

export const articlesController = {
  /**
   * Get all articles with pagination, filtering, and search
   */
  getAllArticles: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const validatedQuery = queryArticlesSchema.parse(req.query);

    const { data, total, page, limit } = await articleService.getAllArticles(
      tenantId,
      validatedQuery
    );

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    res.json({
      success: true,
      data,
      meta,
    });
  }),

  /**
   * Get single article by ID
   */
  getArticleById: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      throw new AppError('ID artikel tidak valid', 400, 'INVALID_ARTICLE_ID');
    }

    const article = await articleService.getArticleById(tenantId, Number(id));

    if (!article) {
      throw new AppError('Artikel tidak ditemukan', 404, 'ARTICLE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: article,
    });
  }),

  /**
   * Create new article
   */
  createArticle: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const userId = (req as any).userId;

    const validatedData = createArticleSchema.parse(req.body);

    const article = await articleService.createArticle(
      tenantId,
      userId,
      validatedData
    );

    res.status(201).json({
      success: true,
      data: article,
      meta: {
        message: 'Artikel berhasil dibuat',
      },
    });
  }),

  /**
   * Update article
   */
  updateArticle: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!id || isNaN(Number(id))) {
      throw new AppError('ID artikel tidak valid', 400, 'INVALID_ARTICLE_ID');
    }

    const validatedData = updateArticleSchema.parse(req.body);

    const article = await articleService.updateArticle(
      tenantId,
      Number(id),
      userId,
      validatedData
    );

    res.json({
      success: true,
      data: article,
      meta: {
        message: 'Artikel berhasil diperbarui',
      },
    });
  }),

  /**
   * Soft delete article
   */
  deleteArticle: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      throw new AppError('ID artikel tidak valid', 400, 'INVALID_ARTICLE_ID');
    }

    await articleService.deleteArticle(tenantId, Number(id));

    res.json({
      success: true,
      data: null,
      meta: {
        message: 'Artikel berhasil dihapus',
      },
    });
  }),

  /**
   * Get featured articles
   */
  getFeaturedArticles: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const articles = await articleService.getFeaturedArticles(tenantId, limit);

    res.json({
      success: true,
      data: articles,
      meta: {
        total: articles.length,
      },
    });
  }),

  /**
   * Get articles by category
   */
  getArticlesByCategory: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { category } = req.params;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!category || category.trim().length === 0) {
      throw new AppError('Kategori tidak valid', 400, 'INVALID_CATEGORY');
    }

    const { data, total } = await articleService.getArticlesByCategory(
      tenantId,
      category,
      page,
      limit
    );

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    res.json({
      success: true,
      data,
      meta,
    });
  }),

  /**
   * Get articles by author
   */
  getArticlesByAuthor: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { authorId } = req.params;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!authorId || isNaN(Number(authorId))) {
      throw new AppError('ID penulis tidak valid', 400, 'INVALID_AUTHOR_ID');
    }

    const { data, total } = await articleService.getArticlesByAuthor(
      tenantId,
      Number(authorId),
      page,
      limit
    );

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    res.json({
      success: true,
      data,
      meta,
    });
  }),

  /**
   * Publish scheduled article
   */
  publishArticle: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      throw new AppError('ID artikel tidak valid', 400, 'INVALID_ARTICLE_ID');
    }

    const article = await articleService.publishArticle(tenantId, Number(id));

    res.json({
      success: true,
      data: article,
      meta: {
        message: 'Artikel berhasil dipublikasikan',
      },
    });
  }),

  /**
   * Increment article view count
   */
  incrementViewCount: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      throw new AppError('ID artikel tidak valid', 400, 'INVALID_ARTICLE_ID');
    }

    const article = await articleService.incrementViewCount(tenantId, Number(id));

    res.json({
      success: true,
      data: article,
    });
  }),

  /**
   * Toggle featured status
   */
  toggleFeatured: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { id } = req.params;
    const { featured } = req.body;

    if (!id || isNaN(Number(id))) {
      throw new AppError('ID artikel tidak valid', 400, 'INVALID_ARTICLE_ID');
    }

    if (typeof featured !== 'boolean') {
      throw new AppError('Status unggulan harus boolean', 400, 'INVALID_FEATURED_STATUS');
    }

    const article = await articleService.toggleFeatured(tenantId, Number(id), featured);

    res.json({
      success: true,
      data: article,
      meta: {
        message: `Artikel ${featured ? 'ditandai' : 'dihapus'} sebagai unggulan`,
      },
    });
  }),

  /**
   * Search articles
   */
  searchArticles: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { q } = req.query;
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!q || (typeof q === 'string' && q.trim().length < 2)) {
      throw new AppError('Query pencarian minimal 2 karakter', 400, 'INVALID_SEARCH_QUERY');
    }

    const { data, total } = await articleService.searchArticles(
      tenantId,
      q as string,
      page,
      limit
    );

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };

    res.json({
      success: true,
      data,
      meta,
    });
  }),

  /**
   * Get article analytics
   */
  getArticleAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.headers['x-tenant-id'] as string || 'default_tenant';
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      throw new AppError('ID artikel tidak valid', 400, 'INVALID_ARTICLE_ID');
    }

    const analytics = await articleService.getArticleAnalytics(tenantId, Number(id));

    res.json({
      success: true,
      data: analytics,
    });
  }),
};