using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using TechShop.Domain.Interfaces;
using TechShop.Infrastructure.Data;

namespace TechShop.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly TechShopDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(TechShopDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    /// <summary>
    /// Eager loading — duyệt đúng cây quan hệ:
    /// ví dụ: GetAllWithIncludesAsync(p => p.Category)
    /// </summary>
    public async Task<IEnumerable<T>> GetAllWithIncludesAsync(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includes)
            query = query.Include(include);
        return await query.ToListAsync();
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    /// <summary>
    /// Eager loading cho single entity — ví dụ: Order kèm OrderDetails
    /// GetByIdWithIncludesAsync(id, o => o.OrderDetails)
    /// </summary>
    public async Task<T?> GetByIdWithIncludesAsync(int id, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includes)
            query = query.Include(include);

        // Tìm theo primary key "Id" — convention của AuditableEntity
        return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
    }

    public async Task<T?> GetByIdIgnoreFiltersAsync(int id)
    {
        return await _dbSet.IgnoreQueryFilters().FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
    }

    public IQueryable<T> GetQueryable(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includes)
            query = query.Include(include);
        return query;
    }

    public IQueryable<T> GetQueryableIgnoreFilters(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet.IgnoreQueryFilters();
        foreach (var include in includes)
            query = query.Include(include);
        return query;
    }

    /// <summary>Query DB trực tiếp — không load cả bảng vào memory</summary>
    public async Task<T?> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate);
    }

    /// <summary>Bypass Global Query Filter (soft delete) — chỉ dùng cho Admin</summary>
    public async Task<IEnumerable<T>> GetAllIgnoreFiltersAsync(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet.IgnoreQueryFilters();
        foreach (var include in includes)
            query = query.Include(include);
        return await query.ToListAsync();
    }

    /// <summary>Query nhiều row theo predicate — không load cả bảng vào memory</summary>
    public async Task<IEnumerable<T>> FindAllAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public async Task AddAsync(T entity, bool saveChanges = true)
    {
        await _dbSet.AddAsync(entity);
        if (saveChanges) await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(T entity, bool saveChanges = true)
    {
        _dbSet.Update(entity);
        if (saveChanges) await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id, bool saveChanges = true)
    {
        var entity = await GetByIdIgnoreFiltersAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            if (saveChanges) await _context.SaveChangesAsync();
        }
    }

    public async Task RestoreAsync(int id, bool saveChanges = true)
    {
        // Phải dùng IgnoreQueryFilters để tìm thấy entity đã xóa
        var entity = await _dbSet.IgnoreQueryFilters()
            .FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
            
        if (entity is TechShop.Domain.Entities.AuditableEntity auditable)
        {
            auditable.IsDeleted = false;
            auditable.DeletedDate = null;
            auditable.DeletedBy = null;
            _dbSet.Update(entity);
            if (saveChanges) await _context.SaveChangesAsync();
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    // ─── Transactions ─────────────────────────────────────────────────────────

    public async Task BeginTransactionAsync()
    {
        await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_context.Database.CurrentTransaction != null)
            await _context.Database.CommitTransactionAsync();
    }

    public async Task RollbackTransactionAsync()
    {
        if (_context.Database.CurrentTransaction != null)
            await _context.Database.RollbackTransactionAsync();
    }
}
