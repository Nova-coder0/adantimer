export const DHIKR_CATEGORIES = [
  {
    id: "all",
    labels: {
      en: "All",
      ar: "الكل",
      de: "Alle",
      fr: "Toutes",
      tr: "Tümü",
      "zh-hans": "全部"
    }
  },
  {
    id: "morning",
    labels: {
      en: "Morning",
      ar: "الصباح",
      de: "Morgen",
      fr: "Matin",
      tr: "Sabah",
      "zh-hans": "晨间"
    }
  },
  {
    id: "evening",
    labels: {
      en: "Evening",
      ar: "المساء",
      de: "Abend",
      fr: "Soir",
      tr: "Aksam",
      "zh-hans": "晚间"
    }
  },
  {
    id: "after-prayer",
    labels: {
      en: "After Prayer",
      ar: "بعد الصلاة",
      de: "Nach dem Gebet",
      fr: "Apres la priere",
      tr: "Namaz Sonrasi",
      "zh-hans": "礼拜后"
    }
  },
  {
    id: "forgiveness",
    labels: {
      en: "Forgiveness",
      ar: "الاستغفار",
      de: "Vergebung",
      fr: "Pardon",
      tr: "Istigfar",
      "zh-hans": "求饶"
    }
  },
  {
    id: "general",
    labels: {
      en: "General",
      ar: "عام",
      de: "Allgemein",
      fr: "General",
      tr: "Genel",
      "zh-hans": "通用"
    }
  }
];

