import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import reducer from "../reducer/productReducer";
import { productsData } from "../data/products";

const AppContext = createContext();

// Use local data instead of API to avoid CORS issues
// Set to false to use API (requires proxy setup)
const USE_LOCAL_DATA = false;
const API = process.env.NODE_ENV === 'production' 
  ? "https://api.pujakaitem.com/api/products"
  : "/api/products";

const initialState = {
  isLoading: false,
  isError: false,
  products: [],
  featureProducts: [],
  isSingleLoading: false,
  singleProduct: {},
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getProducts = async (url) => {
    dispatch({ type: "SET_LOADING" });
    
    // Use local data to avoid CORS issues
    if (USE_LOCAL_DATA) {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log("Using local products data");
        console.log("Products count:", productsData.length);
        
        dispatch({ type: "SET_API_DATA", payload: productsData });
      } catch (error) {
        console.error("Error loading local products:", error);
        dispatch({ type: "API_ERROR" });
      }
      return;
    }
    
    // Try API call first, fallback to local data if it fails
    try {
      console.log("🌐 Attempting to fetch from API:", url);
      console.log("📍 Full URL will be:", window.location.origin + url);
      
      const res = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log("✅ API Request successful!");
      console.log("📦 Response status:", res.status);
      console.log("📦 Response headers:", res.headers);
      const products = res.data;
      
      console.log("📊 API Response data:", products);
      console.log("📊 Products count:", Array.isArray(products) ? products.length : "Not an array");
      
      // Ensure products is an array
      if (!Array.isArray(products)) {
        console.error("❌ API did not return an array. Received:", typeof products, products);
        console.log("🔄 Falling back to local data...");
        dispatch({ type: "SET_API_DATA", payload: productsData });
        return;
      }
      
      if (products.length === 0) {
        console.warn("⚠️ API returned an empty array, falling back to local data");
        dispatch({ type: "SET_API_DATA", payload: productsData });
        return;
      }
      
      console.log("✅ Successfully loaded", products.length, "products from API!");
      dispatch({ type: "SET_API_DATA", payload: products });
    } catch (error) {
      console.error("❌ Error fetching products from API");
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received. Request details:", error.request);
        console.error("This usually means:");
        console.error("  1. The server is not running");
        console.error("  2. CORS is blocking the request");
        console.error("  3. Network connectivity issue");
        console.error("  4. Proxy is not configured correctly");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
      }
      
      console.log("🔄 Falling back to local data...");
      
      // Fallback to local data if API fails
      try {
        dispatch({ type: "SET_API_DATA", payload: productsData });
        console.log("✅ Successfully loaded local products as fallback");
      } catch (fallbackError) {
        console.error("❌ Error loading fallback data:", fallbackError);
        dispatch({ type: "API_ERROR" });
      }
    }
  };

  // my 2nd api call for single product

  const getSingleProduct = async (url) => {
    dispatch({ type: "SET_SINGLE_LOADING" });
    
    // Reset single product to prevent showing wrong product
    dispatch({ type: "SET_SINGLE_PRODUCT", payload: {} });
    
    try {
      // Extract the product ID from the URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const productId = urlParams.get('id');
      
      if (!productId) {
        console.error("❌ No product ID provided in URL");
        dispatch({ type: "SET_SINGLE_ERROR" });
        return;
      }
      
      console.log("🔍 Looking for product with ID:", productId);
      
      // First, try to find the product from already loaded products
      if (state.products && state.products.length > 0) {
        const foundProduct = state.products.find(
          product => String(product.id) === String(productId)
        );
        if (foundProduct) {
          console.log("✅ Found product in loaded products:", foundProduct.name);
          console.log("📸 Product image URL:", foundProduct.image);
          console.log("🆔 Product ID verification:", foundProduct.id, "===", productId);
          
          // Verify it's the correct product
          if (String(foundProduct.id) === String(productId)) {
            dispatch({ type: "SET_SINGLE_PRODUCT", payload: foundProduct });
            return;
          } else {
            console.error("❌ ID mismatch! Expected:", productId, "Got:", foundProduct.id);
          }
        } else {
          console.log("⚠️ Product not found in loaded products. Available IDs:", 
            state.products.map(p => p.id));
        }
      }
      
      // If using local data and not found in context, search local data
      if (USE_LOCAL_DATA) {
        const foundProduct = productsData.find(
          product => String(product.id) === String(productId)
        );
        if (foundProduct) {
          console.log("✅ Found product in local data:", foundProduct.name);
          console.log("📸 Product image URL:", foundProduct.image);
          console.log("🆔 Product ID verification:", foundProduct.id, "===", productId);
          
          if (String(foundProduct.id) === String(productId)) {
            dispatch({ type: "SET_SINGLE_PRODUCT", payload: foundProduct });
            return;
          }
        } else {
          console.error("❌ Product not found with ID:", productId);
          console.error("Available product IDs:", productsData.map(p => p.id));
          dispatch({ type: "SET_SINGLE_ERROR" });
          return;
        }
      }
      
      // If not found in context, try fetching from API
      // Try query parameter format first
      let res;
      try {
        console.log("🌐 Attempting to fetch from API:", url);
        res = await axios.get(url, {
          timeout: 10000,
        });
      } catch (queryError) {
        // If query parameter format fails, try RESTful endpoint format
        console.log("Query parameter format failed, trying RESTful endpoint...");
        try {
          const apiBase = process.env.NODE_ENV === 'production' 
            ? "https://api.pujakaitem.com/api/products"
            : "/api/products";
          res = await axios.get(`${apiBase}/${productId}`, {
            timeout: 10000,
          });
        } catch (restError) {
          // If API fails, fallback to local data
          console.error("❌ API request failed, falling back to local data");
          const foundProduct = productsData.find(
            product => String(product.id) === String(productId)
          );
          if (foundProduct) {
            console.log("✅ Found product in local data (fallback):", foundProduct.name);
            dispatch({ type: "SET_SINGLE_PRODUCT", payload: foundProduct });
            return;
          } else {
            throw restError; // Throw the REST error if both fail
          }
        }
      }
      
      const products = res.data;
      console.log("📦 API Response received:", products);
      
      // Handle both array and single object responses
      let productList = Array.isArray(products) ? products : [products];
      
      // Find the specific product by ID (handle both string and number IDs)
      const singleProduct = productList.find(
        product => String(product.id) === String(productId)
      );
      
      if (singleProduct) {
        console.log("✅ Found product from API:", singleProduct.name);
        console.log("📸 Product image URL:", singleProduct.image);
        console.log("🆔 Product ID verification:", singleProduct.id, "===", productId);
        
        // Verify it's the correct product
        if (String(singleProduct.id) === String(productId)) {
          dispatch({ type: "SET_SINGLE_PRODUCT", payload: singleProduct });
        } else {
          console.error("❌ ID mismatch from API! Expected:", productId, "Got:", singleProduct.id);
          // Fallback to local data
          console.log("🔄 Falling back to local data due to ID mismatch...");
          const foundProduct = productsData.find(
            product => String(product.id) === String(productId)
          );
          if (foundProduct) {
            console.log("✅ Found product in local data (fallback):", foundProduct.name);
            console.log("📸 Product image URL:", foundProduct.image);
            dispatch({ type: "SET_SINGLE_PRODUCT", payload: foundProduct });
          } else {
            console.error("❌ Product not found in local data either");
            dispatch({ type: "SET_SINGLE_ERROR" });
          }
        }
      } else {
        console.error("❌ Product not found in API response with ID:", productId);
        console.error("Available product IDs:", productList.map(p => p.id));
        
        // Fallback to local data
        console.log("🔄 Falling back to local data...");
        const foundProduct = productsData.find(
          product => String(product.id) === String(productId)
        );
        if (foundProduct) {
          console.log("✅ Found product in local data (fallback):", foundProduct.name);
          console.log("📸 Product image URL:", foundProduct.image);
          dispatch({ type: "SET_SINGLE_PRODUCT", payload: foundProduct });
        } else {
          console.error("❌ Product not found in local data either");
          dispatch({ type: "SET_SINGLE_ERROR" });
        }
      }
    } catch (error) {
      console.error("❌ Error fetching single product:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Fallback to local data if API completely fails
      try {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const productId = urlParams.get('id');
        console.log("🔄 Attempting fallback to local data for ID:", productId);
        
        const foundProduct = productsData.find(
          product => String(product.id) === String(productId)
        );
        if (foundProduct) {
          console.log("✅ Found product in local data (error fallback):", foundProduct.name);
          console.log("📸 Product image URL:", foundProduct.image);
          console.log("🆔 Product ID verification:", foundProduct.id, "===", productId);
          
          if (String(foundProduct.id) === String(productId)) {
            dispatch({ type: "SET_SINGLE_PRODUCT", payload: foundProduct });
          } else {
            console.error("❌ ID mismatch in fallback! Expected:", productId, "Got:", foundProduct.id);
            dispatch({ type: "SET_SINGLE_ERROR" });
          }
        } else {
          console.error("❌ Product not found in local data");
          console.error("Available product IDs:", productsData.map(p => p.id));
          dispatch({ type: "SET_SINGLE_ERROR" });
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        dispatch({ type: "SET_SINGLE_ERROR" });
      }
    }
  };

  useEffect(() => {
    getProducts(API);
  }, []);

  return (
    <AppContext.Provider value={{ ...state, getSingleProduct, getProducts }}>
      {children}
    </AppContext.Provider>
  );
};

// custom hooks
const useProductContext = () => {
  return useContext(AppContext);
};

export { AppProvider, AppContext, useProductContext };
