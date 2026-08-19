from flask import Flask, render_template, request, redirect
import pyodbc

app = Flask(__name__,
            template_folder='../frontend/templates')

# 🔹 SQL Server Connection
conn = pyodbc.connect(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost\\SQLEXPRESS;"
    "DATABASE=grocery_store;"  # <--- Confirm karein ye spelling sahi hai
    "Trusted_Connection=yes;"
)
cursor = conn.cursor()

# 🔹 Ye line har haal mein add karein taakay Python ko pata ho konsa DB use karna hai
cursor.execute("USE grocery_store")

# 🔹 Ye line add karein taakay confirm ho ke sahi DB use ho raha hai
cursor.execute("USE grocery_store")
cursor = conn.cursor()

# 🔹 Home Page (Frontend Load)
@app.route('/')
def index():
    # categories dropdown
    cursor.execute("SELECT * FROM dbo.categories")
    categories = cursor.fetchall()

    # product list
    cursor.execute("""
        SELECT p.product_id, p.product_name, c.category_name, p.price, p.quantity
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
    """)
    products = cursor.fetchall()

    return render_template(
        "index.html",
        categories=categories,
        products=products
    )


# 🔹 Add Product (Form → SQL)
@app.route('/add', methods=['POST'])
def add_product():
    name = request.form['name']
    category = request.form['category']
    price = request.form['price']
    quantity = request.form['quantity']

    cursor.execute(
        "INSERT INTO products (product_name, category_id, price, quantity) VALUES (?, ?, ?, ?)",
        (name, category, price, quantity)
    )
    conn.commit()

    return redirect('/')

# 🔹 Delete Product
@app.route('/delete/<int:id>')
def delete_product(id):
    cursor.execute("DELETE FROM products WHERE product_id = ?", (id,))
    conn.commit()
    return redirect('/')

if __name__ == "__main__":
    app.run(debug=True)
 # ... baaqi ka upar wala code ...

if __name__ == "__main__":
    app.run(debug=True)