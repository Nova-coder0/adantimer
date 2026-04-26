export const HADITH_CATEGORIES = [
  {
    id: "all",
    labels: {
      en: "All",
      ar: "الكل",
      de: "Alle",
      fr: "Toutes",
      tr: "Tumu",
      "zh-hans": "全部"
    }
  },
  {
    id: "intentions",
    labels: {
      en: "Intentions",
      ar: "النيات",
      de: "Absichten",
      fr: "Intentions",
      tr: "Niyetler",
      "zh-hans": "举意"
    }
  },
  {
    id: "prayer",
    labels: {
      en: "Prayer",
      ar: "الصلاة",
      de: "Gebet",
      fr: "Priere",
      tr: "Namaz",
      "zh-hans": "礼拜"
    }
  },
  {
    id: "character",
    labels: {
      en: "Character",
      ar: "الاخلاق",
      de: "Charakter",
      fr: "Comportement",
      tr: "Ahlak",
      "zh-hans": "品德"
    }
  },
  {
    id: "knowledge",
    labels: {
      en: "Knowledge",
      ar: "العلم",
      de: "Wissen",
      fr: "Savoir",
      tr: "Ilim",
      "zh-hans": "知识"
    }
  },
  {
    id: "gratitude",
    labels: {
      en: "Gratitude",
      ar: "الشكر",
      de: "Dankbarkeit",
      fr: "Gratitude",
      tr: "Sukretmek",
      "zh-hans": "感恩"
    }
  },
  {
    id: "mercy",
    labels: {
      en: "Mercy",
      ar: "الرحمة",
      de: "Barmherzigkeit",
      fr: "Misericorde",
      tr: "Merhamet",
      "zh-hans": "怜悯"
    }
  },
  {
    id: "repentance",
    labels: {
      en: "Repentance",
      ar: "التوبة",
      de: "Reue",
      fr: "Repentir",
      tr: "Tevbe",
      "zh-hans": "忏悔"
    }
  },
  {
    id: "patience",
    labels: {
      en: "Patience",
      ar: "الصبر",
      de: "Geduld",
      fr: "Patience",
      tr: "Sabir",
      "zh-hans": "忍耐"
    }
  },
  {
    id: "family",
    labels: {
      en: "Family",
      ar: "الأسرة",
      de: "Familie",
      fr: "Famille",
      tr: "Aile",
      "zh-hans": "家庭"
    }
  },
  {
    id: "truthfulness",
    labels: {
      en: "Truthfulness",
      ar: "الصدق",
      de: "Wahrhaftigkeit",
      fr: "Veracite",
      tr: "Dogruluk",
      "zh-hans": "诚实"
    }
  },
  {
    id: "trust",
    labels: {
      en: "Trust in Allah",
      ar: "التوكل",
      de: "Tawakkul",
      fr: "Confiance en Allah",
      tr: "Tevekkul",
      "zh-hans": "托靠真主"
    }
  },
  {
    id: "parents",
    labels: {
      en: "Parents",
      ar: "الوالدان",
      de: "Eltern",
      fr: "Parents",
      tr: "Anne-Baba",
      "zh-hans": "父母"
    }
  },
  {
    id: "speech",
    labels: {
      en: "Speech",
      ar: "الكلام",
      de: "Worte",
      fr: "Paroles",
      tr: "Konusma",
      "zh-hans": "言语"
    }
  },
  {
    id: "brotherhood",
    labels: {
      en: "Brotherhood",
      ar: "الأخوة",
      de: "Bruderschaft",
      fr: "Fraternite",
      tr: "Kardeslik",
      "zh-hans": "兄弟情谊"
    }
  },
  {
    id: "neighbors",
    labels: {
      en: "Neighbors",
      ar: "الجيران",
      de: "Nachbarn",
      fr: "Voisins",
      tr: "Komsular",
      "zh-hans": "邻里"
    }
  },
  {
    id: "humility",
    labels: {
      en: "Humility",
      ar: "التواضع",
      de: "Demut",
      fr: "Humilite",
      tr: "Tevazu",
      "zh-hans": "谦逊"
    }
  },
  {
    id: "generosity",
    labels: {
      en: "Generosity",
      ar: "الكرم",
      de: "Grosszuegigkeit",
      fr: "Generosite",
      tr: "Comertlik",
      "zh-hans": "慷慨"
    }
  }
];

function localized(values) {
  return values;
}

function item(definition) {
  return definition;
}

