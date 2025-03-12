if (!customElements.get('product-form')) {
  // Реєструємо кастомний елемент 'product-form', якщо він ще не зареєстрований
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form'); // Знаходимо форму у межах компонента
        this.variantIdInput.disabled = false; // Дозволяємо змінювати ID варіанту продукту
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this)); // Додаємо обробник події 'submit'
        
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer'); // Визначаємо корзину
        this.submitButton = this.querySelector('[type="submit"]'); // Знаходимо кнопку додавання до кошика
        this.submitButtonText = this.submitButton.querySelector('span'); // Текст кнопки

        if (document.querySelector('cart-drawer')) {
          this.submitButton.setAttribute('aria-haspopup', 'dialog'); // Якщо корзина — модальне вікно, додаємо атрибут доступності
        }

        this.hideErrors = this.dataset.hideErrors === 'true'; // Визначаємо, чи треба приховувати помилки
      }

      onSubmitHandler(evt) {
        evt.preventDefault(); // Запобігаємо стандартному відправленню форми
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return; // Перевіряємо, чи кнопка вже заблокована

        this.handleErrorMessage(); // Очищаємо можливі попередні помилки

        this.submitButton.setAttribute('aria-disabled', true); // Блокуємо кнопку
        this.submitButton.classList.add('loading'); // Додаємо клас завантаження
        this.querySelector('.loading__spinner').classList.remove('hidden'); // Показуємо спінер

        const config = fetchConfig('javascript'); // Отримуємо налаштування запиту
        config.headers['X-Requested-With'] = 'XMLHttpRequest'; // Додаємо заголовок для AJAX-запиту
        delete config.headers['Content-Type']; // Видаляємо заголовок Content-Type

        const formData = new FormData(this.form); // Створюємо FormData з форми
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id) // Додаємо секції, які потрібно оновити
          );
          formData.append('sections_url', window.location.pathname); // Додаємо URL сторінки
          this.cart.setActiveElement(document.activeElement); // Запам'ятовуємо активний елемент
        }
        config.body = formData; // Додаємо дані у тіло запиту

        fetch(`${routes.cart_add_url}`, config) // Відправляємо запит до Shopify API
          .then((response) => response.json()) // Перетворюємо відповідь у JSON
          .then((response) => {
            if (response.status) {
              // Якщо є помилка
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description); // Відображаємо помилку

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message'); // Повідомлення про розпроданий товар
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url; // Якщо немає корзини, переходимо на сторінку кошика
              return;
            }

            if (!this.error) {
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            }
            this.error = false;
            
            const quickAddModal = this.closest('quick-add-modal'); // Якщо товар доданий через модальне вікно
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response); // Оновлюємо корзину після закриття модального вікна
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response); // Оновлюємо корзину
            }
          })
          .catch((e) => {
            console.error(e); // Лог помилок у консолі
          })
          .finally(() => {
            this.submitButton.classList.remove('loading'); // Прибираємо клас завантаження
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty'); // Якщо корзина була порожня, позначаємо її як заповнену
            if (!this.error) this.submitButton.removeAttribute('aria-disabled'); // Якщо немає помилки, розблоковуємо кнопку
            this.querySelector('.loading__spinner').classList.add('hidden'); // Ховаємо спінер
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return; // Якщо помилки приховані, виходимо

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper'); // Контейнер для повідомлення про помилку
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message'); // Текст помилки

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage); // Приховуємо або показуємо помилку

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage; // Встановлюємо текст помилки
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled'); // Блокуємо кнопку
          if (text) this.submitButtonText.textContent = text; // Змінюємо текст кнопки, якщо передано текст
        } else {
          this.submitButton.removeAttribute('disabled'); // Розблоковуємо кнопку
          this.submitButtonText.textContent = window.variantStrings.addToCart; // Відновлюємо стандартний текст кнопки
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]'); // Отримуємо поле з ID варіанту товару
      }
    }
  );
}
