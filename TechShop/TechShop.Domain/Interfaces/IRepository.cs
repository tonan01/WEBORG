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

    /// <summary>Query DB trực tiếp — không load cả bảng vào memory</summary>
    Task<T?> FindAsync(Expression<Func<T, bool>> predicate);

    /// <summary>Query nhiều row theo predicate — không load cả bảng vào memory</summary>
    Task<IEnumerable<T>> FindAllAsync(Expression<Func<T, bool>> predicate);

    /// <summary>Bypass Global Query Filter (soft delete) — chỉ dùng cho Admin</summary>
    Task<IEnumerable<T>> GetAllIgnoreFiltersAsync();

    Task AddAsync(T entity, bool saveChanges = true);
    Task UpdateAsync(T entity, bool saveChanges = true);
    Task DeleteAsync(int id, bool saveChanges = true);
    Task SaveChangesAsync();

    // Transactions
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
