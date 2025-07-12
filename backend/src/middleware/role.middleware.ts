import { Response, NextFunction, Request } from 'express';
import { UserRole } from '../config/auth';

export const requireRole = (roles: UserRole[]) => {
  
};