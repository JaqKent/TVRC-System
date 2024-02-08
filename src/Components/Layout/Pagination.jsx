// Componente Pagin (actualizado)
import React, { useState, useEffect } from 'react';
import { Pagination } from 'react-bootstrap';

function Pagin({ items, pageSize, onChangePage }) {
  const [pager, setPager] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    updatePage(1);
  }, [items, pageSize]);

  const updatePage = (page) => {
    const totalPages = Math.ceil(items.length / pageSize);

    if (page < 1 || page > totalPages) {
      return;
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, items.length - 1);
    const pageOfItems = items.slice(startIndex, endIndex + 1);

    const startPage = totalPages <= 10 ? 1 : Math.max(1, page - 5);
    const endPage =
      totalPages <= 10 ? totalPages : Math.min(totalPages, page + 4);

    const pages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    setPager({
      totalItems: items.length,
      currentPage: page,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages,
    });

    setCurrentPage(page);
    onChangePage(pageOfItems);
  };

  if (!pager.pages || pager.pages.length <= 1) {
    return null;
  }

  return (
    <Pagination className='m-0 p-0'>
      <Pagination.First
        disabled={pager.currentPage === 1}
        onClick={() => updatePage(1)}
      />
      <Pagination.Prev
        disabled={pager.currentPage === 1}
        onClick={() => updatePage(pager.currentPage - 1)}
      />
      {pager.pages.map((page, index) => (
        <Pagination.Item
          onClick={() => updatePage(page)}
          active={pager.currentPage === page}
          key={index}
        >
          {page}
        </Pagination.Item>
      ))}
      <Pagination.Next
        disabled={pager.currentPage === pager.totalPages}
        onClick={() => updatePage(pager.currentPage + 1)}
      />
      <Pagination.Last
        disabled={pager.currentPage === pager.totalPages}
        onClick={() => updatePage(pager.totalPages)}
      />
    </Pagination>
  );
}

export default Pagin;
