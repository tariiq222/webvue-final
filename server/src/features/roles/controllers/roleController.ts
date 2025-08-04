/**
 * 👑 Role Controller
 * متحكم الأدوار
 * 
 * HTTP request handlers for role and permission management endpoints.
 */

import { Request, Response } from 'express';
import { RoleService } from '../services/roleService';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { sendSuccess, sendCreated, sendDeleted, sendPaginatedResponse } from '@/shared/utils/response';

const roleService = new RoleService();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags: [Roles]
 *     summary: Get all roles
 *     description: Retrieve all roles with pagination and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for role name or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, description, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const result = await roleService.getRoles(req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
 *     description: Retrieve a specific role by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       404:
 *         description: Role not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const role = await roleService.getRoleById(id);
  sendSuccess(res, { role }, 'Role retrieved successfully');
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create new role
 *     description: Create a new role with permissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissionIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: Content Editor
 *               description:
 *                 type: string
 *                 example: Role for content editing operations
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["perm-id-1", "perm-id-2"]
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Role name already exists
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.createRole(req.body);
  sendCreated(res, { role }, 'Role created successfully');
});

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update role
 *     description: Update an existing role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Content Editor
 *               description:
 *                 type: string
 *                 example: Role for content editing operations
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["perm-id-1", "perm-id-2"]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Validation error or system role
 *       404:
 *         description: Role not found
 *       409:
 *         description: Role name already exists
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const role = await roleService.updateRole(id, req.body);
  sendSuccess(res, { role }, 'Role updated successfully');
});

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete role
 *     description: Delete an existing role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       400:
 *         description: Cannot delete system role or role in use
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await roleService.deleteRole(id);
  sendDeleted(res, 'Role deleted successfully');
});

/**
 * @swagger
 * /api/roles/permissions:
 *   get:
 *     tags: [Roles]
 *     summary: Get all permissions
 *     description: Retrieve all available permissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for permission name, resource, or action
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, resource, action, createdAt]
 *           default: resource
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getPermissions = asyncHandler(async (req: Request, res: Response) => {
  const result = await roleService.getPermissions(req.query);
  sendPaginatedResponse(res, result.data, result.pagination, result.message);
});

/**
 * @swagger
 * /api/roles/stats:
 *   get:
 *     tags: [Roles]
 *     summary: Get role statistics
 *     description: Retrieve role and permission statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role statistics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
export const getRoleStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await roleService.getRoleStats();
  sendSuccess(res, { stats }, 'Role statistics retrieved successfully');
});
