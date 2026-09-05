/* =======================================================
   МОБІЛЬНА ВЕРСІЯ (Без анімацій та блокувань скролу)
   ======================================================= */
(function(){
  // Оновлення року в футері
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Кнопка "Вгору"
  document.querySelectorAll('a[href="#top"], .back-to-top').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();