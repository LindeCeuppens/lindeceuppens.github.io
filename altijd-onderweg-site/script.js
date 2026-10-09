/* Introtekst op maat: de lettergrootte wordt zo gekozen dat de laatste regel
 * ("waar ik vertrek, waar ik naartoe ga, ...") precies de volle breedte vult,
 * net als in het ontwerp. Op smalle schermen loopt de tekst gewoon door.
 */
(function () {
  var intro = document.querySelector('.intro');
  var vol = document.querySelector('.regel--vol');
  if (!intro || !vol) return;

  var smal = window.matchMedia('(max-width: 700px)');

  function pasAan() {
    if (smal.matches) { intro.style.fontSize = ''; return; }

    var breedte = intro.clientWidth;
    intro.style.fontSize = '100px';                       // meetgrootte
    var range = document.createRange();
    range.selectNodeContents(vol);
    var natuurlijk = range.getBoundingClientRect().width; // breedte van de regel bij 100px
    if (natuurlijk > 0) {
      intro.style.fontSize = (100 * breedte / natuurlijk) + 'px';
    }
  }

  pasAan();
  window.addEventListener('resize', pasAan);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pasAan);  // opnieuw zodra het lettertype geladen is
  window.addEventListener('load', pasAan);
})();

/* Pijltjes die rechts uit "VERTREK ->" schieten.
 *  - bij hover (of toetsenbord-focus): een continue salvo, zolang je erop blijft
 *  - bij klik: een grotere uitbarsting, daarna ga je naar de volgende pagina
 */
(function () {
  var link = document.querySelector('.vertrek');
  if (!link) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var salvoTimer = null;
  var vertrekt = false;

  // ---- één pijltje afvuren ----
  function schiet(opties) {
    opties = opties || {};
    var pijl = document.createElement('span');
    pijl.className = 'pijl';
    pijl.setAttribute('aria-hidden', 'true');
    pijl.textContent = '->';

    // willekeurige schaal, hoogte en afstand zodat het een echte salvo lijkt
    var schaal = 0.55 + Math.random() * 0.9;
    var hoogte = (Math.random() - 0.5) * 1.6;               // in em, rond de middellijn
    var afstand = opties.ver
      ? window.innerWidth * (0.25 + Math.random() * 0.45)
      : window.innerWidth * (0.12 + Math.random() * 0.3);
    var duur = (opties.ver ? 520 : 650) + Math.random() * 450;

    pijl.style.fontSize = schaal + 'em';
    link.appendChild(pijl);

    var anim = pijl.animate(
      [
        { transform: 'translate(0, calc(-50% + ' + hoogte + 'em)) scaleX(0.6)', opacity: 0 },
        { transform: 'translate(' + afstand * 0.12 + 'px, calc(-50% + ' + hoogte + 'em)) scaleX(1)', opacity: 1, offset: 0.12 },
        { transform: 'translate(' + afstand + 'px, calc(-50% + ' + hoogte + 'em)) scaleX(1.5)', opacity: 0 }
      ],
      { duration: duur, delay: opties.vertraging || 0, easing: 'cubic-bezier(0.12, 0.7, 0.25, 1)', fill: 'both' }
    );
    anim.onfinish = function () { pijl.remove(); };
  }

  // ---- hover / focus: doorlopende salvo ----
  function startSalvo() {
    if (reduceMotion || salvoTimer || vertrekt) return;
    schiet();
    salvoTimer = setInterval(schiet, 110);
  }
  function stopSalvo() {
    clearInterval(salvoTimer);
    salvoTimer = null;
  }

  link.addEventListener('mouseenter', startSalvo);
  link.addEventListener('mouseleave', stopSalvo);
  link.addEventListener('focus', function () {
    if (link.matches(':focus-visible')) startSalvo();
  });
  link.addEventListener('blur', stopSalvo);

  // ---- klik: uitbarsting en dan door naar de volgende pagina ----
  link.addEventListener('click', function (e) {
    // ctrl/cmd/shift-klik, middelste muisknop: laat de browser het zelf afhandelen
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (vertrekt) { e.preventDefault(); return; }

    if (reduceMotion) return;     // geen animatie: gewoon de link volgen

    e.preventDefault();
    vertrekt = true;
    stopSalvo();

    for (var i = 0; i < 18; i++) {
      schiet({ ver: true, vertraging: i * 22 });
    }

    var doel = link.href;
    setTimeout(function () { window.location.href = doel; }, 700);
  });

  // terug-knop van de browser (bfcache): opnieuw klaar voor gebruik
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { vertrekt = false; stopSalvo(); }
  });
})();
