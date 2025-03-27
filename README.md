## Query All Products
    query {
      getProducts {
        id
        name
        price
        description
      }
    }

## Create a New Product
    mutation {
      createProduct(input: { name: "iPhone 15", price: 1200, description: "Latest Apple Phone" }) {
        id
        name
        price
      }
    }
