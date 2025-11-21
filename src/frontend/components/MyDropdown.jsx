import { useState } from 'react';

function MyDropdown( {options = []} ) {
    const [selectedValue, setSelectedValue] = useState('');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    return (
        <div>
            <label htmlFor="apiDropdown">Select a Category:</label>
            <select id="apiDropdown" value={selectedValue} onChange={handleChange}>
                <option value="">Please choose</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
            {selectedValue && <p>You selected: {selectedValue}</p>}
        </div>
    );
}

export default MyDropdown;