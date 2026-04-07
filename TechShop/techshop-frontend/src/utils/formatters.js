/**
 * Formats a number as Vietnamese Dong (VNĐ) currency.
 * @param {number} value - The numeric value to format.
 * @returns {string} - Formatted currency string.
 */
export const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
};

/**
 * Formats a date string into a localized Vietnamese date format.
 * @param {string|Date} date - The date to format.
 * @returns {string} - Formatted date string.
 */
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
