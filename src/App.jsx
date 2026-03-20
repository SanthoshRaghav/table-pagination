import { useEffect, useRef, useState } from 'react';
import './App.css';

const PAGE_SIZE = 10;

export default function App() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const abortControllerRef = useRef(null);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const fetchProducts = async (ignoreRef, limit = PAGE_SIZE) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const skip = (currentPage - 1) * limit;

    try {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 2000));
      const response = await fetch(
        `https://dummyjson.com/products?limit=${limit}&skip=${skip}`,
        { signal: controller.signal }
      );
      const data = await response.json();
      if (!ignoreRef.current) {
        setProducts(data.products);
        setTotalItems(data.total);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    } finally {
      if (!ignoreRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const ignoreRef = { current: false };
    fetchProducts(ignoreRef);

    return () => {
      ignoreRef.current = true;
      abortControllerRef.current?.abort();
    };
  }, [currentPage]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <section className="container">
      <h1 className="title">Products</h1>
      <p className="meta">
        {totalItems} products · page {currentPage} of {totalPages}
      </p>
      <div className="table-wrapper">
        <Table products={products} isLoading={isLoading} />
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        isLoading={isLoading}
      />
    </section>
  );
}

const Table = function Table({ products, isLoading }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Product</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={5} className="table-status">
              Loading...
            </td>
          </tr>
        ) : (
          products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{p.category}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

const Pagination = function Pagination({
  totalPages,
  handlePageChange,
  currentPage,
  isLoading,
}) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <ul className="pagination-list">
      {pageNumbers.map((pageNumber) => (
        <li key={pageNumber}>
          <button
            disabled={isLoading}
            className={`pagination-item${
              currentPage === pageNumber ? ' active' : ''
            }`}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        </li>
      ))}
    </ul>
  );
};
