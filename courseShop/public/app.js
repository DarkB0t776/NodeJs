//Format Price
const toCurrency = (price) => {
  return new Intl.NumberFormat('en-En', {
    currency: 'USD',
    style: 'currency',
  }).format(price);
};

//Format Date

const toDate = (date) => {
  return new Intl.DateTimeFormat('en-En', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
};

//Get DOM elements
document.querySelectorAll('.price').forEach((item) => {
  item.textContent = toCurrency(item.textContent);
});

document.querySelectorAll('.date').forEach((item) => {
  item.textContent = toDate(item.textContent);
});

const cart = document.querySelector('#cart');

//Delete course from cart and rerender one
if (cart) {
  cart.addEventListener('click', (event) => {
    if (event.target.classList.contains('js-remove')) {
      const id = event.target.dataset.id;
      const csrf = event.target.dataset.csrf;

      fetch(`/cart/remove/${id}`, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf,
        },
      })
        .then((res) => res.json())
        .then((cartData) => {
          if (cartData.courses.length) {
            const html = cartData.courses
              .map(
                (c) => `
            <tr>
              <td>${c.title}</td>
              <td>${c.count}</td>
              <td><button class="btn btn-small js-remove" data-id="${c._id}">Delete</button></td>
            </tr>
            `
              )
              .join('');
            cart.querySelector('tbody').innerHTML = html;
            cart.querySelector('.price').textContent = toCurrency(
              cartData.price
            );
          } else {
            cart.innerHTML = '<p>Cart is empty</p>';
          }
        });
    }
  });
}

M.Tabs.init(document.querySelectorAll('.tabs'));
