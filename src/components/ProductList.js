import React from 'react'
import { useFilterContext } from '../context/filter_context';
import GridView from './GridView';
import ListView from './ListView';

const ProductList = () => {
    const {filter_products, grid_view, all_products} = useFilterContext();
  
    console.log("ProductList - filter_products count:", filter_products?.length || 0);
    console.log("ProductList - all_products count:", all_products?.length || 0);
    console.log("ProductList - grid_view:", grid_view);
    console.log("ProductList - filter_products:", filter_products);
  
    // Show debug info if no products
    if (!filter_products || filter_products.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>No products to display</h3>
                <p>All products count: {all_products?.length || 0}</p>
                <p>Filtered products count: {filter_products?.length || 0}</p>
                <p>Check the browser console for more details</p>
            </div>
        );
    }
  
    if(grid_view === true )
    {
        return <GridView products={filter_products}/>;
    }   

    if(grid_view === false )
    {
        return <ListView products={filter_products}/>;
    }

    return null;
}

export default ProductList


