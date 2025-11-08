import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listBlogPosts = async (req: AuthRequest, res: Response) => {
  const posts = await prisma.blogPost.findMany({
    where: { publie: true },
    include: {
      auteur: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: posts,
  });
};

export const getBlogPostBySlug = async (req: AuthRequest, res: Response) => {
  const { slug } = req.params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      auteur: {
        include: { profile: true },
      },
    },
  });

  if (!post) {
    throw new ApiError(404, 'Article non trouvé');
  }

  if (!post.publie) {
    throw new ApiError(403, 'Article non publié');
  }

  res.json({
    success: true,
    data: post,
  });
};

export const createBlogPost = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { titre, slug, contenu, extrait, imageUrl, publie } = req.body;

  const existingPost = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (existingPost) {
    throw new ApiError(409, 'Un article avec ce slug existe déjà');
  }

  const post = await prisma.blogPost.create({
    data: {
      titre,
      slug,
      contenu,
      extrait,
      imageUrl,
      publie: publie ?? false,
      auteurId: userId!,
    },
    include: {
      auteur: {
        include: { profile: true },
      },
    },
  });

  logger.info(`Blog post created: ${post.slug}`);

  res.status(201).json({
    success: true,
    message: 'Article créé avec succès',
    data: post,
  });
};

export const updateBlogPost = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { titre, slug, contenu, extrait, imageUrl, publie } = req.body;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      titre,
      slug,
      contenu,
      extrait,
      imageUrl,
      publie,
    },
    include: {
      auteur: {
        include: { profile: true },
      },
    },
  });

  logger.info(`Blog post updated: ${post.slug}`);

  res.json({
    success: true,
    message: 'Article mis à jour avec succès',
    data: post,
  });
};

export const deleteBlogPost = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.blogPost.delete({
    where: { id },
  });

  logger.info(`Blog post deleted: ${id}`);

  res.json({
    success: true,
    message: 'Article supprimé avec succès',
  });
};
