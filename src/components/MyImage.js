import React, { useState } from "react";
import styled from "styled-components";

const MyImage = ({ imgs = [{ url: "" }] }) => {
  // Handle different image data formats
  let processedImages = [];
  
  if (typeof imgs === 'string') {
    // If imgs is a single string URL, convert it to the expected format
    processedImages = [{ url: imgs, filename: "Product image" }];
  } else if (Array.isArray(imgs)) {
    if (imgs.length > 0 && typeof imgs[0] === 'string') {
      // If imgs is an array of strings, convert each to object format
      processedImages = imgs.map((url, index) => ({ 
        url, 
        filename: `Product image ${index + 1}` 
      }));
    } else {
      // If imgs is already an array of objects, use as is
      processedImages = imgs;
    }
  }
  
  const [mainImage, setMainImage] = useState(processedImages[0] || { url: "", filename: "" });

  // Check if processedImages is valid and has data
  if (!processedImages || processedImages.length === 0 || !processedImages[0].url) {
    return (
      <Wrapper>
        <div className="error-message">
          <p>No images available</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="grid grid-four-column">
        {processedImages.map((curElm, index) => {
          return (
            <figure key={index}>
              <img
                src={curElm.url}
                alt={curElm.filename || `Product image ${index + 1}`}
                className="box-image--style"
                onClick={() => setMainImage(curElm)}
                onError={(e) => {
                  console.error("Image failed to load:", curElm.url);
                  e.target.style.display = 'none';
                }}
              />
            </figure>
          );
        })}
      </div>
      {/* 2nd column  */}

      <div className="main-screen">
        <img 
          src={mainImage?.url} 
          alt={mainImage?.filename || "Main product image"} 
          onError={(e) => {
            console.error("Main image failed to load:", mainImage?.url);
            e.target.style.display = 'none';
          }}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: grid;
  grid-template-columns: 0.4fr 1fr;
  gap: 1rem;

  .grid {
    flex-direction: row;
    justify-items: center;
    align-items: center;
    width: 100%;
    gap: 1rem;
    /* order: 2; */

    img {
      max-width: 100%;
      max-height: 100%;
      background-size: cover;
      object-fit: contain;
      cursor: pointer;
      box-shadow: ${({ theme }) => theme.colors.shadow};
    }
  }

  .main-screen {
    display: grid;
    place-items: center;
    order: 1;
    img {
      max-width: 100%;
      height: auto;
      box-shadow: ${({ theme }) => theme.colors.shadow};
    }
  }
  .grid-four-column {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }

  .error-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #666;
    font-size: 1.2rem;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    display: flex;
    flex-direction: column;
    order: 1;

    .grid-four-column {
      grid-template-rows: 1fr;
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;

export default MyImage;
