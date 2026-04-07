import React from 'react';
import { Pagination } from 'react-bootstrap';

/**
 * Reusable Pagination Component for TechShop
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when a page is clicked
 * @param {string} size - size of pagination ('sm', 'lg', or undefined)
 * @param {boolean} autoScroll - whether to scroll to top on change
 */
const PaginationComponent = ({ currentPage, totalPages, onPageChange, size = "sm", autoScroll = true }) => {
    // Xóa bỏ return null khi totalPages <= 1 để giao diện các trang luôn đồng nhất
    // if (totalPages <= 1) return null;

    const handlePageClick = (page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
            if (autoScroll) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Logic to show a window of pages can be added here if totalPages is very large
    // For now, let's keep it simple as the project is still medium-sized
    const items = [];
    for (let number = 1; number <= totalPages; number++) {
        items.push(
            <Pagination.Item 
                key={number} 
                active={number === currentPage}
                onClick={() => handlePageClick(number)}
            >
                {number}
            </Pagination.Item>
        );
    }

    return (
        <div className="d-flex justify-content-center mt-4">
            <Pagination size={size} className="custom-pagination">
                <Pagination.First 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageClick(1)} 
                />
                <Pagination.Prev 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageClick(currentPage - 1)} 
                />
                
                {items}

                <Pagination.Next 
                    disabled={currentPage === totalPages} 
                    onClick={() => handlePageClick(currentPage + 1)} 
                />
                <Pagination.Last 
                    disabled={currentPage === totalPages} 
                    onClick={() => handlePageClick(totalPages)} 
                />
            </Pagination>
        </div>
    );
};

export default PaginationComponent;
