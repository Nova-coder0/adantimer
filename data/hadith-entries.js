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
  })
];

export function getHadithCategories() {
  return HADITH_CATEGORIES.filter(item => item.id !== "all");
}

export function getHadithItems() {
  return HADITH_ITEMS.slice();
}
