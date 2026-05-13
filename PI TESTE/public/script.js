const header = document.getElementById('main-header')
function toggleCart() {
    cartDrawer.classList.toggle('active')
    overlay.classList.toggle('active')
}

overlay.addEventListener('click', toggleCart)

function addToCart(name, price) {

    cart.push({ name, price })

    updateCartUI()

    if(!cartDrawer.classList.contains('active')) {
        toggleCart()
    }
}

function removeFromCart(index) {
    cart.splice(index, 1)
    updateCartUI()
}

function updateCartUI() {

    cartCount.innerText = cart.length

    if(cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p class="empty-cart">O carrinho está vazio.</p>
        `

        cartTotal.innerText = 'Total: R$ 0,00'

        return
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `

        <div class="cart-item">

            <div>
                <strong>${item.name}</strong>
                <p>R$ ${item.price.toLocaleString('pt-BR')}</p>
            </div>

            <i class="fa-solid fa-trash-can"
                onclick="removeFromCart(${index})">
            </i>

        </div>

    `).join('')

    const total = cart.reduce((acc, item) => acc + item.price, 0)

    cartTotal.innerText = `
        Total: R$ ${total.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
        })}
    `
}

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting) {
            entry.target.classList.add('visible')
        }
    })

}, {
    threshold: 0.1
})

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el)
})