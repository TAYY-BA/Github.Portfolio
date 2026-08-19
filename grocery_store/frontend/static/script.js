document.addEventListener("DOMContentLoaded", function () {

    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(function (btn) {
        btn.addEventListener("click", function (event) {
            if (!confirm("Are you sure you want to delete this product?")) {
                event.preventDefault();
            }
        });
    });

    const form = document.querySelector("form");

    form.addEventListener("submit", function (event) {
        const price = document.querySelector("input[name='price']").value;
        const quantity = document.querySelector("input[name='quantity']").value;

        if (price <= 0 || quantity <= 0) {
            alert("Price & Quantity must be greater than zero");
            event.preventDefault();
        }
    });
});