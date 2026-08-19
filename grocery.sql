CREATE DATABASE grocery_store;
GO

USE grocery_store;
GO

CREATE TABLE categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category_id INT,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

INSERT INTO categories (category_name)
VALUES ('Fruits'), ('Vegetables'), ('Dairy'), ('Snacks');

SELECT * FROM categories;

INSERT INTO products (product_name, category_id, price, quantity)
VALUES
('Apple', 1, 200.00, 50),
('Banana', 1, 150.00, 40),
('Potato', 2, 80.00, 100),
('Milk 1L', 3, 220.00, 30),
('Chips', 4, 100.00, 60);
select * from products;