import { useState,useMemo } from 'react'
import './App.css'
import InputField from './Components/Input';
import DataTable from './Components/DataTable';

interface Product {
    id: number;
    name: string;
    category: 'Electronics' | 'Apparel' | 'Home';
    price: number;
    stock: number;
}
const PRODUCTS: Product[] = [
    { id: 101, name: 'Wireless Headphones', category: 'Electronics', price: 129.99, stock: 45 },
    { id: 102, name: 'Cotton T-Shirt', category: 'Apparel', price: 29.50, stock: 150 },
    { id: 103, name: 'Smart Blender', category: 'Home', price: 79.99, stock: 12 },
    { id: 104, name: 'Gaming Mouse', category: 'Electronics', price: 49.99, stock: 78 },
    { id: 105, name: 'Throw Blanket', category: 'Home', price: 35.00, stock: 200 },
    { id: 106, name: 'Toss basket', category: 'Apparel', price: 305.00, stock: 100 }
];
interface Column<T> {
    key: string;
    title: string;
    dataIndex: keyof T;
    sortable?: boolean;
    // Optional: Render custom content for a cell (useful for buttons/links/etc.)
    render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode; 
}
function App() {
  const [inputValue,setInputValue]=useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const productColumns: Column<Product>[] = useMemo(() => [
        { key: 'col-id', title: 'ID', dataIndex: 'id', sortable: true },
        { key: 'col-name', title: 'Product Name', dataIndex: 'name', sortable: true },
        { key: 'col-category', title: 'Category', dataIndex: 'category', sortable: true,
            render: (value) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${value === 'Electronics' ? 'bg-indigo-100 text-indigo-800' : 
                      value === 'Apparel' ? 'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {value}
                </span>
            )
        },
        { key: 'col-price', title: 'Price (USD)', dataIndex: 'price', sortable: true,
            render: (value:any) => <span className="font-mono">${(value as number).toFixed(2)}</span>
        },
        { key: 'col-stock', title: 'Stock', dataIndex: 'stock', sortable: true },
    ], []);
  return (
    <div className='bg-gray-950 scheme-only-light'>
      <div>
        <InputField 
          label="User Name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          helperText="The default outlined variant."
          onClear={() => setInputValue('')}
        />
      </div>
      <div>
        <hr className='text-white m-3'/>
      </div>
      <div>
        <div className="mb-4 text-gray-700 dark:text-gray-300">
          <p className="font-semibold">Selected Products ({selectedProducts.length}):</p>
          <p className="text-sm italic">
              {selectedProducts.map(p => p.name).join(', ') || 'None'}
          </p>
        </div>
      </div>
      <div>
        <DataTable<Product>
          data={PRODUCTS}
          columns={productColumns}
          selectable={true}
          onRowSelect={setSelectedProducts}
        />
      </div>
    </div>
  )
}

export default App
