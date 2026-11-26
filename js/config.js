/* ==========================================================================
   config.js: ALL editable content lives here.
   - Dates: ISO format with the Algeria offset (+01:00).
   - Wrap a word in *stars* to show it in red italic (e.g. "*ouvre*").
   - Use the typographic apostrophe ’ in French text.
   ========================================================================== */
(function () {
  var pad = function (n) { return String(n).padStart(2, "0"); };
  /* Generates the 10 placeholder hints. Replace `hints:` below with an explicit list of 10 {title, text} to write real ones. */
  var mk = function (title, text) {
    return Array.from({ length: 10 }, function (_, i) { return { title: title.replace("{n}", pad(i + 1)), text: text }; });
  };

  /* ---- THE 10 HINTS (title + text). Same list used for FR / EN / AR. Order = envelope 01 to 10. ---- */
  var HINTS = [
    { title: "Audit", text: "بلاصة يديروا فيها des événements، معندك وين تروح\nالباب مقفول" },
    { title: "Trinda", text: "تقطعت العلاقات بين الدار الكبيرة والصغيرة.\nالدار الكبيرة تشوفها بصح متروحلهاش." },
    { title: "La belle face, le blond te CHEC.", text: "بلاصة تبدل الجو فيها الجو وترتاح من جو القراية؛ كون\nتصيب متخرج منها، الدالة تاعنا أخرج خلينا ندخل" },
    { title: "Salle des jeux", text: "Espace Faji Fih 3la Rohk Mn Stress Ta3 9raya." },
    { title: "Riad", text: "بلاصة تلمنا في la pose مفتوحة 24/7 يدير Retard\nونشارجو énergie تاعنا عندو." },
    { title: "Affichage doc", text: "ما بين جوهرة INPS ومتجر المعلومات، راح تصيبني\nقدامك؛ ne cherche pas loin" },
    { title: "Espace ouvert", text: "Les murs sont transparents, mais le lieu reste à découvrir." },
    { title: "Hsison", text: "محبوب الجماهير، دخلو بال VISA سربي لروحك الدار دارك" },
    { title: "Foyer", text: "رجلك معندكش وين تحطها وقت la pose\nIci café et restaurant" },
    { title: "Corner check off", text: "Studio Bla Studio ; créativité nulle ; le même style.\noutfit of The day hna yetcheka." }
  ];

  window.SE_CONFIG = {
    defaultLang: "fr",                       // fr | en | ar  (links can force one: ?lang=en)

    /* ---- EVENT DATE (placeholder: change me) ---- */
    event: {
      start: "2026-12-01T08:30:00+01:00",    // countdown target
      end: "2026-12-01T17:30:00+01:00"     // after this the "ended" state shows
    },

    /* ---- SCHOOLS of the pole, in display order ----
       id   : referenced by each hint below
       name : big heading in the Suivi panel
       full : small line under the name (edit or set "" to hide) */
    schools: [
      { id: "esgen", name: "ESGEN", full: "" },
      { id: "esc", name: "ESC", full: "" },
      { id: "inps", name: "INPS", full: "" },
      { id: "echec", name: "Echec", full: "" }
    ],

    /* ---- HINTS: school + state + icon (texts are per language below) ----
       The ORDER of this list = envelope numbers 01 to 10, and must match the order of the
       `hints:` text lists in every language below.
       Keep each school's hints together: ENSSEA 3, EHEC 3, ESGEN 2, ESC 2.
       school: "enssea" | "ehec" | "esgen" | "esc"
       unlocked: true        -> open from the start
       unlockAt: "ISO date"  -> opens automatically at that time
       icon: landmark | building | coffee | book | tree | compass | map | key | eye | flag */
    hints: [
      { school: "esgen", icon: "eye", unlocked: true },
      { school: "esgen", icon: "key", unlocked: true },

      { school: "esc", icon: "map", unlocked: true },
      { school: "esc", icon: "compass", unlocked: true },

      { school: "inps", icon: "building", unlocked: true },
      { school: "inps", icon: "book", unlocked: true },
      { school: "inps", icon: "tree", unlocked: true },

      { school: "echec", icon: "landmark", unlocked: true },
      { school: "echec", icon: "coffee", unlocked: true },
      { school: "echec", icon: "flag", unlocked: true }
    ],

    /* ---- TEXTS PER LANGUAGE ---- */
    i18n: {
      fr: {
        dir: "ltr",
        metaTitle: "Salon de l’Emploi 2026 | EIC Club",
        metaDesc: "Une journée, une soixantaine d’entreprises, des recruteurs face à vous. Ouvrez la lettre du club EIC et suivez les indices.",
        skip: "Aller au contenu", edition: "Édition 2026",
        cdTitle: "Le salon *ouvre* ses portes dans",
        eventLabel: "1er décembre 2026, Palais de la Culture Moufdi Zakaria, Alger",
        days: "jours", hours: "heures", minutes: "minutes", seconds: "secondes",
        started: "Le salon est ouvert. Venez rencontrer les recruteurs.",
        ended: "Le salon est terminé. Merci à toutes celles et ceux qui sont venus.",
        suivi: "Suivi", drawerTitle: "*Suivi*", close: "Fermer",
        progress: "{n} sur {t} lettres ouvertes", lockedMsg: "Cette lettre est encore scellée.",
        envOpen: "Ouvrir la lettre {n}", envLocked: "Lettre {n}, scellée", footer: "Club EIC, ENSSEA",
        letter: {
          greeting: "Cher étudiant, chère étudiante,",
          paragraphs: [
            "Si ce message vous est parvenu, ce n’est pas un hasard. Quelqu’un a remarqué votre curiosité.",
            "Pendant une journée, *une soixantaine d’entreprises* ouvriront leurs portes. Des recruteurs vous attendront, des entretiens se prépareront, et certaines offres ne seront annoncées nulle part ailleurs.",
            "Pour trouver votre chemin, *dix indices* vous seront confiés, un à un. Chacun désigne un lieu. Gardez l’œil ouvert."
          ],
          signature: "Le bureau du club EIC", role: "Economic Ingenious Club, ENSSEA"
        },
        hints: HINTS
      },
      en: {
        dir: "ltr",
        metaTitle: "Salon de l’Emploi 2026 | EIC Club",
        metaDesc: "One day, around sixty companies, recruiters facing you. Open the EIC club letter and follow the hints.",
        skip: "Skip to content", edition: "2026 Edition",
        cdTitle: "The fair *opens* its doors in",
        eventLabel: "December 1, 2026, Culture Palace Moufdi Zakaria, Algiers",
        days: "days", hours: "hours", minutes: "minutes", seconds: "seconds",
        started: "The fair is open. Come and meet the recruiters.",
        ended: "The fair is over. Thank you to everyone who came.",
        suivi: "Follow-up", drawerTitle: "*Follow-up*", close: "Close",
        progress: "{n} of {t} letters opened", lockedMsg: "This letter is still sealed.",
        envOpen: "Open letter {n}", envLocked: "Letter {n}, sealed", footer: "EIC Club, ENSSEA",
        letter: {
          greeting: "Dear student,",
          paragraphs: [
            "If this message reached you, it is no accident. Someone has noticed your curiosity.",
            "For one day, *around sixty companies* will open their doors. Recruiters will be waiting, interviews are being prepared, and some offers will be announced nowhere else.",
            "To find your way, *ten hints* will be handed to you, one by one. Each one points to a place. Keep your eyes open."
          ],
          signature: "The EIC club team", role: "Economic Ingenious Club, ENSSEA"
        },
        hints: HINTS
      },
      ar: {
        dir: "rtl",
        metaTitle: "صالون التوظيف 2026 | نادي EIC",
        metaDesc: "يوم واحد، حوالي ستين شركة، ومُوظِّفون في انتظارك. افتح رسالة نادي EIC واتبع الأدلة.",
        skip: "انتقل إلى المحتوى", edition: "طبعة 2026",
        cdTitle: "يفتح الصالون *أبوابه* بعد",
        eventLabel: "1 ديسمبر 2026، قصر الثقافة مفدي زكريا، الجزائر",
        days: "أيام", hours: "ساعات", minutes: "دقائق", seconds: "ثوانٍ",
        started: "الصالون مفتوح الآن. تعالوا والتقوا بالمُوظِّفين.",
        ended: "انتهى الصالون. شكراً لكل من حضر.",
        suivi: "المتابعة", drawerTitle: "*المتابعة*", close: "إغلاق",
        progress: "{n} من {t} رسائل مفتوحة", lockedMsg: "هذه الرسالة ما زالت مختومة.",
        envOpen: "افتح الرسالة {n}", envLocked: "الرسالة {n}، مختومة", footer: "نادي EIC، ENSSEA",
        letter: {
          greeting: "عزيزي الطالب، عزيزتي الطالبة،",
          paragraphs: [
            "إن وصلتك هذه الرسالة فليس ذلك صدفة. لقد لاحظ أحدهم فضولك.",
            "لمدة يوم واحد، ستفتح *حوالي ستين شركة* أبوابها. سيكون المُوظِّفون في انتظارك، والمقابلات قيد التحضير، وبعض العروض لن يُعلن عنها في أي مكان آخر.",
            "لتجد طريقك، ستُسلَّم إليك *عشرة أدلة* واحداً تلو الآخر. كل دليل يشير إلى مكان. أبقِ عينيك مفتوحتين."
          ],
          signature: "مكتب نادي EIC", role: "Economic Ingenious Club, ENSSEA"
        },
        hints: HINTS
      }
    }
  };
})();
