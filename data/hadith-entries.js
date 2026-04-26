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
    arabic: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلَا وَصَبٍ وَلَا هَمٍّ وَلَا حُزْنٍ ... إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
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
  })
];

export function getHadithCategories() {
  return HADITH_CATEGORIES.filter(item => item.id !== "all");
}

export function getHadithItems() {
  return HADITH_ITEMS.slice();
}