export const HADITH_ITEMS = [
  item({
    id: "intentions-actions",
    category: "intentions",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 1, Sahih Muslim 1907",
    narrator: "Umar ibn al-Khattab",
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    translation: localized({
      en: "Actions are only by intentions, and every person will have only what they intended.",
      ar: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.",
      de: "Taten werden nur nach den Absichten bewertet, und jeder Mensch bekommt nur das, was er beabsichtigt hat.",
      fr: "Les actes ne valent que par les intentions, et chacun n'aura que ce qu'il a eu comme intention.",
      tr: "Ameller ancak niyetlere göredir ve herkese ancak niyet ettigi sey vardir.",
      "zh-hans": "一切行为只凭举意，每个人只能得到他所举意的结果。"
    }),
    lesson: localized({
      en: "A foundational hadith for sincerity, goal-setting, and correcting worship before action.",
      ar: "حديث تأسيسي في الإخلاص وتصحيح القصد قبل العبادة والعمل.",
      de: "Ein grundlegender Hadith fuer Aufrichtigkeit, Zielklarheit und das Korrigieren der Absicht vor jeder Handlung.",
      fr: "Un hadith fondamental pour la sincerite, l'intention juste et la rectification avant l'acte.",
      tr: "Ihlas, hedef berrakligi ve amelden once niyeti duzeltmek icin temel bir hadistir.",
      "zh-hans": "这是一段关于真诚、明确目标以及在行动前先校正举意的基础圣训。"
    }),
    search: ["intentions", "niyyah", "actions", "umar"]
  }),
  item({
    id: "intentions-hearts-deeds",
    category: "intentions",
    grade: "sahih",
    source: "Sahih Muslim 2564c",
    narrator: "Abu Hurayrah",
    arabic: "إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    translation: localized({
      en: "Allah does not look at your appearance or wealth. He looks at your hearts and your deeds."
    }),
    lesson: localized({
      en: "This keeps intention and sincerity above image, status, and external presentation."
    }),
    search: ["intentions", "hearts", "deeds", "sincerity", "abu hurayrah"]
  }),
  item({
    id: "intentions-leave-doubt",
    category: "intentions",
    grade: "sahih",
    source: "Jami at-Tirmidhi 2518",
    narrator: "Al-Hasan ibn Ali",
    arabic: "دَعْ مَا يَرِيبُكَ إِلَى مَا لاَ يَرِيبُكَ فَإِنَّ الصِّدْقَ طُمَأْنِينَةٌ وَإِنَّ الْكَذِبَ رِيبَةٌ",
    translation: localized({
      en: "Leave what makes you doubtful for what does not make you doubtful. Truth brings calm, and falsehood brings doubt."
    }),
    lesson: localized({
      en: "A practical hadith for clean intentions, careful choices, and stepping away from morally cloudy situations."
    }),
    search: ["intentions", "doubt", "certainty", "truth", "hasan ibn ali"]
  }),
  item({
    id: "prayer-first-account",
    category: "prayer",
    grade: "sahih",
    source: "Jami at-Tirmidhi 413",
    narrator: "Abu Hurayrah",
    arabic: "إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ",
    translation: localized({
      en: "The first deed for which the servant will be brought to account on the Day of Resurrection is the prayer.",
      ar: "إن أول ما يحاسب به العبد يوم القيامة من عمله صلاته.",
      de: "Das erste Werk, ueber das der Diener am Tag der Auferstehung zur Rechenschaft gezogen wird, ist sein Gebet.",
      fr: "La premiere oeuvre sur laquelle le serviteur sera juge au Jour de la Resurrection sera sa priere.",
      tr: "Kulun kiyamet gununde amelinden ilk hesaba cekilecegi sey namazidir.",
      "zh-hans": "仆人在复生日首先被清算的行为，就是礼拜。"
    }),
    lesson: localized({
      en: "This hadith keeps salah at the center and makes daily prayer discipline non-negotiable.",
      ar: "يبقي هذا الحديث الصلاة في المركز ويجعل الانضباط اليومي فيها أولوية لا تؤجل.",
      de: "Dieser Hadith ruft das Gebet ins Zentrum und macht taegliche Salah-Disziplin zu einer unverzichtbaren Prioritaet.",
      fr: "Ce hadith replace la priere au centre et rappelle son caractere prioritaire au quotidien.",
      tr: "Bu hadis namazi merkeze alir ve gunluk namaz disiplinini vazgecilmez hale getirir.",
      "zh-hans": "这段圣训把礼拜重新放到核心位置，提醒人必须把每日礼拜的纪律当作首要事务。"
    }),
    search: ["prayer", "salah", "first deed", "account"]
  }),
  item({
    id: "prayer-nearest-in-sujood",
    category: "prayer",
    grade: "sahih",
    source: "Sahih Muslim 482",
    narrator: "Abu Hurayrah",
    arabic: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكْثِرُوا الدُّعَاءَ",
    translation: localized({
      en: "The nearest a servant comes to his Lord is while in prostration, so increase your supplication then."
    }),
    lesson: localized({
      en: "This hadith turns sujood into an active place for dua, humility, and presence in prayer."
    }),
    search: ["prayer", "sujood", "prostration", "dua", "closest"]
  }),
  item({
    id: "prayer-pray-as-seen",
    category: "prayer",
    grade: "sahih",
    source: "Sahih al-Bukhari 631",
    narrator: "Malik ibn al-Huwayrith",
    arabic: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي",
    translation: localized({
      en: "Pray as you have seen me pray."
    }),
    lesson: localized({
      en: "A concise hadith that anchors prayer practice to the Prophetic model rather than habit or assumption."
    }),
    search: ["prayer", "pray as you have seen me", "sunnah prayer", "malik"]
  }),
  item({
    id: "character-best-of-you",
    category: "character",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 3559, Sahih Muslim 2321",
    narrator: "Abdullah ibn Amr",
    arabic: "إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلَاقًا",
    translation: localized({
      en: "The best of you are those who are best in character.",
      ar: "إن من خياركم أحسنكم أخلاقا.",
      de: "Die Besten unter euch sind diejenigen mit dem besten Charakter.",
      fr: "Les meilleurs d'entre vous sont ceux qui ont le meilleur comportement.",
      tr: "Sizin en hayirliniz, ahlaki en guzel olaninizdir.",
      "zh-hans": "你们中最好的人，就是品德最好的人。"
    }),
    lesson: localized({
      en: "It ties faith to conduct and makes daily manners part of serious religious practice.",
      ar: "يربط الإيمان بالسلوك ويجعل حسن الخلق جزءا من التدين الجاد في كل يوم.",
      de: "Er verbindet Glauben mit Verhalten und macht gute Umgangsformen zu einem echten Teil religioeser Praxis.",
      fr: "Il relie la foi au comportement et fait des bonnes manieres une partie reelle de la pratique religieuse.",
      tr: "Imani davranisla baglar ve guzel ahlaki ciddi dini yasayisin parcasi haline getirir.",
      "zh-hans": "它把信仰与行为品格直接联系起来，使好的品德成为严肃宗教实践的一部分。"
    }),
    search: ["character", "akhlaq", "best of you", "manners"]
  }),
  item({
    id: "character-speak-good-or-silent",
    category: "character",
    grade: "sahih",
    source: "Sahih Muslim 47a",
    narrator: "Abu Hurayrah",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translation: localized({
      en: "Whoever believes in Allah and the Last Day should speak good or remain silent."
    }),
    lesson: localized({
      en: "It makes discipline of speech part of faith and resets online, social, and family speech standards."
    }),
    search: ["character", "speech", "silence", "good words", "faith"]
  }),
  item({
    id: "character-love-for-brother",
    category: "character",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 13, Sahih Muslim 45a",
    narrator: "Anas ibn Malik",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: localized({
      en: "None of you truly believes until he loves for his brother what he loves for himself."
    }),
    lesson: localized({
      en: "This hadith pushes faith out of theory and into empathy, fairness, and sincere goodwill toward others."
    }),
    search: ["character", "brother", "love for others", "faith", "anas"]
  }),
  item({
    id: "character-control-anger",
    category: "character",
    grade: "sahih",
    source: "Sahih al-Bukhari 6114",
    narrator: "Abu Hurayrah",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    translation: localized({
      en: "The strong person is not the one who overpowers others, but the one who controls himself when angry."
    }),
    lesson: localized({
      en: "It redefines strength as self-mastery and makes anger control part of real character."
    }),
    search: ["character", "anger", "strength", "self-control", "abu hurayrah"]
  }),
  item({
    id: "knowledge-path",
    category: "knowledge",
    grade: "sahih",
    source: "Sahih Muslim 2699",
    narrator: "Abu Hurayrah",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    translation: localized({
      en: "Whoever travels a path seeking knowledge, Allah will make a path to Paradise easy for him through it.",
      ar: "من سلك طريقا يلتمس فيه علما سهل الله له به طريقا إلى الجنة.",
      de: "Wer einen Weg einschlaegt, um Wissen zu suchen, dem erleichtert Allah dadurch einen Weg ins Paradies.",
      fr: "Celui qui emprunte un chemin pour rechercher la science, Allah lui facilite par cela un chemin vers le Paradis.",
      tr: "Kim ilim aramak icin bir yola girerse, Allah onun icin bu sebeple cennete giden yolu kolaylastirir.",
      "zh-hans": "谁走上一条求知识的道路，真主就因这条路而为他开辟通往乐园的道路。"
    }),
    lesson: localized({
      en: "A short hadith that rewards consistency in study, classes, reading, and disciplined learning.",
      ar: "حديث قصير يعظم الثبات على التعلم والدروس والقراءة وطلب العلم المنظم.",
      de: "Ein kurzer Hadith, der Beständigkeit im Lernen, Lesen und geregelten Wissenserwerb stark aufwertet.",
      fr: "Un hadith concis qui valorise la constance dans l'etude, la lecture et l'apprentissage discipline.",
      tr: "Derslere, okumaya ve duzenli ilim talebine devam etmeyi guclu sekilde tesvik eden kisa bir hadistir.",
      "zh-hans": "这是一段鼓励持续学习、听课、阅读和有纪律求知的简明圣训。"
    }),
    search: ["knowledge", "ilm", "study", "path to paradise"]
  }),
  item({
    id: "knowledge-understanding-religion",
    category: "knowledge",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 71",
    narrator: "Muawiyah",
    arabic: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
    translation: localized({
      en: "When Allah wants good for a person, He grants him understanding in the religion."
    }),
    lesson: localized({
      en: "This makes sound understanding a sign of divine favor, not just information accumulation."
    }),
    search: ["knowledge", "understanding religion", "fiqh", "muawiyah"]
  }),
  item({
    id: "knowledge-concealing-knowledge",
    category: "knowledge",
    grade: "hasan",
    source: "Sunan Abi Dawud 3658",
    narrator: "Abu Hurayrah",
    arabic: "مَنْ سُئِلَ عَنْ عِلْمٍ فَكَتَمَهُ أُلْجِمَ بِلِجَامٍ مِنْ نَارٍ يَوْمَ الْقِيَامَةِ",
    translation: localized({
      en: "Whoever is asked about knowledge and conceals it will be bridled with fire on the Day of Resurrection."
    }),
    lesson: localized({
      en: "It warns against selfish gatekeeping and frames beneficial teaching as a responsibility."
    }),
    search: ["knowledge", "teaching", "concealing knowledge", "responsibility"]
  }),
  item({
    id: "gratitude-to-people",
    category: "gratitude",
    grade: "sahih",
    source: "Jami at-Tirmidhi 1954",
    narrator: "Abu Hurayrah",
    arabic: "مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ",
    translation: localized({
      en: "Whoever does not thank people does not thank Allah.",
      ar: "من لا يشكر الناس لا يشكر الله.",
      de: "Wer den Menschen nicht dankt, dankt Allah nicht.",
      fr: "Celui qui ne remercie pas les gens ne remercie pas Allah.",
      tr: "Insanlara tesekkur etmeyen, Allah'a da sukur etmez.",
      "zh-hans": "不感谢人者，也不会真正感谢真主。"
    }),
    lesson: localized({
      en: "It turns gratitude into a social practice, not just a private feeling.",
      ar: "يجعل الشكر سلوكا عمليا مع الناس لا مجرد شعور داخلي فقط.",
      de: "Er macht Dankbarkeit zu einer sozialen Praxis und nicht nur zu einem inneren Gefuehl.",
      fr: "Il transforme la gratitude en pratique sociale et pas seulement en sentiment interieur.",
      tr: "Sukru sadece icsel bir his degil, insanlarla ilgili fiili bir davranis haline getirir.",
      "zh-hans": "它把感恩从内心感受，转化成与人相处中的实际行为。"
    }),
    search: ["gratitude", "thanks", "people", "shukr"]
  }),
  item({
    id: "gratitude-praise-after-food",
    category: "gratitude",
    grade: "sahih",
    source: "Sahih Muslim 2734a",
    narrator: "Anas ibn Malik",
    arabic: "إِنَّ اللَّهَ لَيَرْضَى عَنِ الْعَبْدِ أَنْ يَأْكُلَ الأَكْلَةَ فَيَحْمَدَهُ عَلَيْهَا أَوْ يَشْرَبَ الشَّرْبَةَ فَيَحْمَدَهُ عَلَيْهَا",
    translation: localized({
      en: "Allah is pleased with the servant who praises Him after eating food or drinking."
    }),
    lesson: localized({
      en: "This hadith makes gratitude concrete in ordinary daily routines, not just major moments."
    }),
    search: ["gratitude", "alhamdulillah", "food", "drink", "anas"]
  }),
  item({
    id: "gratitude-affair-believer",
    category: "gratitude",
    grade: "sahih",
    source: "Sahih Muslim 2999",
    narrator: "Suhayb",
    arabic: "عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
    translation: localized({
      en: "Amazing is the affair of the believer. Every matter of his is good for him."
    }),
    lesson: localized({
      en: "It trains a believer to read ease through gratitude and hardship through patience."
    }),
    search: ["gratitude", "believer", "patience", "good in every affair", "suhayb"]
  }),
  item({
    id: "mercy-shown-mercy",
    category: "mercy",
    grade: "hasan",
    source: "Jami at-Tirmidhi 1924",
    narrator: "Abdullah ibn Amr",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ",
    translation: localized({
      en: "The merciful are shown mercy by the Most Merciful.",
      ar: "الراحمون يرحمهم الرحمن.",
      de: "Den Barmherzigen erweist der Allerbarmer Barmherzigkeit.",
      fr: "Les misericordieux recoivent la misericorde du Tout Misericordieux.",
      tr: "Merhamet edenlere Rahman merhamet eder.",
      "zh-hans": "慈悯他人者，将蒙至仁主的慈悯。"
    }),
    lesson: localized({
      en: "This hadith makes mercy a daily standard in family life, speech, correction, and leadership.",
      ar: "يجعل هذا الحديث الرحمة معيارا يوميا في البيت والكلام والتوجيه وتحمل المسؤولية.",
      de: "Dieser Hadith macht Barmherzigkeit zu einem taeglichen Massstab in Familie, Sprache, Korrektur und Verantwortung.",
      fr: "Ce hadith fait de la misericorde une norme quotidienne dans la famille, la parole, la correction et la responsabilite.",
      tr: "Bu hadis merhameti ailede, konusmada, duzeltmede ve sorumlulukta gunluk bir olcu haline getirir.",
      "zh-hans": "这段圣训把怜悯变成家庭、言语、劝导和承担责任中的日常标准。"
    }),
    search: ["mercy", "merciful", "rahman", "compassion"]
  }),
  item({
    id: "mercy-not-shown-mercy",
    category: "mercy",
    grade: "hasan",
    source: "Al-Adab Al-Mufrad 95",
    narrator: "Abu Said al-Khudri",
    arabic: "مَنْ لاَ يَرْحَمُ لاَ يُرْحَمُ",
    translation: localized({
      en: "Whoever does not show mercy will not be shown mercy."
    }),
    lesson: localized({
      en: "A direct warning that mercy is not optional softness but a condition that shapes how one is treated."
    }),
    search: ["mercy", "show mercy", "compassion", "abu said"]
  }),
  item({
    id: "mercy-young-and-elders",
    category: "mercy",
    grade: "sahih",
    source: "Sunan Abi Dawud 4943",
    narrator: "Abdullah ibn Amr",
    arabic: "مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيَعْرِفْ حَقَّ كَبِيرِنَا فَلَيْسَ مِنَّا",
    translation: localized({
      en: "Whoever does not show mercy to our young and recognize the right of our elders is not from us."
    }),
    lesson: localized({
      en: "It ties mercy to community structure: tenderness to the young and respect toward elders."
    }),
    search: ["mercy", "young", "elders", "respect", "community"]
  }),
  item({
    id: "repentance-allah-loves-return",
    category: "repentance",
    grade: "sahih",
    source: "Sahih Muslim 2744c",
    narrator: "Abdullah ibn Masud",
    arabic: "لَلَّهُ أَشَدُّ فَرَحًا بِتَوْبَةِ عَبْدِهِ الْمُؤْمِنِ",
    translation: localized({
      en: "Allah is more pleased with the repentance of His believing servant than a man who finds his lost mount in the desert.",
      de: "Allah freut sich ueber die Reue Seines glaeubigen Dieners mehr als ein Mensch, der in der Wueste sein verlorenes Reittier wiederfindet."
    }),
    lesson: localized({
      en: "This hadith keeps repentance open and hopeful. It pushes a person away from despair and back toward return.",
      de: "Dieser Hadith haelt die Tuer der Reue offen und hoffnungsvoll. Er fuehrt vom Verzweifeln zur Rueckkehr."
    }),
    search: ["repentance", "tawbah", "return", "forgiveness", "despair", "ibn masud"]
  }),
  item({
    id: "repentance-day-and-night",
    category: "repentance",
    grade: "sahih",
    source: "Sahih Muslim 2759a",
    narrator: "Abu Musa al-Ashari",
    arabic: "إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ وَيَبْسُطُهَا بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ",
    translation: localized({
      en: "Allah stretches out His Hand at night so that the sinner of the day may repent, and He stretches it out by day so that the sinner of the night may repent.",
      de: "Allah streckt Seine Hand in der Nacht aus, damit der Suender des Tages bereut, und am Tag, damit der Suender der Nacht bereut."
    }),
    lesson: localized({
      en: "It makes tawbah a constant path, not a rare emergency. The door stays open while life remains.",
      de: "Er macht die Tauba zu einem staendigen Weg und nicht zu einem seltenen Notfall. Die Tuer bleibt offen, solange das Leben bleibt."
    }),
    search: ["repentance", "day", "night", "tawbah", "abu musa"]
  }),
  item({
    id: "repentance-hundred-kills",
    category: "repentance",
    grade: "sahih",
    source: "Sahih Muslim 2766a",
    narrator: "Abu Said al-Khudri",
    arabic: "وَمَنْ يَحُولُ بَيْنَكَ وَبَيْنَ التَّوْبَةِ",
    translation: localized({
      en: "Even the man who had killed one hundred people was shown that repentance was still open to him when he turned sincerely toward Allah.",
      de: "Sogar dem Mann, der hundert Menschen getoetet hatte, wurde gezeigt, dass Reue fuer ihn noch offen war, als er sich aufrichtig Allah zuwandte."
    }),
    lesson: localized({
      en: "This hadith makes a hard point: no one should close the door of repentance that Allah has left open.",
      de: "Dieser Hadith macht einen harten Punkt klar: Niemand darf eine Reuetuer schliessen, die Allah offengelassen hat."
    }),
    search: ["repentance", "hundred", "kills", "forgiveness", "abu said"]
  }),
  item({
    id: "patience-amazing-affair",
    category: "patience",
    grade: "sahih",
    source: "Sahih Muslim 2999",
    narrator: "Suhayb",
    arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
    translation: localized({
      en: "How wonderful is the affair of the believer. Every matter of his is good for him: gratitude in ease and patience in hardship.",
      de: "Wie erstaunlich ist die Angelegenheit des Glaeubigen. Jede seiner Lagen ist gut fuer ihn: Dankbarkeit in Erleichterung und Geduld in Bedraengnis."
    }),
    lesson: localized({
      en: "It frames patience as part of a larger believer mindset, not as passive suffering.",
      de: "Er zeigt Geduld als Teil einer ganzen Haltung des Glaeubigen und nicht als passives Leiden."
    }),
    search: ["patience", "sabr", "believer", "gratitude", "suhayb"]
  }),
  item({
    id: "patience-first-strike",
    category: "patience",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 1283, Sahih Muslim 926",
    narrator: "Anas ibn Malik",
    arabic: "إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الْأُولَى",
    translation: localized({
      en: "True patience is at the first strike of calamity.",
      de: "Wahre Geduld zeigt sich beim ersten Schlag der Pruefung."
    }),
    lesson: localized({
      en: "This defines sabr at the moment of impact, when reaction is hardest to control.",
      de: "Das definiert Sabr im Moment des Einschlags, wenn die Reaktion am schwersten zu beherrschen ist."
    }),
    search: ["patience", "first strike", "calamity", "anas", "sabr"]
  }),
  item({
    id: "patience-sins-fall-away",
    category: "patience",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 5641, Sahih Muslim 2573",
    narrator: "Abu Saeed al-Khudri and Abu Hurayrah",
    arabic: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلاَ وَصَبٍ وَلاَ هَمٍّ وَلاَ حُزْنٍ وَلاَ أَذًى وَلاَ غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلاَّ كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
    translation: localized({
      en: "No fatigue, illness, anxiety, grief, harm, or distress afflicts a Muslim except that Allah expiates sins through it.",
      de: "Keine Muedigkeit, Krankheit, Sorge, Trauer, Schaeden oder Bedraengnis trifft einen Muslim, ohne dass Allah dadurch Suenden tilgt."
    }),
    lesson: localized({
      en: "It gives hardship meaning without glorifying pain. Trials can purify while the believer remains steady.",
      de: "Er gibt Bedraengnis Sinn, ohne Schmerz zu verherrlichen. Pruefungen koennen reinigen, waehrend der Glaeubige standhaft bleibt."
    }),
    search: ["patience", "hardship", "sins", "distress", "abu saeed", "abu hurayrah"]
  }),
  item({
    id: "family-best-to-family",
    category: "family",
    grade: "hasan",
    source: "Sunan Ibn Majah 1977",
    narrator: "Ibn Abbas",
    arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ وَأَنَا خَيْرُكُمْ لِأَهْلِي",
    translation: localized({
      en: "The best of you are those who are best to their families, and I am the best of you to my family.",
      de: "Die Besten unter euch sind diejenigen, die ihre Familie am besten behandeln, und ich bin der Beste von euch zu meiner Familie."
    }),
    lesson: localized({
      en: "It moves religious excellence into the home, where character is hardest to fake and easiest to test.",
      de: "Er verlegt religioese Vorzueglichkeit in das Zuhause, wo Charakter am schwersten zu spielen und am leichtesten zu pruefen ist."
    }),
    search: ["family", "wife", "home", "best to family", "ibn abbas"]
  }),
  item({
    id: "family-orphan-care",
    category: "family",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 6005",
    narrator: "Sahl ibn Sad",
    arabic: "أَنَا وَكَافِلُ الْيَتِيمِ فِي الْجَنَّةِ هَكَذَا",
    translation: localized({
      en: "I and the one who cares for an orphan will be like this in Paradise, and he joined his index and middle fingers.",
      de: "Ich und derjenige, der sich um ein Waisenkind kuemmert, werden im Paradies so sein, und er legte Zeige- und Mittelfinger zusammen."
    }),
    lesson: localized({
      en: "It lifts orphan care from charity language into companionship with the Prophet in Paradise.",
      de: "Er hebt die Sorge um Waisen aus der blossen Wohltaetigkeit heraus und verbindet sie mit Naehe zum Propheten im Paradies."
    }),
    search: ["family", "orphan", "care", "paradise", "sahl"]
  }),
  item({
    id: "family-kinship-ties",
    category: "family",
    grade: "muttafaqun-alayh",
    source: "Riyad as-Salihin 330",
    narrator: "Amr ibn al-As",
    arabic: "وَلَكِنْ لَهُمْ رَحِمٌ أَبُلُّهَا بِبِلَالِهَا",
    translation: localized({
      en: "Even where loyalty did not belong, the Prophet still affirmed that ties of kinship must be maintained.",
      de: "Selbst dort, wo keine besondere Loyalitaet bestand, bekraeftigte der Prophet, dass Verwandtschaftsbande erhalten werden muessen."
    }),
    lesson: localized({
      en: "It teaches that family ties are not maintained only when relationships are easy or emotionally rewarding.",
      de: "Er lehrt, dass Familienbande nicht nur dann gepflegt werden, wenn Beziehungen leicht oder emotional angenehm sind."
    }),
    search: ["family", "kinship", "silat ar-rahim", "amr ibn al-as"]
  }),
  item({
    id: "truthfulness-leads-to-righteousness",
    category: "truthfulness",
    grade: "muttafaqun-alayh",
    source: "Riyad as-Salihin 54",
    narrator: "Abdullah ibn Masud",
    arabic: "إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
    translation: localized({
      en: "Truthfulness leads to righteousness, and righteousness leads to Paradise. Persistent lying leads to wickedness and the Fire.",
      de: "Wahrhaftigkeit fuehrt zur Rechtschaffenheit, und Rechtschaffenheit fuehrt ins Paradies. Beharrliches Luegen fuehrt zur Verdorbenheit und ins Feuer."
    }),
    lesson: localized({
      en: "This hadith treats truthfulness as a path that shapes the whole person, not just isolated statements.",
      de: "Dieser Hadith behandelt Wahrhaftigkeit als einen Weg, der den ganzen Menschen praegt und nicht nur einzelne Aussagen."
    }),
    search: ["truthfulness", "sidq", "truth", "lying", "ibn masud"]
  }),
  item({
    id: "truthfulness-honest-merchant",
    category: "truthfulness",
    grade: "hasan",
    source: "Jami at-Tirmidhi 1209",
    narrator: "Abu Said al-Khudri",
    arabic: "التَّاجِرُ الصَّدُوقُ الْأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ",
    translation: localized({
      en: "The truthful and trustworthy merchant will be with the Prophets, the truthful, and the martyrs.",
      de: "Der wahrhaftige und vertrauenswuerdige Kaufmann wird mit den Propheten, den Wahrhaftigen und den Maertyrern sein."
    }),
    lesson: localized({
      en: "It brings honesty into contracts, pricing, promises, and business conduct rather than leaving religion outside work.",
      de: "Er bringt Ehrlichkeit in Vertraege, Preise, Zusagen und Geschaeftspraxis und laesst Religion nicht vor der Arbeitstuer enden."
    }),
    search: ["truthfulness", "merchant", "trustworthy", "business", "abu saeed"]
  }),
  item({
    id: "truthfulness-clarity-in-trade",
    category: "truthfulness",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 2079, Sahih Muslim 1532",
    narrator: "Hakim ibn Hizam",
    arabic: "فَإِنْ صَدَقَا وَبَيَّنَا بُورِكَ لَهُمَا فِي بَيْعِهِمَا وَإِنْ كَتَمَا وَكَذَبَا مُحِقَتْ بَرَكَةُ بَيْعِهِمَا",
    translation: localized({
      en: "If both parties are truthful and clear, they are blessed in their sale; if they lie and conceal, the blessing of their sale is erased.",
      de: "Wenn beide Parteien wahrhaftig und klar sind, wird ihr Handel gesegnet; wenn sie luegen und verschweigen, wird der Segen ihres Handels ausgeloescht."
    }),
    lesson: localized({
      en: "This makes truthfulness measurable in transactions: transparency increases barakah; concealment destroys it.",
      de: "Er macht Wahrhaftigkeit im Handel messbar: Transparenz vermehrt Baraka, Verschweigen zerstoert sie."
    }),
    search: ["truthfulness", "trade", "business", "clarity", "barakah", "hakim ibn hizam"]
  }),
  item({
    id: "trust-birds-provision",
    category: "trust",
    grade: "hasan",
    source: "Jami at-Tirmidhi 2344",
    narrator: "Umar ibn al-Khattab",
    arabic: "لَوْ أَنَّكُمْ كُنْتُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُكُمْ كَمَا تُرْزَقُ الطَّيْرُ",
    translation: localized({
      en: "If you relied upon Allah with the reliance He is due, He would provide for you as He provides for the birds: they leave hungry and return full.",
      de: "Wenn ihr auf Allah mit dem rechten Tawakkul vertrauen wuerdet, wuerde Er euch versorgen, wie Er die Voegel versorgt: Sie ziehen hungrig aus und kommen satt zurueck."
    }),
    lesson: localized({
      en: "It ties tawakkul to movement and effort. The birds still leave their nests and seek provision.",
      de: "Er verbindet Tawakkul mit Bewegung und Einsatz. Die Voegel bleiben nicht im Nest, sondern fliegen aus und suchen Versorgung."
    }),
    search: ["trust", "tawakkul", "birds", "provision", "umar"]
  }),
  item({
    id: "trust-tie-camel",
    category: "trust",
    grade: "hasan",
    source: "Jami at-Tirmidhi 2517",
    narrator: "Anas ibn Malik",
    arabic: "اعْقِلْهَا وَتَوَكَّلْ",
    translation: localized({
      en: "Tie it and then rely upon Allah.",
      de: "Binde sie fest und vertraue dann auf Allah."
    }),
    lesson: localized({
      en: "This hadith removes the false split between planning and trust. Real tawakkul includes taking responsible means.",
      de: "Dieser Hadith beseitigt den falschen Gegensatz zwischen Planung und Vertrauen. Echter Tawakkul schliesst verantwortliche Mittel ein."
    }),
    search: ["trust", "tawakkul", "tie camel", "means", "anas"]
  }),
  item({
    id: "trust-ask-allah-alone",
    category: "trust",
    grade: "sahih",
    source: "Jami at-Tirmidhi 2516",
    narrator: "Ibn Abbas",
    arabic: "إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ",
    translation: localized({
      en: "When you ask, ask Allah; and when you seek help, seek help from Allah.",
      de: "Wenn du bittest, dann bitte Allah; und wenn du Hilfe suchst, dann suche Hilfe bei Allah."
    }),
    lesson: localized({
      en: "It builds tawakkul at the root level: dependence begins in the heart before it appears in outward action.",
      de: "Er baut Tawakkul an der Wurzel auf: Abhaengigkeit beginnt im Herzen, bevor sie im aeusseren Handeln sichtbar wird."
    }),
    search: ["trust", "tawakkul", "ask Allah", "seek help", "ibn abbas"]
  }),
  item({
    id: "parents-mother-then-father",
    category: "parents",
    grade: "sahih",
    source: "Sahih Muslim 2548a",
    narrator: "Abu Hurayrah",
    arabic: "أُمُّكَ ثُمَّ أُمُّكَ ثُمَّ أُمُّكَ ثُمَّ أَبُوكَ",
    translation: localized({
      en: "Your mother, then your mother, then your mother, then your father.",
      de: "Deine Mutter, dann deine Mutter, dann deine Mutter, dann dein Vater."
    }),
    lesson: localized({
      en: "This hadith gives parents, especially mothers, a clear rank in daily duty, service, and gratitude.",
      de: "Dieser Hadith gibt den Eltern und besonders der Mutter einen klaren Rang in taeglicher Pflicht, Dienst und Dankbarkeit."
    }),
    search: ["parents", "mother", "father", "good treatment", "abu hurayrah"]
  }),
  item({
    id: "parents-best-deed-after-prayer",
    category: "parents",
    grade: "sahih",
    source: "Sahih Muslim 85a",
    narrator: "Abdullah ibn Masud",
    arabic: "سَأَلْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم أَىُّ الْعَمَلِ أَفْضَلُ قَالَ الصَّلاَةُ لِوَقْتِهَا . قَالَ قُلْتُ ثُمَّ أَىٌّ قَالَ بِرُّ الْوَالِدَيْنِ . قَالَ قُلْتُ ثُمَّ أَىٌّ قَالَ الْجِهَادُ فِي سَبِيلِ اللَّهِ",
    translation: localized({
      en: "The best deed is prayer at its proper time, then kindness to the parents, then striving in the path of Allah.",
      de: "Die beste Tat ist das Gebet zu seiner Zeit, dann Guete zu den Eltern, dann der Einsatz auf Allahs Weg."
    }),
    lesson: localized({
      en: "It places dutifulness to parents immediately after salah in the order of major deeds.",
      de: "Er stellt die Guete zu den Eltern direkt nach dem Gebet in die Reihenfolge der grossen Taten."
    }),
    search: ["parents", "best deed", "prayer", "kindness", "ibn masud"]
  }),
  item({
    id: "parents-old-age-paradise",
    category: "parents",
    grade: "sahih",
    source: "Sahih Muslim 2551",
    narrator: "Abu Hurayrah",
    arabic: "رَغِمَ أَنْفُهُ ثُمَّ رَغِمَ أَنْفُهُ ثُمَّ رَغِمَ أَنْفُهُ . قِيلَ مَنْ يَا رَسُولَ اللَّهِ قَالَ مَنْ أَدْرَكَ وَالِدَيْهِ عِنْدَ الْكِبَرِ أَحَدَهُمَا أَوْ كِلَيْهِمَا ثُمَّ لَمْ يَدْخُلِ الْجَنَّةَ",
    translation: localized({
      en: "Disgrace be upon the one who reaches the old age of one or both of his parents and still does not enter Paradise through serving them.",
      de: "Erniedrigt sei, wer das Alter eines oder beider Eltern erlebt und trotzdem nicht durch ihren Dienst ins Paradies eintritt."
    }),
    lesson: localized({
      en: "This hadith turns caring for aging parents into a direct road to Paradise, not a secondary social duty.",
      de: "Dieser Hadith macht die Pflege alternder Eltern zu einem direkten Weg ins Paradies und nicht zu einer blossen Nebensache."
    }),
    search: ["parents", "old age", "paradise", "service", "abu hurayrah"]
  }),
  item({
    id: "speech-good-or-silent",
    category: "speech",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 6018, Sahih Muslim 47",
    narrator: "Abu Hurayrah",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translation: localized({
      en: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
      de: "Wer an Allah und den Juengsten Tag glaubt, soll Gutes sagen oder schweigen."
    }),
    lesson: localized({
      en: "It sets a disciplined standard for speech: beneficial words or silence.",
      de: "Er setzt einen disziplinierten Massstab fuer Sprache: nuetzliche Worte oder Schweigen."
    }),
    search: ["speech", "good or silent", "tongue", "last day", "abu hurayrah"]
  }),
  item({
    id: "speech-muslim-safe-tongue-hand",
    category: "speech",
    grade: "sahih",
    source: "Sahih Muslim 41",
    narrator: "Jabir ibn Abdullah",
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    translation: localized({
      en: "A Muslim is the one from whose tongue and hand the Muslims are safe.",
      de: "Ein Muslim ist derjenige, vor dessen Zunge und Hand die Muslime sicher sind."
    }),
    lesson: localized({
      en: "The hadith measures faith through the safety you create for others, especially through speech.",
      de: "Der Hadith misst Glauben daran, wie sicher andere vor dir sind, besonders vor deiner Zunge."
    }),
    search: ["speech", "tongue", "hand", "safe", "jabir"]
  }),
  item({
    id: "speech-word-raises-or-destroys",
    category: "speech",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 6478, Sahih Muslim 2988",
    narrator: "Abu Hurayrah",
    arabic: "إِنَّ الْعَبْدَ لَيَتَكَلَّمُ بِالْكَلِمَةِ مِنْ رِضْوَانِ اللَّهِ لاَ يُلْقِي لَهَا بَالاً، يَرْفَعُ اللَّهُ بِهَا دَرَجَاتٍ، وَإِنَّ الْعَبْدَ لَيَتَكَلَّمُ بِالْكَلِمَةِ مِنْ سَخَطِ اللَّهِ لاَ يُلْقِي لَهَا بَالاً يَهْوِي بِهَا فِي جَهَنَّمَ",
    translation: localized({
      en: "A servant may speak a word pleasing to Allah and be raised by it, and may speak a word of His anger and fall because of it.",
      de: "Ein Diener kann ein Wort sprechen, das Allah gefaellt, und dadurch erhoben werden; und ein Wort sprechen, das Allahs Zorn bringt, und dadurch fallen."
    }),
    lesson: localized({
      en: "It forces seriousness around everyday speech. A single sentence can carry weight far beyond the moment.",
      de: "Er zwingt zu Ernsthaftigkeit bei alltglicher Sprache. Ein einziger Satz kann weit mehr Gewicht haben als der Moment erkennen laesst."
    }),
    search: ["speech", "word", "tongue", "raises", "destroys", "abu hurayrah"]
  }),
  item({
    id: "brotherhood-love-for-brother",
    category: "brotherhood",
    grade: "sahih",
    source: "Sahih Muslim 45a",
    narrator: "Anas ibn Malik",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translation: localized({
      en: "None of you truly believes until he loves for his brother what he loves for himself.",
      de: "Keiner von euch glaubt wirklich, bis er fuer seinen Bruder liebt, was er fuer sich selbst liebt."
    }),
    lesson: localized({
      en: "It turns brotherhood from a slogan into a measurable inner standard.",
      de: "Er macht Bruderschaft von einem Schlagwort zu einem messbaren inneren Massstab."
    }),
    search: ["brotherhood", "brother", "faith", "love", "anas"]
  }),
  item({
    id: "brotherhood-muslim-does-not-wrong",
    category: "brotherhood",
    grade: "sahih",
    source: "Sahih Muslim 2564b",
    narrator: "Abu Hurayrah",
    arabic: "الْمُسْلِمُ أَخُو الْمُسْلِمِ لاَ يَظْلِمُهُ وَلاَ يَخْذُلُهُ وَلاَ يَحْقِرُهُ",
    translation: localized({
      en: "The Muslim is the brother of the Muslim: he does not wrong him, abandon him, or belittle him.",
      de: "Der Muslim ist der Bruder des Muslims: Er tut ihm kein Unrecht, laesst ihn nicht im Stich und verachtet ihn nicht."
    }),
    lesson: localized({
      en: "The hadith defines brotherhood through concrete duties, not vague good feeling.",
      de: "Der Hadith definiert Bruderschaft durch konkrete Pflichten und nicht durch ein vages gutes Gefuehl."
    }),
    search: ["brotherhood", "wrong", "abandon", "belittle", "abu hurayrah"]
  }),
  item({
    id: "brotherhood-no-envy-no-hate",
    category: "brotherhood",
    grade: "muttafaqun-alayh",
    source: "Sahih Muslim 2563a",
    narrator: "Abu Hurayrah",
    arabic: "إِيَّاكُمْ وَالظَّنَّ فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ وَلاَ تَحَسَّسُوا وَلاَ تَجَسَّسُوا وَلاَ تَنَافَسُوا وَلاَ تَحَاسَدُوا وَلاَ تَبَاغَضُوا وَلاَ تَدَابَرُوا وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا",
    translation: localized({
      en: "Do not envy one another, do not hate one another, and be servants of Allah as brothers.",
      de: "Beneidet einander nicht, hasst einander nicht und seid als Diener Allahs Brueder."
    }),
    lesson: localized({
      en: "It protects brotherhood from the inner diseases that quietly break communities apart.",
      de: "Er schuetzt Bruderschaft vor inneren Krankheiten, die Gemeinschaften leise auseinanderbrechen lassen."
    }),
    search: ["brotherhood", "envy", "hate", "brothers", "abu hurayrah"]
  }),
  item({
    id: "neighbors-jibril-kept-advising",
    category: "neighbors",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 6014, Sahih Muslim 2624a",
    narrator: "Aishah",
    arabic: "مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ حَتَّى ظَنَنْتُ أَنَّهُ سَيُوَرِّثُهُ",
    translation: localized({
      en: "Jibril kept advising me regarding the neighbor until I thought he would make him an heir.",
      de: "Jibril hat mich fortwhrend zum Nachbarn ermahnt, bis ich dachte, er werde ihn zum Erben machen."
    }),
    lesson: localized({
      en: "The hadith raises neighborly conduct from courtesy into a repeatedly emphasized religious duty.",
      de: "Der Hadith hebt gutes Verhalten gegenueber Nachbarn von einer Hoeflichkeit zu einer wiederholt betonten religioesen Pflicht."
    }),
    search: ["neighbors", "jibril", "heir", "aishah", "kindness"]
  }),
  item({
    id: "neighbors-not-safe-from-harm",
    category: "neighbors",
    grade: "sahih",
    source: "Sahih Muslim 46",
    narrator: "Abu Hurayrah",
    arabic: "لاَ يَدْخُلُ الْجَنَّةَ مَنْ لاَ يَأْمَنُ جَارُهُ بَوَائِقَهُ",
    translation: localized({
      en: "He will not enter Paradise whose neighbor is not safe from his harm.",
      de: "Nicht wird ins Paradies eintreten, wessen Nachbar vor seinem Schaden nicht sicher ist."
    }),
    lesson: localized({
      en: "This hadith makes neighborly harm a major moral failure, not a minor social flaw.",
      de: "Dieser Hadith macht Nachbarsschaden zu einem grossen moralischen Versagen und nicht zu einem kleinen sozialen Fehler."
    }),
    search: ["neighbors", "harm", "safe", "paradise", "abu hurayrah"]
  }),
  item({
    id: "neighbors-best-to-neighbor",
    category: "neighbors",
    grade: "hasan",
    source: "Jami at-Tirmidhi 1944",
    narrator: "Abdullah ibn Amr",
    arabic: "خَيْرُ الْجِيرَانِ عِنْدَ اللَّهِ خَيْرُهُمْ لِجَارِهِ",
    translation: localized({
      en: "The best neighbors with Allah are those who are best to their neighbors.",
      de: "Die besten Nachbarn bei Allah sind diejenigen, die zu ihren Nachbarn am besten sind."
    }),
    lesson: localized({
      en: "It gives a positive target for neighborly excellence instead of only warning against harm.",
      de: "Er gibt ein positives Ziel fuer nachbarschaftliche Vorzueglichkeit, statt nur vor Schaden zu warnen."
    }),
    search: ["neighbors", "best neighbor", "companion", "abdullah ibn amr"]
  }),
  item({
    id: "humility-no-arrogance-enters-paradise",
    category: "humility",
    grade: "sahih",
    source: "Sahih Muslim 91a",
    narrator: "Abdullah ibn Masud",
    arabic: "لاَ يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ",
    translation: localized({
      en: "No one who has an atom's weight of arrogance in his heart will enter Paradise.",
      de: "Niemand, in dessen Herzen das Gewicht eines Staubkorns an Hochmut ist, wird ins Paradies eintreten."
    }),
    lesson: localized({
      en: "It makes humility a salvation issue, not just a personality trait.",
      de: "Er macht Demut zu einer Frage des Heils und nicht nur zu einer Charaktereigenschaft."
    }),
    search: ["humility", "arrogance", "paradise", "pride", "ibn masud"]
  }),
  item({
    id: "humility-allah-commanded-humility",
    category: "humility",
    grade: "sahih",
    source: "Sahih Muslim 2865d",
    narrator: "Iyad ibn Himar",
    arabic: "إِنَّ اللَّهَ أَوْحَى إِلَيَّ أَنْ تَوَاضَعُوا حَتَّى لاَ يَفْخَرَ أَحَدٌ عَلَى أَحَدٍ",
    translation: localized({
      en: "Allah revealed to me that you should be humble so that none of you boasts over another.",
      de: "Allah hat mir offenbart, dass ihr demtig sein sollt, damit keiner sich ueber den anderen erhebt."
    }),
    lesson: localized({
      en: "This makes humility a revealed social ethic, not just private self-improvement.",
      de: "Das macht Demut zu einer offenbarten sozialen Ethik und nicht nur zu einer privaten Selbstverbesserung."
    }),
    search: ["humility", "boast", "revealed", "iyad ibn himar"]
  }),
  item({
    id: "humility-people-of-paradise-weak",
    category: "humility",
    grade: "sahih",
    source: "Sahih Muslim 2853c",
    narrator: "Haritha ibn Wahb",
    arabic: "أَلاَ أُخْبِرُكُمْ بِأَهْلِ الْجَنَّةِ كُلُّ ضَعِيفٍ مُتَضَعَّفٍ",
    translation: localized({
      en: "Shall I not tell you about the people of Paradise? Every humble and meek person whom others look down upon.",
      de: "Soll ich euch nicht von den Leuten des Paradieses berichten? Jeder demtige und sanfte Mensch, auf den andere herabblicken."
    }),
    lesson: localized({
      en: "It breaks the habit of measuring worth by status, force, or display.",
      de: "Er zerbricht die Gewohnheit, Wert nach Status, Haerte oder Selbstdarstellung zu messen."
    }),
    search: ["humility", "paradise", "meek", "weak", "haritha ibn wahb"]
  }),
  item({
    id: "generosity-upper-hand-better",
    category: "generosity",
    grade: "sahih",
    source: "Sahih Muslim 1033",
    narrator: "Abdullah ibn Umar",
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    translation: localized({
      en: "The upper hand is better than the lower hand; the upper gives and the lower asks.",
      de: "Die obere Hand ist besser als die untere; die obere gibt und die untere bittet."
    }),
    lesson: localized({
      en: "It pushes the believer toward giving, self-restraint from begging, and responsible provision.",
      de: "Er drngt den Glaeubigen zum Geben, zur Zurueckhaltung vor Bettelei und zu verantwortlicher Versorgung."
    }),
    search: ["generosity", "upper hand", "charity", "giving", "ibn umar"]
  }),
  item({
    id: "generosity-half-date-fire",
    category: "generosity",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 1417, Sahih Muslim 1016b",
    narrator: "Adi ibn Hatim",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    translation: localized({
      en: "Protect yourselves from the Fire, even if only with half a date.",
      de: "Schuetzt euch vor dem Feuer, selbst wenn es nur mit einer halben Dattel ist."
    }),
    lesson: localized({
      en: "It removes the excuse of waiting for large wealth before becoming generous.",
      de: "Er nimmt die Ausrede weg, auf grossen Reichtum zu warten, bevor man grosszuegig wird."
    }),
    search: ["generosity", "charity", "half date", "fire", "adi ibn hatim"]
  }),
  item({
    id: "generosity-charity-does-not-decrease",
    category: "generosity",
    grade: "sahih",
    source: "Sahih Muslim 2588",
    narrator: "Abu Hurayrah",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    translation: localized({
      en: "Charity does not decrease wealth.",
      de: "Sadaqa verringert den Besitz nicht."
    }),
    lesson: localized({
      en: "This hadith targets the fear behind stinginess and trains confidence in barakah.",
      de: "Dieser Hadith trifft die Angst hinter Geiz und erzieht zu Vertrauen in Baraka."
    }),
    search: ["generosity", "charity", "wealth", "sadaqah", "abu hurayrah"]
  }),
  item({
    id: "intentions-family-spending-counts-charity",
    category: "intentions",
    grade: "sahih",
    source: "Sahih al-Bukhari 55",
    narrator: "Abu Masud al-Badri",
    arabic: "إِذَا أَنْفَقَ الرَّجُلُ عَلَى أَهْلِهِ يَحْتَسِبُهَا فَهُوَ لَهُ صَدَقَةٌ",
    translation: localized({
      en: "If a man spends on his family seeking reward from Allah, it is charity for him.",
      de: "Wenn ein Mann fuer seine Familie ausgibt und dabei Allahs Lohn erhofft, ist es fuer ihn Sadaqa."
    }),
    lesson: localized({
      en: "It turns ordinary family spending into worship when the intention is sound.",
      de: "Er macht gewoehnliche Ausgaben fuer die Familie bei richtiger Absicht zu Gottesdienst."
    }),
    search: ["intentions", "family spending", "charity", "reward", "abu masud"]
  }),
  item({
    id: "prayer-wudu-steps-and-waiting",
    category: "prayer",
    grade: "sahih",
    source: "Sahih Muslim 251a",
    narrator: "Abu Hurayrah",
    arabic: "أَلاَ أَدُلُّكُمْ عَلَى مَا يَمْحُو اللَّهُ بِهِ الْخَطَايَا وَيَرْفَعُ بِهِ الدَّرَجَاتِ . قَالُوا بَلَى يَا رَسُولَ اللَّهِ . قَالَ إِسْبَاغُ الْوُضُوءِ عَلَى الْمَكَارِهِ وَكَثْرَةُ الْخُطَا إِلَى الْمَسَاجِدِ وَانْتِظَارُ الصَّلاَةِ بَعْدَ الصَّلاَةِ فَذَلِكُمُ الرِّبَاطُ",
    translation: localized({
      en: "Shall I tell you what Allah uses to erase sins and raise ranks? Completing wudu despite difficulty, taking many steps to the mosque, and waiting for one prayer after another. That is ribat.",
      de: "Soll ich euch zeigen, wodurch Allah Suenden tilgt und Ränge erhöht? Das vollstaendige Wudu trotz Schwierigkeit, viele Schritte zur Moschee und das Warten auf das naechste Gebet nach dem Gebet. Das ist Ribat."
    }),
    lesson: localized({
      en: "It shows that daily consistency around prayer builds rank, not only dramatic acts.",
      de: "Er zeigt, dass taegliche Beständigkeit rund um das Gebet Rang aufbaut und nicht nur aussergewoehnliche Taten."
    }),
    search: ["prayer", "wudu", "mosque", "steps", "ranks", "abu hurayrah"]
  }),
  item({
    id: "character-righteousness-is-good-character",
    category: "character",
    grade: "sahih",
    source: "Al-Adab Al-Mufrad 295",
    narrator: "An-Nawwas ibn Saman",
    arabic: "الْبِرُّ حُسْنُ الْخُلُقِ وَالإِثْمُ مَا حَاكَ فِي نَفْسِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ",
    translation: localized({
      en: "Righteousness is good character, and sin is what stirs unease in your soul and you dislike people knowing about.",
      de: "Rechtschaffenheit ist guter Charakter, und Suende ist das, was in deiner Seele Unruhe ausloest und was du vor den Menschen verbergen moechtest."
    }),
    lesson: localized({
      en: "It makes character central to righteousness rather than secondary to it.",
      de: "Er macht guten Charakter zu einem Kern von Rechtschaffenheit und nicht zu einer Nebensache."
    }),
    search: ["character", "righteousness", "sin", "conscience", "nawwas"]
  }),
  item({
    id: "knowledge-brighten-the-one-who-conveys",
    category: "knowledge",
    grade: "sahih",
    source: "Sunan Abi Dawud 3660",
    narrator: "Zayd ibn Thabit",
    arabic: "نَضَّرَ اللَّهُ امْرَأً سَمِعَ مِنَّا حَدِيثًا فَحَفِظَهُ حَتَّى يُبَلِّغَهُ فَرُبَّ حَامِلِ فِقْهٍ إِلَى مَنْ هُوَ أَفْقَهُ مِنْهُ وَرُبَّ حَامِلِ فِقْهٍ لَيْسَ بِفَقِيهٍ",
    translation: localized({
      en: "May Allah brighten a person who hears a hadith from us, preserves it, and conveys it. A carrier of knowledge may deliver it to one who understands it better than him.",
      de: "Möge Allah den Menschen erhellen, der einen Hadith von uns hört, ihn bewahrt und weitergibt. Ein Traeger von Wissen kann es an jemanden weitergeben, der es besser versteht als er."
    }),
    lesson: localized({
      en: "It frames hadith learning as preservation and transmission, not private collection.",
      de: "Er beschreibt Hadith-Lernen als Bewahrung und Weitergabe und nicht als private Sammlung."
    }),
    search: ["knowledge", "hadith", "transmit", "preserve", "zayd ibn thabit"]
  }),
  item({
    id: "gratitude-repay-kindness-or-pray",
    category: "gratitude",
    grade: "sahih",
    source: "Riyad as-Salihin 1723",
    narrator: "Abdullah ibn Umar",
    arabic: "مَنْ اسْتَعَاذَ بِاللَّهِ فَأَعِيذُوهُ وَمَنْ سَأَلَ بِاللَّهِ فَأَعْطُوهُ وَمَنْ دَعَاكُمْ فَأَجِيبُوهُ وَمَنْ صَنَعَ إِلَيْكُمْ مَعْرُوفًا فَكَافِئُوهُ فَإِنْ لَمْ تَجِدُوا مَا تُكَافِئُوهُ فَادْعُوا لَهُ حَتَّى تُرَوْا أَنَّكُمْ قَدْ كَافَأْتُمُوهُ",
    translation: localized({
      en: "Whoever does you a favor, repay him. If you cannot find anything to repay him with, then pray for him until you think you have repaid him.",
      de: "Wer euch etwas Gutes tut, den vergütet es. Wenn ihr nichts findet, womit ihr vergelten könnt, dann betet für ihn, bis ihr meint, dass ihr es vergolten habt."
    }),
    lesson: localized({
      en: "It turns gratitude into an active ethic of repayment, prayer, and acknowledgment.",
      de: "Er macht Dankbarkeit zu einer aktiven Haltung aus Vergeltung, Dua und Anerkennung."
    }),
    search: ["gratitude", "favor", "repay", "pray for him", "ibn umar"]
  }),
  item({
    id: "mercy-no-mercy-to-people",
    category: "mercy",
    grade: "sahih",
    source: "Al-Adab Al-Mufrad 96",
    narrator: "Jarir ibn Abdullah",
    arabic: "لاَ يَرْحَمُ اللَّهُ مَنْ لا يَرْحَمُ النَّاسَ",
    translation: localized({
      en: "Allah does not show mercy to the one who does not show mercy to people.",
      de: "Allah erweist demjenigen keine Barmherzigkeit, der den Menschen keine Barmherzigkeit erweist."
    }),
    lesson: localized({
      en: "It ties hope for divine mercy directly to how one treats people.",
      de: "Er verbindet die Hoffnung auf goettliche Barmherzigkeit direkt mit dem Umgang mit Menschen."
    }),
    search: ["mercy", "people", "jarir", "rahmah", "kindness"]
  }),
  item({
    id: "repentance-best-sinners-are-repentant",
    category: "repentance",
    grade: "hasan",
    source: "Sunan Ibn Majah 4251",
    narrator: "Anas ibn Malik",
    arabic: "كُلُّ بَنِي آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ",
    translation: localized({
      en: "Every son of Adam sins, and the best of sinners are those who repent often.",
      de: "Jeder Sohn Adams suendigt, und die Besten der Suender sind diejenigen, die oft bereuen."
    }),
    lesson: localized({
      en: "It keeps the door of return open without normalizing sin.",
      de: "Er haelt die Tuer zur Rueckkehr offen, ohne Suende zu verharmlosen."
    }),
    search: ["repentance", "sinners", "repent often", "anas", "tawbah"]
  }),
  item({
    id: "patience-no-gift-better-than-patience",
    category: "patience",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 1469",
    narrator: "Abu Saeed al-Khudri",
    arabic: "وَمَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ وَمَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ",
    translation: localized({
      en: "Whoever strives to be patient, Allah makes him patient. No one is given a gift better and more expansive than patience.",
      de: "Wer sich um Geduld bemueht, den laesst Allah geduldig werden. Niemandem wurde eine Gabe gegeben, die besser und umfassender ist als Geduld."
    }),
    lesson: localized({
      en: "It treats patience as something cultivated, not merely inherited.",
      de: "Er behandelt Geduld als etwas, das eingeuebt wird und nicht nur angeboren ist."
    }),
    search: ["patience", "gift", "abu saeed", "sabr", "strive"]
  }),
  item({
    id: "family-spending-on-wife-is-rewarded",
    category: "family",
    grade: "muttafaqun-alayh",
    source: "Riyad as-Salihin 292",
    narrator: "Sad ibn Abi Waqqas",
    arabic: "وَإِنَّكَ لَنْ تُنْفِقَ نَفَقَةً تَبْتَغِي بِهَا وَجْهَ اللَّهِ إِلاَّ أُجِرْتَ بِهَا حَتَّى مَا تَجْعَلُ فِي فِي امْرَأَتِكَ",
    translation: localized({
      en: "You will never spend anything seeking the Face of Allah except that you will be rewarded for it, even what you place in your wife's mouth.",
      de: "Du wirst nichts ausgeben, womit du Allahs Wohlgefallen suchst, ohne dafür belohnt zu werden, selbst für das, was du in den Mund deiner Frau legst."
    }),
    lesson: localized({
      en: "It makes care, feeding, and household responsibility part of sincere worship.",
      de: "Er macht Fuersorge, Versorgung und Verantwortung im Haus zu einem Teil aufrichtiger Anbetung."
    }),
    search: ["family", "wife", "spending", "reward", "sad ibn abi waqqas"]
  }),
  item({
    id: "trust-strong-believer-strive-for-benefit",
    category: "trust",
    grade: "sahih",
    source: "Bulugh al-Maram 1569",
    narrator: "Abu Hurayrah",
    arabic: "اَلْمُؤْمِنُ اَلْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اَللَّهِ مِنْ اَلْمُؤْمِنِ اَلضَّعِيفِ وَفِي كُلٍّ خَيْرٌ اِحْرِصْ عَلَى مَا يَنْفَعُكَ وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجَزْ",
    translation: localized({
      en: "The strong believer is better and more beloved to Allah than the weak believer, though there is good in both. Be keen on what benefits you, seek Allah's help, and do not give up.",
      de: "Der starke Glaeubige ist besser und Allah lieber als der schwache Glaeubige, obwohl in beiden Gutes ist. Sei eifrig in dem, was dir nuetzt, suche Allahs Hilfe und gib nicht auf."
    }),
    lesson: localized({
      en: "It joins reliance on Allah with effort, usefulness, and disciplined action.",
      de: "Er verbindet das Vertrauen auf Allah mit Einsatz, Nutzen und diszipliniertem Handeln."
    }),
    search: ["trust", "strong believer", "benefit", "seek Allah help", "abu hurayrah"]
  }),
  item({
    id: "parents-you-and-wealth-belong-to-father",
    category: "parents",
    grade: "sahih",
    source: "Sunan Ibn Majah 2291",
    narrator: "Jabir ibn Abdullah",
    arabic: "أَنْتَ وَمَالُكَ لأَبِيكَ",
    translation: localized({
      en: "You and your wealth belong to your father.",
      de: "Du und dein Vermoegen gehoert deinem Vater."
    }),
    lesson: localized({
      en: "It underscores the serious claim of parents over a child's wealth, service, and duty.",
      de: "Er unterstreicht den ernsten Anspruch der Eltern auf Dienst, Unterstuetzung und Ruecksicht."
    }),
    search: ["parents", "father", "wealth", "jabir", "rights"]
  }),
  item({
    id: "speech-harvest-of-the-tongue",
    category: "speech",
    grade: "hasan",
    source: "Riyad as-Salihin 1522",
    narrator: "Muadh ibn Jabal",
    arabic: "ثَكِلَتْكَ أُمُّكَ يَا مُعَاذُ وَهَلْ يُكَبُّ النَّاسَ عَلَى وُجُوهِهِمْ فِي النَّارِ إِلاَّ حَصَائِدُ أَلْسِنَتِهِمْ",
    translation: localized({
      en: "May your mother be bereaved of you, Muadh. Are people thrown on their faces into the Fire for anything other than the harvest of their tongues?",
      de: "Möge deine Mutter um dich trauern, Muadh. Werden die Menschen wegen etwas anderem als der Ernte ihrer Zungen auf ihre Gesichter ins Feuer geworfen?"
    }),
    lesson: localized({
      en: "It gives the tongue weight and consequence far beyond casual speech.",
      de: "Er gibt der Zunge ein Gewicht und eine Folge, die weit über lockere Worte hinausgeht."
    }),
    search: ["speech", "tongue", "fire", "muadh", "words"]
  }),
  item({
    id: "brotherhood-believers-are-like-building",
    category: "brotherhood",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 2446, Sahih Muslim 2585",
    narrator: "Abu Musa al-Ashari",
    arabic: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا",
    translation: localized({
      en: "A believer to another believer is like a building, each part strengthening the other.",
      de: "Ein Glaeubiger ist für den anderen Glaeubigen wie ein Bauwerk, dessen Teile einander festigen."
    }),
    lesson: localized({
      en: "It defines brotherhood as mutual reinforcement, not passive affiliation.",
      de: "Er definiert Bruderschaft als gegenseitige Staerkung und nicht als bloße Zugehoerigkeit."
    }),
    search: ["brotherhood", "building", "support", "abu musa", "believers"]
  }),
  item({
    id: "humility-allah-raises-the-humble",
    category: "humility",
    grade: "sahih",
    source: "Riyad as-Salihin 602",
    narrator: "Abu Hurayrah",
    arabic: "وَمَا تَوَاضَعَ أَحَدٌ لِلَّهِ إِلاَّ رَفَعَهُ اللَّهُ",
    translation: localized({
      en: "No one humbles himself for Allah except that Allah raises him.",
      de: "Niemand demütigt sich für Allah, ohne dass Allah ihn erhebt."
    }),
    lesson: localized({
      en: "It breaks the fear that humility lowers status. With Allah it elevates.",
      de: "Er zerstoert die Angst, dass Demut den Rang senkt. Bei Allah erhebt sie."
    }),
    search: ["humility", "Allah raises", "abu hurayrah", "tawadu"]
  }),
  item({
    id: "generosity-care-for-widow-and-poor",
    category: "generosity",
    grade: "muttafaqun-alayh",
    source: "Sahih al-Bukhari 6006, Sahih Muslim 2982",
    narrator: "Abu Hurayrah",
    arabic: "السَّاعِي عَلَى الأَرْمَلَةِ وَالْمِسْكِينِ كَالْمُجَاهِدِ فِي سَبِيلِ اللَّهِ وَكَالْقَائِمِ لاَ يَفْتُرُ وَكَالصَّائِمِ لاَ يُفْطِرُ",
    translation: localized({
      en: "The one who works for a widow and the poor is like the fighter in Allah's path, like one who stands in prayer without tiring and fasts without breaking.",
      de: "Wer sich für die Witwe und den Armen einsetzt, ist wie der Kaempfer auf Allahs Weg, wie einer, der unermüdlich im Gebet steht und fastet, ohne zu brechen."
    }),
    lesson: localized({
      en: "It shows that active service to vulnerable people is among the highest forms of devotion.",
      de: "Er zeigt, dass der aktive Dienst an Schutzbeduerftigen zu den hoechsten Formen der Hingabe gehoert."
    }),
    search: ["generosity", "widow", "poor", "service", "abu hurayrah"]
  })
];

export function getHadithCategories() {
  return HADITH_CATEGORIES.filter(item => item.id !== "all");
}

export function getHadithItems() {
  return HADITH_ITEMS.slice();
}
