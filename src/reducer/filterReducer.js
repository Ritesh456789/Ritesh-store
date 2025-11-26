const filterReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_FILTER_PRODUCTS":
      // Safety check: ensure payload is an array
      if (!Array.isArray(action.payload)) {
        console.warn("No products to load or invalid payload:", action.payload);
        return {
          ...state,
          filter_products: [],
          all_products: [],
        };
      }

      if (action.payload.length === 0) {
        console.warn("Empty products array received");
        return {
          ...state,
          filter_products: [],
          all_products: [],
        };
      }

      // Filter out any products without valid prices
      const validProducts = action.payload.filter(p => p && typeof p.price === 'number' && !isNaN(p.price));
      
      if (validProducts.length === 0) {
        console.warn("No products with valid prices found");
        return {
          ...state,
          filter_products: [],
          all_products: [],
        };
      }

      let priceArr = validProducts.map((curElem) => curElem.price);
      console.log("Price array:", priceArr);

      // Calculate maxPrice
      let maxPrice = Math.max(...priceArr);
      console.log("Calculated maxPrice:", maxPrice);
      
      // Ensure maxPrice is valid
      if (!maxPrice || isNaN(maxPrice) || maxPrice <= 0) {
        console.error("Invalid maxPrice calculated:", maxPrice);
        maxPrice = Math.max(...priceArr.filter(p => p > 0));
      }

      console.log("LOAD_FILTER_PRODUCTS - Setting products. Count:", validProducts.length);
      console.log("LOAD_FILTER_PRODUCTS - maxPrice:", maxPrice);
      
      return {
        ...state,
        filter_products: [...validProducts], // Set filter_products immediately to show products
        all_products: [...validProducts],
        filters: { ...state.filters, maxPrice, price: maxPrice },
      };

    case "SET_GRID_VIEW":
      return {
        ...state,
        grid_view: true,
      };

    case "SET_LIST_VIEW":
      return {
        ...state,
        grid_view: false,
      };

    case "GET_SORT_VALUE":
      // let userSortValue = document.getElementById("sort");
      // let sort_value = userSortValue.options[userSortValue.selectedIndex].value;
      return {
        ...state,
        sorting_value: action.payload,
      };

    case "SORTING_PRODUCTS":
      let newSortData;
      // let tempSortProduct = [...action.payload];

      const { filter_products, sorting_value } = state;
      let tempSortProduct = [...filter_products];

      const sortingProducts = (a, b) => {
        if (sorting_value === "lowest") {
          return a.price - b.price;
        }

        if (sorting_value === "highest") {
          return b.price - a.price;
        }

        if (sorting_value === "a-z") {
          return a.name.localeCompare(b.name);
        }

        if (sorting_value === "z-a") {
          return b.name.localeCompare(a.name);
        }
      };

      newSortData = tempSortProduct.sort(sortingProducts);

      return {
        ...state,
        filter_products: newSortData,
      };

    case "UPDATE_FILTERS_VALUE":
      const { name, value } = action.payload;

      return {
        ...state,
        filters: {
          ...state.filters,
          [name]: value,
        },
      };

    case "FILTER_PRODUCTS":
      let { all_products } = state;
      
      // If no products, return empty array
      if (!all_products || all_products.length === 0) {
        console.log("FILTER_PRODUCTS - No products to filter");
        return {
          ...state,
          filter_products: [],
        };
      }
      
      let tempFilterProduct = [...all_products];

      console.log("FILTER_PRODUCTS - all_products count:", all_products.length);
      console.log("FILTER_PRODUCTS - filters:", state.filters);

      const { text, category, company, color, price } = state.filters;

      if (text) {
        tempFilterProduct = tempFilterProduct.filter((curElem) => {
          return curElem.name && curElem.name.toLowerCase().includes(text.toLowerCase());
        });
        console.log("After text filter:", tempFilterProduct.length);
      }

      if (category !== "all") {
        tempFilterProduct = tempFilterProduct.filter(
          (curElem) => curElem.category === category
        );
        console.log("After category filter:", tempFilterProduct.length);
      }

      if (company !== "all") {
        tempFilterProduct = tempFilterProduct.filter(
          (curElem) => curElem.company && curElem.company.toLowerCase() === company.toLowerCase()
        );
        console.log("After company filter:", tempFilterProduct.length);
      }

      if (color !== "all") {
        tempFilterProduct = tempFilterProduct.filter((curElem) =>
          curElem.colors && Array.isArray(curElem.colors) && curElem.colors.includes(color)
        );
        console.log("After color filter:", tempFilterProduct.length);
      }

      // Only filter by price if price is greater than 0
      // When price is 0, it means no price filter is applied (show all products)
      if (price > 0) {
        tempFilterProduct = tempFilterProduct.filter(
          (curElem) => curElem.price != null && curElem.price <= price
        );
        console.log("After price filter:", tempFilterProduct.length);
      }
      
      console.log("FILTER_PRODUCTS - Final filtered count:", tempFilterProduct.length);
      
      return {
        ...state,
        filter_products: tempFilterProduct,
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          text: "",
          category: "all",
          company: "all",
          color: "all",
          // Preserve maxPrice, reset price to maxPrice to show all products
          price: state.filters.maxPrice || 0,
          minPrice: 0,
        },
      };

    default:
      return state;
  }
};

export default filterReducer;