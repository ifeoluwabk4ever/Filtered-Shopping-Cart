// get parent element
let sectionCenter = document.querySelector(".section-center");
let btnContainer = document.querySelector(".btn-container");

// Element.getBoundingClientRect() method returns the size of an element and its position relative to the viewport.
// pageYOffset is a read - only window property that returns the number of pixels the document has been scrolled vertically.
// slice extracts a section of a string without modifying original string
//offsetTop - A Number, representing the top position of the element, in pixels

// ********** set date ************
let date = document.querySelector('#date');
date.innerHTML = new Date().getFullYear();

// ********** close links ************
let navToggle = document.querySelector('.nav-toggle'),
  linksContainer = document.querySelector('.links-container'),
  links = document.querySelector('.links');

navToggle.addEventListener('click', () => {
  let containerHeight = linksContainer.getBoundingClientRect().height,
    linksHeight = links.getBoundingClientRect().height;
  if (containerHeight === 0) {
    linksContainer.style.height = `${linksHeight}px`
  } else {
    linksContainer.style.height = 0
  }
})

// ********** fixed navbar ************
let navbar = document.querySelector('nav'),
  topLink = document.querySelector('.top-link');
window.addEventListener('scroll', () => {
  let scrollHeight = window.pageYOffset,
    navHeight = navbar.getBoundingClientRect().height;
  if (scrollHeight > navHeight) {
    navbar.classList.add('fixed-nav');
  } else {
    navbar.classList.remove('fixed-nav');
  }

  if (scrollHeight > 500) {
    topLink.classList.add('show-link');
  } else {
    topLink.classList.remove('show-link');
  }
})

// ********** smooth scroll ************
// select links
let scrollLinks = document.querySelectorAll('.scroll-link');

scrollLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    let id = e.currentTarget.getAttribute('href').slice(1),
      element = document.getElementById(id),
      navHeight = navbar.getBoundingClientRect().height,
      containerHeight = linksContainer.getBoundingClientRect().height,
      fixedNav = navbar.classList.contains('fixed-nav'),
      position = element.offsetTop - navHeight;

    if (!fixedNav) {
      position -= navHeight;
    }
    if (navHeight > 82) {
      position += containerHeight;
    }
    window.scrollTo({
      left: 0,
      top: position,
    })
    linksContainer.style.height = 0
  })
})

async function fetchProducts() {
  try {
    let result = await fetch("products.json");
    let data = await result.json();

    let products = data.items;

    products = products.map(item => {
      let {id} = item.sys,
          {title, price, category, desc} = item.fields,
          image = item.fields.image.fields.file.url;
      
      return {id,title,price,image,category,price, desc};
    })
    return products
  } catch (err) {
    console.log(err)
  }
} 

function diplayMenuItems(menuItems) {
  let result = '';
      menuItems.forEach(item => {

    result += `<article class="menu-item product">
          <div class="img-container">
            <img src=${item.image} alt =${item.title}class="photo"/>
            <button class="bag-btn" data-id=${item.id}>
              <i class ="fas fa-shopping-cart"></i>add to cart 
            </button>
          </div>
          <div class="item-info">
            <article class="item-header">
              <h4>${item.title}</h4>
              <h4 class="price">$${item.price}</h4>
            </article>
            <p class="item-text">
              ${item.desc}
            </p>
          </div>
        </article>`;
  });
  sectionCenter.innerHTML = result;
}

function displayMenuButtons() {
  fetchProducts()
    .then(menu => {

      let categories = menu.reduce( (values, item) => {
          if (!values.includes(item.category)) {
            values.push(item.category);
          }
          return values;
        },
        ["all"]
      );

      let categoryBtns = categories.map( (category) => {
          return `<button type="button" class="filter-btn" data-id=${category}>
              ${category}
            </button>`;
        })
        .join("");
      btnContainer.innerHTML = categoryBtns;


      let filterBtns = btnContainer.querySelectorAll(".filter-btn");

      filterBtns.forEach( (btn) => {
        btn.addEventListener("click", (e) => {
          let category = e.currentTarget.dataset.id;
          let menuCategory = menu.filter( (menuItem) => {
            // console.log(menuItem.category);
            if (menuItem.category === category) {
              return menuItem;
            }
          });
          if (category === "all") {
            diplayMenuItems(menu);
          } else {
            diplayMenuItems(menuCategory);
          }
        });
      });
    })
}

let cartBtn = document.querySelector('.cart-btn'),
  closeCartBtn = document.querySelector('.close-cart'),
  clearCartBtn = document.querySelector('.clear-cart'),
  cartDOM = document.querySelector('.cart'),
  cartOverlay = document.querySelector('.cart-overlay'),
  cartItems = document.querySelector('.cart-items'),
  cartTotal = document.querySelector('.cart-total'),
  cartContent = document.querySelector('.cart-content'),
  cart = [],
  buttonsDOM = [];


  function getBagButton() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        // get product from products based on id
        let cartItem = {...Storage.getProduct(id),amount: 1
        };

        // add to cart
        cart = [...cart, cartItem];

        // save cart in localStorage
        Storage.saveCart(cart);

        // set cart values
        this.setCartValues(cart);

        //  display cart item
        this.addCartItem(cartItem);

        // Alert item added to cart
        alert(`${cartItem.title} of $${cartItem.price} added to cart`);
      })
    })
  }
  function setCartValues(cart) {
    let temptotal = 0,
      itemsTotal = 0;

    cart.map(item => {
      temptotal += item.price * item.amount;
      itemsTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(temptotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  function addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
      div.innerHTML = `
        <img src=${item.image} alt="product" />
        <div>
            <h4> ${item.title} </h4> 
            <h5> $${item.price} </h5>
            <i class="fas fa-trash remove-item" data-id=${item.id}></i> 
        </div> 
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i> 
            <p class="item-amount">${item.amount}</p> 
            <i class="fas fa-chevron-down" data-id=${item.id}></i> 
        </div>`
    cartContent.appendChild(div);
  }
  function showCart() {
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
  }
  function hideCart() {
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
  }
  function setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);

    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  function populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  function cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    })

    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target,
          id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target,
          id = addAmount.dataset.id,
          tempItem = cart.find(item => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;

      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target,
          id = lowerAmount.dataset.id,
          tempItem = cart.find(item => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }

      }
    })
  }
  function clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart();
  }
  function removeItem(id) {
    cart = cart.filter(item => item.id !== id)
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                add to cart
            `;
  }
  function getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id)
  }


// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id)
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  }
}



window.addEventListener('load', () => {
  setUpApp();

  // get all product 
  fetchProducts()
    .then(products => {
      diplayMenuItems(products),
      displayMenuButtons()
      Storage.saveProducts(products);
    })
    .then(() => {
      getBagButton();
      cartLogic();
    });
});