export const DHIKR_ITEMS = [
  {
    id: "morning-subhanallah",
    category: "morning",
    countTarget: 100,
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    translations: {
      en: "Glory be to Allah and praise belongs to Him.",
      ar: "تنزيه لله مع الثناء عليه.",
      de: "Gepriesen ist Allah, und Ihm gebührt alles Lob.",
      fr: "Gloire a Allah et la louange Lui appartient.",
      tr: "Allah eksikliklerden uzaktir ve hamd O'nadir.",
      "zh-hans": "赞颂真主超绝万物，一切赞美都归于祂。"
    },
    benefit: {
      en: "A steady morning remembrance for a strong daily start.",
      ar: "ذكر صباحي ثابت لبداية يوم قوية.",
      de: "Ein beständiger Morgendhikr für einen klaren Tagesbeginn.",
      fr: "Un dhikr du matin regulier pour bien commencer la journee.",
      tr: "Gune duzenli baslamak icin sabit bir sabah zikri.",
      "zh-hans": "适合清晨反复诵念，帮助一天稳定开始。"
    },
    source: {
      en: "Common morning dhikr",
      ar: "من أذكار الصباح المشهورة",
      de: "Bekannter Morgendhikr",
      fr: "Dhikr du matin courant",
      tr: "Yaygin sabah zikri",
      "zh-hans": "常见晨间记念"
    }
  },
  {
    id: "morning-tahlil",
    category: "morning",
    countTarget: 100,
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illa Allahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shay'in qadir",
    translations: {
      en: "There is no god but Allah alone, without partner. His is the dominion, His is the praise, and He has power over everything.",
      ar: "توحيد وتمجيد لله وحده.",
      de: "Es gibt keinen Gott außer Allah allein, ohne Teilhaber. Ihm gehört die Herrschaft, Ihm gebührt das Lob, und Er hat Macht über alle Dinge.",
      fr: "Il n'y a de divinite qu'Allah seul, sans associe. A Lui la souverainete, a Lui la louange, et Il est capable de toute chose.",
      tr: "Allah'tan baska ilah yoktur, O tektir, ortagi yoktur. Mulku de hamd de O'nundur ve O her seye gucu yetendir.",
      "zh-hans": "除真主外绝无应受崇拜者，祂独一无偶，国权与赞美都属于祂，祂对万事全能。"
    },
    benefit: {
      en: "A core daily remembrance for tawhid and consistency.",
      ar: "ذكر يومي عظيم في التوحيد والثبات.",
      de: "Ein zentraler täglicher Dhikr für Tauhid und Beständigkeit.",
      fr: "Un rappel quotidien central pour le tawhid et la constance.",
      tr: "Tevhid ve istikrar icin temel bir gunluk zikir.",
      "zh-hans": "非常核心的日常记念，适合稳定反复诵念。"
    },
    source: {
      en: "Common morning dhikr",
      ar: "من أذكار الصباح المشهورة",
      de: "Bekannter Morgendhikr",
      fr: "Dhikr du matin courant",
      tr: "Yaygin sabah zikri",
      "zh-hans": "常见晨间记念"
    }
  },
  {
    id: "evening-hasbiya",
    category: "evening",
    countTarget: 7,
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiya Allahu la ilaha illa Huwa, alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azim",
    translations: {
      en: "Allah is sufficient for me. There is no god but Him. I place my trust in Him, and He is the Lord of the Mighty Throne.",
      ar: "الله كافيني، عليه توكلت، وهو رب العرش العظيم.",
      de: "Allah genügt mir. Es gibt keinen Gott außer Ihm. Auf Ihn vertraue ich, und Er ist der Herr des gewaltigen Thrones.",
      fr: "Allah me suffit. Il n'y a de divinite que Lui. Je place ma confiance en Lui, et Il est le Seigneur du Trone immense.",
      tr: "Allah bana yeter. O'ndan baska ilah yoktur. Ben O'na tevekkul ettim ve O buyuk Ars'in Rabbidir.",
      "zh-hans": "真主足够我依靠，除祂外绝无应受崇拜者；我只托靠祂，祂是伟大宝座的主。"
    },
    benefit: {
      en: "A calm evening dhikr centered on trust and reliance.",
      ar: "ذكر مسائي هادئ قائم على التوكل.",
      de: "Ein ruhiger Abenddhikr mit Fokus auf Vertrauen und Tawakkul.",
      fr: "Un dhikr du soir paisible axe sur la confiance en Allah.",
      tr: "Tevekkul ve guven uzerine sakin bir aksam zikri.",
      "zh-hans": "适合夜晚反复诵念，强调托靠与安定。"
    },
    source: {
      en: "Common evening dhikr",
      ar: "من أذكار المساء المشهورة",
      de: "Bekannter Abenddhikr",
      fr: "Dhikr du soir courant",
      tr: "Yaygin aksam zikri",
      "zh-hans": "常见晚间记念"
    }
  },
  {
    id: "after-prayer-subhanallah",
    category: "after-prayer",
    countTarget: 33,
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    translations: {
      en: "Glory be to Allah.",
      ar: "تنزيه لله.",
      de: "Gepriesen ist Allah.",
      fr: "Gloire a Allah.",
      tr: "Allah eksikliklerden uzaktir.",
      "zh-hans": "赞颂真主超绝万物。"
    },
    benefit: {
      en: "A simple post-prayer dhikr for regular repetition.",
      ar: "ذكر بسيط بعد الصلاة للتكرار المنتظم.",
      de: "Ein einfacher Dhikr nach dem Gebet für regelmäßige Wiederholung.",
      fr: "Un dhikr simple apres la priere pour une repetition reguliere.",
      tr: "Namazdan sonra duzenli tekrar icin sade bir zikir.",
      "zh-hans": "礼拜后适合稳定重复的简洁记念。"
    },
    source: {
      en: "Common after-prayer dhikr",
      ar: "من أذكار ما بعد الصلاة المشهورة",
      de: "Bekannter Dhikr nach dem Gebet",
      fr: "Dhikr courant apres la priere",
      tr: "Yaygin namaz sonrasi zikir",
      "zh-hans": "常见礼拜后记念"
    }
  },
  {
    id: "after-prayer-alhamdulillah",
    category: "after-prayer",
    countTarget: 33,
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translations: {
      en: "All praise belongs to Allah.",
      ar: "الحمد لله.",
      de: "Alles Lob gebührt Allah.",
      fr: "Toute louange appartient a Allah.",
      tr: "Hamd Allah'a mahsustur.",
      "zh-hans": "一切赞美都归于真主。"
    },
    benefit: {
      en: "A clear praise dhikr that fits naturally after prayer.",
      ar: "ذكر حمد واضح يناسب ما بعد الصلاة.",
      de: "Ein klarer Lob-Dhikr, der natürlich nach dem Gebet passt.",
      fr: "Un dhikr de louange clair adapte a l'apres-priere.",
      tr: "Namaz sonrasi dogal sekilde yer alan bir hamd zikri.",
      "zh-hans": "礼拜后自然衔接的赞美记念。"
    },
    source: {
      en: "Common after-prayer dhikr",
      ar: "من أذكار ما بعد الصلاة المشهورة",
      de: "Bekannter Dhikr nach dem Gebet",
      fr: "Dhikr courant apres la priere",
      tr: "Yaygin namaz sonrasi zikir",
      "zh-hans": "常见礼拜后记念"
    }
  },
  {
    id: "after-prayer-allahu-akbar",
    category: "after-prayer",
    countTarget: 34,
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translations: {
      en: "Allah is the Greatest.",
      ar: "الله أكبر.",
      de: "Allah ist der Größte.",
      fr: "Allah est le Plus Grand.",
      tr: "Allah en buyuktur.",
      "zh-hans": "真主至大。"
    },
    benefit: {
      en: "A strong closing dhikr after prayer with a fixed count.",
      ar: "ذكر ختامي قوي بعد الصلاة بعدد ثابت.",
      de: "Ein starker Abschluss-Dhikr nach dem Gebet mit fester Zahl.",
      fr: "Un dhikr de cloture fort apres la priere avec un compte fixe.",
      tr: "Namaz sonrasi sabit sayili guclu bir kapanis zikri.",
      "zh-hans": "礼拜后适合作为收尾的固定次数记念。"
    },
    source: {
      en: "Common after-prayer dhikr",
      ar: "من أذكار ما بعد الصلاة المشهورة",
      de: "Bekannter Dhikr nach dem Gebet",
      fr: "Dhikr courant apres la priere",
      tr: "Yaygin namaz sonrasi zikir",
      "zh-hans": "常见礼拜后记念"
    }
  },
  {
    id: "forgiveness-astaghfirullah",
    category: "forgiveness",
    countTarget: 100,
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translations: {
      en: "I seek Allah's forgiveness.",
      ar: "أطلب مغفرة الله.",
      de: "Ich bitte Allah um Vergebung.",
      fr: "Je demande le pardon d'Allah.",
      tr: "Allah'tan bagislanma dilerim.",
      "zh-hans": "我向真主求饶恕。"
    },
    benefit: {
      en: "A focused istighfar entry for steady repetition through the day.",
      ar: "استغفار مركز للتكرار المنتظم خلال اليوم.",
      de: "Ein fokussierter Istighfar-Dhikr für gleichmäßige Wiederholung im Alltag.",
      fr: "Un istighfar concentre pour une repetition reguliere au fil de la journee.",
      tr: "Gun boyunca duzenli tekrar icin odakli bir istigfar zikri.",
      "zh-hans": "适合全天稳定重复的求饶恕记念。"
    },
    source: {
      en: "Common istighfar",
      ar: "من صيغ الاستغفار المشهورة",
      de: "Bekannter Istighfar",
      fr: "Istighfar courant",
      tr: "Yaygin istigfar",
      "zh-hans": "常见求饶恕记念"
    }
  },
  {
    id: "general-hawqala",
    category: "general",
    countTarget: 100,
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    translations: {
      en: "There is no power and no strength except through Allah.",
      ar: "لا تحول ولا قوة إلا بالله.",
      de: "Es gibt keine Macht und keine Kraft außer durch Allah.",
      fr: "Il n'y a de puissance ni de force qu'en Allah.",
      tr: "Guc ve kuvvet ancak Allah iledir.",
      "zh-hans": "除凭真主外，绝无能力与力量。"
    },
    benefit: {
      en: "A general dhikr suited for repetition across the day.",
      ar: "ذكر عام مناسب للتكرار خلال اليوم.",
      de: "Ein allgemeiner Dhikr, der sich über den Tag gut wiederholen lässt.",
      fr: "Un dhikr general adapte a la repetition tout au long de la journee.",
      tr: "Gun icinde tekrar etmeye uygun genel bir zikir.",
      "zh-hans": "适合全天多次反复诵念的通用记念。"
    },
    source: {
      en: "General dhikr",
      ar: "ذكر عام",
      de: "Allgemeiner Dhikr",
      fr: "Dhikr general",
      tr: "Genel zikir",
      "zh-hans": "通用记念"
    }
  }
];

export function getDhikrCategories() {
  return DHIKR_CATEGORIES.filter(item => item.id !== "all");
}

export function getDhikrItems() {
  return DHIKR_ITEMS;
}
