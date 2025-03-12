// Перевіряємо, чи вже зареєстрований кастомний елемент 'pickup-availability'
if (!customElements.get('pickup-availability')) {
  customElements.define(
    'pickup-availability',
    class PickupAvailability extends HTMLElement {
      constructor() {
        super(); // Викликаємо конструктор базового класу HTMLElement

        // Якщо атрибуту 'available' немає, не ініціалізуємо компонент
        if (!this.hasAttribute('available')) return;

        // Зберігаємо HTML-код помилки, який буде використовуватися у разі невдачі
        this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
        
        // Прив'язуємо метод до екземпляру, щоб не втрачати контекст при виклику
        this.onClickRefreshList = this.onClickRefreshList.bind(this);
        
        // Отримуємо інформацію про доступність самовивозу для вибраного варіанта товару
        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        if (!variantId) return; // Якщо немає ідентифікатора варіанта, виходимо

        let rootUrl = this.dataset.rootUrl;
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/'; // Переконуємося, що URL має правильний формат
        }
        
        // Формуємо URL для отримання інформації про самовивіз
        const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

        // Відправляємо запит на сервер
        fetch(variantSectionUrl)
          .then((response) => response.text())
          .then((text) => {
            // Парсимо отриманий HTML-код
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.shopify-section');
            
            // Відображаємо інформацію про самовивіз
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            // Якщо сталася помилка, прибираємо слухача подій і показуємо помилку
            const button = this.querySelector('button');
            if (button) button.removeEventListener('click', this.onClickRefreshList);
            this.renderError();
          });
      }

      // Метод для повторного запиту доступності самовивозу
      onClickRefreshList() {
        this.fetchAvailability(this.dataset.variantId);
      }

      // Оновлюємо компонент при зміні варіанта товару
      update(variant) {
        if (variant?.available) {
          this.fetchAvailability(variant.id);
        } else {
          this.removeAttribute('available');
          this.innerHTML = '';
        }
      }

      // Відображення повідомлення про помилку
      renderError() {
        this.innerHTML = '';
        this.appendChild(this.errorHtml);
        
        // Додаємо обробник для кнопки повторного запиту
        this.querySelector('button').addEventListener('click', this.onClickRefreshList);
      }

      // Відображення інформації про самовивіз
      renderPreview(sectionInnerHTML) {
        const drawer = document.querySelector('pickup-availability-drawer');
        if (drawer) drawer.remove(); // Видаляємо старе вікно самовивозу

        // Якщо інформації про самовивіз немає, прибираємо блок
        if (!sectionInnerHTML.querySelector('pickup-availability-preview')) {
          this.innerHTML = '';
          this.removeAttribute('available');
          return;
        }

        // Додаємо оновлену інформацію про самовивіз
        this.innerHTML = sectionInnerHTML.querySelector('pickup-availability-preview').outerHTML;
        this.setAttribute('available', '');

        // Додаємо вікно з деталями самовивозу
        document.body.appendChild(sectionInnerHTML.querySelector('pickup-availability-drawer'));

        // Додаємо кольорові класи з data-атрибута
        const colorClassesToApply = this.dataset.productPageColorScheme.split(' ');
        colorClassesToApply.forEach((colorClass) => {
          document.querySelector('pickup-availability-drawer').classList.add(colorClass);
        });

        // Додаємо обробник для відкриття вікна
        const button = this.querySelector('button');
        if (button)
          button.addEventListener('click', (evt) => {
            document.querySelector('pickup-availability-drawer').show(evt.target);
          });
      }
    }
  );
}

// Перевіряємо, чи вже зареєстрований кастомний елемент 'pickup-availability-drawer'
if (!customElements.get('pickup-availability-drawer')) {
  customElements.define(
    'pickup-availability-drawer',
    class PickupAvailabilityDrawer extends HTMLElement {
      constructor() {
        super();
        this.onBodyClick = this.handleBodyClick.bind(this);

        // Закриття вікна при натисканні кнопки
        this.querySelector('button').addEventListener('click', () => {
          this.hide();
        });

        // Закриття вікна при натисканні Escape
        this.addEventListener('keyup', (event) => {
          if (event.code.toUpperCase() === 'ESCAPE') this.hide();
        });
      }

      // Закриваємо вікно, якщо клік поза його межами
      handleBodyClick(evt) {
        const target = evt.target;
        if (
          target != this &&
          !target.closest('pickup-availability-drawer') &&
          target.id != 'ShowPickupAvailabilityDrawer'
        ) {
          this.hide();
        }
      }

      // Закриття вікна
      hide() {
        this.removeAttribute('open');
        document.body.removeEventListener('click', this.onBodyClick);
        document.body.classList.remove('overflow-hidden');
        removeTrapFocus(this.focusElement);
      }

      // Відкриття вікна
      show(focusElement) {
        this.focusElement = focusElement;
        this.setAttribute('open', '');
        document.body.addEventListener('click', this.onBodyClick);
        document.body.classList.add('overflow-hidden');
        trapFocus(this);
      }
    }
  );
}
