/**
 * Base Repository Interface
 * Defines common CRUD operations that all repositories should implement
 */
export interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
    findAll(): Promise<T[]>;
}

/**
 * Abstract Base Repository Class
 * Can be extended by specific repositories
 */
export abstract class BaseRepository<T> implements IRepository<T> {
    abstract findById(id: string): Promise<T | null>;
    abstract create(data: Partial<T>): Promise<T>;
    abstract update(id: string, data: Partial<T>): Promise<T>;
    abstract delete(id: string): Promise<void>;
    abstract findAll(): Promise<T[]>;
}
