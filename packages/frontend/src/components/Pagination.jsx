export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <ul className="pagination">
      {pages.map((page) => (
        <li key={page} className={`page-item${page === currentPage ? ' active' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page)}>{page}</button>
        </li>
      ))}
    </ul>
  );
}
