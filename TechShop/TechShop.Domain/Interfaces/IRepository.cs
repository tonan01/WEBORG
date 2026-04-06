using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace TechShop.Domain.Interfaces;

public interface IRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> GetAllWithIncludesAsync(params Expression<Func<T, object>>[] includes);
    Task<T?> GetByIdAsync(int id);
    Task<T?> GetByIdWithIncludesAsync(int id, params Expression<Func<T, object>>[] includes);
    Task<T?> GetByIdIgnoreFiltersAsync(int id);

    /// <summary>Lấy IQueryable để phân trang/lọc tại Database level</summary>
    IQueryable<T> GetQueryable(params Expression<Func<T, object>>[] includes);

    /// <summary>Lấy IQueryable bypass Soft Delete filters</summary>
    IQueryable<T> GetQueryableIgnoreFilters(params Expression<Func<T, object>>[] includes);

    /// <summary>Bypass Global Query Filter (soft delete) — chỉ dùng cho Admin</summary>
    Task<IEnumerable<T>> GetAllIgnoreFiltersAsync(params Expression<Func<T, object>>[] includes);

    Task AddAsync(T entity, bool saveChanges = true);
    Task UpdateAsync(T entity, bool saveChanges = true);
    Task DeleteAsync(int id, bool saveChanges = true);
    Task RestoreAsync(int id, bool saveChanges = true);
    Task SaveChangesAsync();

    // Transactions
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
