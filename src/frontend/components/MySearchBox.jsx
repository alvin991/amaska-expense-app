import { useState } from 'react';

function MySearchBox({ onQueryChange, placeholder = 'Search Merchant, Category or Payment Method' }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onQueryChange?.(value);
  };

  return (
    <div className="container" style={{ padding: '1.7rem' }}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}

export default MySearchBox;