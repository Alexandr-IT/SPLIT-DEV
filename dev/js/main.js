const swiper_reviews = new Swiper('.response_and_photo', {
direction: 'horizontal',
loop: true,
slidesPerView: 1,
spaceBetween: 0,
allowTouchMove: false,
navigation: {
    nextEl: '.response_and_photo-next',
    prevEl: '.response_and_photo-prev',
},
breakpoints: {
    768: {
        slidesPerView: 1,
        spaceBetween: 0,
    }
}
});
  
  




