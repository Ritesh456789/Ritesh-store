import { createContext, useContext, useReducer, useEffect } from "react";
import { useProductContext } from "./productcontex";
import reducer from "../reducer/filterReducer";

const FilterContext = createContext();

const initialState = {
  filter_products: [],
  all_products: [],
  grid_view: true,
  sorting_value: "lowest",
  filters: {
    text: "",
    category: "all",
    company: "all",
    color: "all",
    maxPrice: 0,
    price: 0,
    minPrice: 0,
  },
};

export const FilterContextProvider = ({ children }) => {
  const { products, isLoading, isError } = useProductContext();

  const [state, dispatch] = useReducer(reducer, initialState);

  // Debug: Log products received from product context
  useEffect(() => {
    console.log("FilterContext - Products received:", products);
    console.log("FilterContext - Products count:", products?.length || 0);
    console.log("FilterContext - isLoading:", isLoading);
    console.log("FilterContext - isError:", isError);
  }, [products, isLoading, isError]);

  // to set the grid view
  const setGridView = () => {
    return dispatch({ type: "SET_GRID_VIEW" });
  };

  // to set the list view
  const setListView = () => {
    return dispatch({ type: "SET_LIST_VIEW" });
  };

  // sorting function
  const sorting = (event) => {
    let userValue = event.target.value;
    dispatch({ type: "GET_SORT_VALUE", payload: userValue });
  };

  // update the filter values
  const updateFilterValue = (event) => {
    let name = event.target.name;
    let value = event.target.value;

    return dispatch({ type: "UPDATE_FILTERS_VALUE", payload: { name, value } });
  };

  // to clear the filter
  const clearFilters = () => {
    dispatch({ type: "CLEAR_FILTERS" });
  };

  // to sort the product
  useEffect(() => {
    // Only filter and sort if we have products loaded
    if (state.all_products.length > 0) {
      console.log("FilterContext - Running FILTER_PRODUCTS and SORTING_PRODUCTS");
      console.log("FilterContext - all_products count:", state.all_products.length);
      dispatch({ type: "FILTER_PRODUCTS" });
      dispatch({ type: "SORTING_PRODUCTS" });
    } else {
      console.log("FilterContext - Skipping filter/sort, no products loaded yet. all_products.length:", state.all_products.length);
    }
  }, [state.all_products.length, state.sorting_value, state.filters]);

  // to load all the products for grid and list view
  useEffect(() => {
    console.log("FilterContext - Dispatching LOAD_FILTER_PRODUCTS with:", products);
    console.log("FilterContext - Products type:", typeof products);
    console.log("FilterContext - Is array:", Array.isArray(products));
    
    if (products && Array.isArray(products) && products.length > 0) {
      console.log("FilterContext - Loading products, count:", products.length);
      dispatch({ type: "LOAD_FILTER_PRODUCTS", payload: products });
    } else if (products && Array.isArray(products) && products.length === 0) {
      console.warn("FilterContext - Products array is empty");
      // Clear products if API returned empty array
      dispatch({ type: "LOAD_FILTER_PRODUCTS", payload: [] });
    } else {
      console.warn("FilterContext - No products to load or products is not an array:", products);
    }
  }, [products]);

  return (
    <FilterContext.Provider
      value={{
        ...state,
        setGridView,
        setListView,
        sorting,
        updateFilterValue,
        clearFilters,
      }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  return useContext(FilterContext);
};