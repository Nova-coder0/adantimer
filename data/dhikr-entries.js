export const DHIKR_CATEGORIES = [
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
    id: "provision",
    labels: {
      en: "Provision",
      ar: "الرزق",
      de: "Rizq",
      fr: "Subsistance",
      tr: "Rizik",
      "zh-hans": "给养"
    }
  },
  {
    id: "ease",
    labels: {
      en: "Ease",
      ar: "التيسير",
      de: "Erleichterung",
      fr: "Facilite",
      tr: "Kolaylik",
      "zh-hans": "顺利"
    }
  },
  {
    id: "distress",
    labels: {
      en: "Distress",
      ar: "الكرب",
      de: "Bedrängnis",
      fr: "Detresse",
      tr: "Sikinti",
      "zh-hans": "困境"
    }
  },
  {
    id: "healing",
    labels: {
      en: "Healing",
      ar: "الشفاء",
      de: "Heilung",
      fr: "Guerison",
      tr: "Sifa",
      "zh-hans": "康复"
    }
  },
  {
    id: "sleep",
    labels: {
      en: "Before Sleep",
      ar: "قبل النوم",
      de: "Vor dem Schlaf",
      fr: "Avant le sommeil",
      tr: "Uyku Oncesi",
      "zh-hans": "睡前"
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

function localized(values) {
  return values;
}

function item(definition) {
  return definition;
}

export const DHIKR_ITEMS = [
  item({
    id: "morning-subhanallah",
    category: "morning",
    countTarget: 100,
    countMode: "fixed",
    authenticity: "sahih",
    reference: "Sahih Muslim 2692",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    translations: localized({
      en: "Glory be to Allah and praise belongs to Him.",
      ar: "سبحان الله وبحمده.",
      de: "Gepriesen ist Allah, und Ihm gebuehrt alles Lob.",
      fr: "Gloire a Allah et la louange Lui appartient.",
      tr: "Allah eksikliklerden uzaktir ve hamd O'nadir.",
      "zh-hans": "赞颂真主超绝万物，一切赞美都归于祂。"
    }),
    focus: localized({
      en: "A strong morning anchor for consistency and reward.",
      ar: "ذكر صباحي ثابت للثبات وكثرة الأجر.",
      de: "Ein starker Morgen-Dhikr fuer Bestaendigkeit und Lohn."
    }),
    guidance: localized({
      en: "Reported with a fixed count of one hundred in the morning and evening.",
      ar: "ورد بعدد ثابت مئة مرة صباحا ومساء.",
      de: "Mit fester Anzahl von einhundert Mal morgens und abends ueberliefert."
    })
  }),
  item({
    id: "morning-tahlil",
    category: "morning",
    countTarget: 100,
    countMode: "fixed",
    authenticity: "sahih",
    reference: "Sahih al-Bukhari 6403",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illa Allahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa ala kulli shayin qadir",
    translations: localized({
      en: "There is no god but Allah alone, without partner. His is the dominion, His is the praise, and He has power over everything.",
      ar: "لا معبود بحق إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.",
      de: "Es gibt keinen Gott ausser Allah allein, ohne Teilhaber. Ihm gehoert die Herrschaft, Ihm gebuehrt das Lob, und Er hat Macht ueber alle Dinge.",
      fr: "Il n'y a de divinite qu'Allah seul, sans associe. A Lui la souverainete, a Lui la louange, et Il est capable de toute chose.",
      tr: "Allah'tan baska ilah yoktur, O tektir, ortagi yoktur. Mulku de hamd de O'nundur ve O her seye gucu yetendir.",
      "zh-hans": "除真主外绝无应受崇拜者，祂独一无偶，国权与赞美都属于祂，祂对万事全能。"
    }),
    focus: localized({
      en: "A core remembrance for tawhid, protection, and daily discipline.",
      ar: "ذكر عظيم للتوحيد والحفظ والانضباط اليومي.",
      de: "Ein zentraler Dhikr fuer Tauhid, Schutz und taegliche Disziplin."
    }),
    guidance: localized({
      en: "Reported with a fixed count of one hundred for the day.",
      ar: "ورد بعدد ثابت مئة مرة في اليوم.",
      de: "Mit fester Anzahl von einhundert Mal pro Tag ueberliefert."
    })
  }),
  item({
    id: "evening-hasbiyallah",
    category: "evening",
    countTarget: 7,
    countMode: "fixed",
    authenticity: "quran",
    reference: "Quran 9:129",
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration: "Hasbiya Allahu la ilaha illa Huwa, alayhi tawakkaltu wa Huwa Rabbul-Arshil-Azim",
    translations: localized({
      en: "Allah is sufficient for me. There is no god but Him. I place my trust in Him, and He is the Lord of the Mighty Throne.",
      ar: "الله كافيني، لا إله إلا هو، عليه توكلت وهو رب العرش العظيم.",
      de: "Allah genuegt mir. Es gibt keinen Gott ausser Ihm. Auf Ihn vertraue ich, und Er ist der Herr des gewaltigen Thrones.",
      fr: "Allah me suffit. Il n'y a de divinite que Lui. Je place ma confiance en Lui, et Il est le Seigneur du Trone immense.",
      tr: "Allah bana yeter. O'ndan baska ilah yoktur. Ben O'na tevekkul ettim ve O buyuk Arsin Rabbidir.",
      "zh-hans": "真主足够我依靠，除祂外绝无应受崇拜者；我只托靠祂，祂是伟大宝座的主。"
    }),
    focus: localized({
      en: "An evening remembrance centered on reliance and calm trust.",
      ar: "ذكر مسائي قائم على التوكل والسكون.",
      de: "Ein Abend-Dhikr fuer Tawakkul und ruhiges Vertrauen."
    }),
    guidance: localized({
      en: "Often used as a repeated evening recitation with a seven-count session target.",
      ar: "يستعمل كثيرا في ورد المساء مع هدف عملي سبع مرات.",
      de: "Wird haeufig als abendliche Wiederholung mit praktischem Siebener-Ziel genutzt."
    })
  }),
  item({
    id: "after-prayer-subhanallah",
    category: "after-prayer",
    countTarget: 33,
    countMode: "fixed",
    authenticity: "sahih",
    reference: "Sahih Muslim 597",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "SubhanAllah",
    translations: localized({
      en: "Glory be to Allah.",
      ar: "سبحان الله.",
      de: "Gepriesen ist Allah.",
      fr: "Gloire a Allah.",
      tr: "Allah eksikliklerden uzaktir.",
      "zh-hans": "赞颂真主超绝万物。"
    }),
    focus: localized({
      en: "Part of the well-known post-prayer tasbih sequence.",
      ar: "جزء من التسبيح المشهور بعد الصلاة.",
      de: "Teil der bekannten Tasbih-Folge nach dem Gebet."
    }),
    guidance: localized({
      en: "Reported with a fixed count of thirty-three after the prayer.",
      ar: "ورد بعدد ثابت ثلاثا وثلاثين بعد الصلاة.",
      de: "Mit fester Anzahl von dreiunddreissig nach dem Gebet ueberliefert."
    })
  }),
  item({
    id: "after-prayer-alhamdulillah",
    category: "after-prayer",
    countTarget: 33,
    countMode: "fixed",
    authenticity: "sahih",
    reference: "Sahih Muslim 597",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translations: localized({
      en: "All praise belongs to Allah.",
      ar: "الحمد لله.",
      de: "Alles Lob gebuehrt Allah.",
      fr: "Toute louange appartient a Allah.",
      tr: "Hamd Allah'a mahsustur.",
      "zh-hans": "一切赞美都归于真主。"
    }),
    focus: localized({
      en: "A clear praise dhikr within the post-prayer routine.",
      ar: "ذكر حمد واضح داخل ورد ما بعد الصلاة.",
      de: "Ein klarer Lob-Dhikr innerhalb des Nach-Gebets-Wirds."
    }),
    guidance: localized({
      en: "Reported with a fixed count of thirty-three after the prayer.",
      ar: "ورد بعدد ثابت ثلاثا وثلاثين بعد الصلاة.",
      de: "Mit fester Anzahl von dreiunddreissig nach dem Gebet ueberliefert."
    })
  }),
  item({
    id: "after-prayer-allahu-akbar",
    category: "after-prayer",
    countTarget: 34,
    countMode: "fixed",
    authenticity: "sahih",
    reference: "Sahih Muslim 597",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translations: localized({
      en: "Allah is the Greatest.",
      ar: "الله أكبر.",
      de: "Allah ist der Groesste.",
      fr: "Allah est le Plus Grand.",
      tr: "Allah en buyuktur.",
      "zh-hans": "真主至大。"
    }),
    focus: localized({
      en: "The closing takbir in the standard post-prayer sequence.",
      ar: "تكبير ختامي في ورد ما بعد الصلاة.",
      de: "Der abschliessende Takbir der ueblichen Nach-Gebets-Folge."
    }),
    guidance: localized({
      en: "Reported with a fixed count of thirty-four after the prayer.",
      ar: "ورد بعدد ثابت أربعاً وثلاثين بعد الصلاة.",
      de: "Mit fester Anzahl von vierunddreissig nach dem Gebet ueberliefert."
    })
  }),
  item({
    id: "forgiveness-astaghfirullah",
    category: "forgiveness",
    countTarget: 100,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Sahih Muslim 2702a",
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translations: localized({
      en: "I seek Allah's forgiveness.",
      ar: "أستغفر الله.",
      de: "Ich bitte Allah um Vergebung.",
      fr: "Je demande le pardon d'Allah.",
      tr: "Allah'tan bagislanma dilerim.",
      "zh-hans": "我向真主求饶恕。"
    }),
    focus: localized({
      en: "A simple istighfar track for regular repentance through the day.",
      ar: "مسار استغفار بسيط للتوبة المتكررة خلال اليوم.",
      de: "Ein einfacher Istighfar-Pfad fuer regelmaessige Tauba im Alltag."
    }),
    guidance: localized({
      en: "The source recommends abundant daily repetition; the counter uses one hundred as a practical session target.",
      ar: "المصدر يدل على الإكثار اليومي؛ والعداد يستخدم المئة كهدف عملي للجلسة.",
      de: "Die Quelle empfiehlt reichliches taegliches Wiederholen; der Zaehler nutzt einhundert als praktisches Sitzungsziel."
    })
  }),
  item({
    id: "forgiveness-sayyid-al-istighfar",
    category: "forgiveness",
    countTarget: 1,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Sahih al-Bukhari 6306",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي؛ فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana abduka, wa ana ala ahdika wa wadika mastatatu, audhu bika min sharri ma sanat, abu'u laka binimatika alayya, wa abu'u bidhanbi, faghfir li fa innahu la yaghfiru adh-dhunuba illa anta",
    translations: localized({
      en: "O Allah, You are my Lord. There is none worthy of worship except You. You created me and I am Your servant... so forgive me, for none forgives sins except You.",
      ar: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك... فاغفر لي فإنه لا يغفر الذنوب إلا أنت.",
      de: "O Allah, Du bist mein Herr. Es gibt keinen Gott ausser Dir. Du hast mich erschaffen und ich bin Dein Diener... so vergib mir, denn niemand vergibt Suenden ausser Dir."
    }),
    focus: localized({
      en: "The central formula of repentance and acknowledgment known as Sayyid al-Istighfar.",
      ar: "الصيغة الجامعة في التوبة والاعتراف بالنعمة والذنب، وهي سيد الاستغفار.",
      de: "Die zentrale Formel von Reue, Dank und Schuldbekenntnis: Sayyid al-Istighfar."
    }),
    guidance: localized({
      en: "Recited morning or evening. The source does not attach a numeric count, so the page starts with one focused recitation.",
      ar: "يقال صباحاً أو مساءً، ولا يرد له عدد ثابت هنا، لذلك يبدأ العداد بتلاوة مركزة واحدة.",
      de: "Wird morgens oder abends gesprochen. Die Quelle nennt keine feste Anzahl; die Seite startet deshalb mit einer fokussierten Wiederholung."
    })
  }),
  item({
    id: "provision-beneficial-rizq",
    category: "provision",
    countTarget: 1,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Sunan Ibn Majah 925",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    transliteration: "Allahumma inni asaluka ilman nafian, wa rizqan tayyiban, wa amalan mutaqabbalan",
    translations: localized({
      en: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
      ar: "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً.",
      de: "O Allah, ich bitte Dich um nuetzliches Wissen, gute Versorgung und angenommene Taten."
    }),
    focus: localized({
      en: "A concise dua for knowledge, lawful provision, and accepted effort.",
      ar: "دعاء موجز للعلم النافع والرزق الطيب والعمل المتقبل.",
      de: "Ein kurzes Dua fuer nuetzliches Wissen, guten Rizq und angenommene Taten."
    }),
    guidance: localized({
      en: "Reported after the morning prayer. The page uses one recitation as the guided target.",
      ar: "ورد بعد صلاة الصبح، والعداد يستخدم تلاوة واحدة كهدف مبدئي.",
      de: "Nach dem Fajr-Gebet ueberliefert; der Zaehler nutzt eine Wiederholung als Startziel."
    })
  }),
  item({
    id: "ease-no-ease-except-you",
    category: "ease",
    countTarget: 1,
    countMode: "guided",
    authenticity: "authenticated",
    reference: "Hisn al-Muslim 139",
    arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    transliteration: "Allahumma la sahla illa ma jaaltahu sahla wa anta tajalu al-hazna idha shita sahla",
    translations: localized({
      en: "O Allah, there is no ease except what You make easy, and You make difficulty easy when You will.",
      ar: "اللهم لا سهل إلا ما جعلته سهلاً، وأنت تجعل الحزن إذا شئت سهلاً.",
      de: "O Allah, es gibt keine Erleichterung ausser dem, was Du erleichterst; und Du machst Schwieriges leicht, wenn Du willst."
    }),
    focus: localized({
      en: "Useful before difficult tasks, study, interviews, or stressful appointments.",
      ar: "يناسب قبل الأمور الصعبة والدراسة والمواقف الضاغطة والمواعيد المهمة.",
      de: "Passend vor schwierigen Aufgaben, Lernen, Gespraechen oder belastenden Terminen."
    }),
    guidance: localized({
      en: "No fixed count is attached in the source; the page starts with one deliberate recitation.",
      ar: "لا يرد له عدد ثابت في المصدر، لذلك يبدأ العداد بقراءة مقصودة واحدة.",
      de: "Die Quelle nennt keine feste Anzahl; der Zaehler startet mit einer bewussten Wiederholung."
    })
  }),
  item({
    id: "distress-dhun-nun",
    category: "distress",
    countTarget: 1,
    countMode: "guided",
    authenticity: "hasan",
    reference: "Jami at-Tirmidhi 3505",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translations: localized({
      en: "There is none worthy of worship except You; Glory be to You; truly, I have been among the wrongdoers.",
      ar: "لا إله إلا أنت سبحانك إني كنت من الظالمين.",
      de: "Es gibt keinen Gott ausser Dir. Gepriesen seist Du. Ich gehoerte wahrlich zu den Ungerechten."
    }),
    focus: localized({
      en: "A well-known dua for distress, pressure, and moments of helplessness.",
      ar: "دعاء مشهور للكرب والضغط ومواطن العجز.",
      de: "Ein bekanntes Dua fuer Bedraengnis, Druck und Momente der Hilflosigkeit."
    }),
    guidance: localized({
      en: "The source highlights its use in distress without fixing a number; the counter begins at one focused recitation.",
      ar: "المصدر يبين فضله عند الكرب من غير عدد ثابت، لذلك يبدأ العداد بتلاوة واحدة.",
      de: "Die Quelle betont seinen Nutzen bei Bedraengnis ohne feste Anzahl; der Zaehler startet mit einer Wiederholung."
    })
  }),
  item({
    id: "distress-worry-debt",
    category: "distress",
    countTarget: 1,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Sunan an-Nasai 5450",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَالدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni audhu bika minal-hammi wal-hazani wal-ajzi wal-kasali wal-bukhli wal-jubni wad-dayni wa ghalabatir-rijal",
    translations: localized({
      en: "O Allah, I seek refuge in You from worry, grief, incapacity, laziness, miserliness, cowardice, debt, and being overpowered by people.",
      ar: "اللهم إني أعوذ بك من الهم والحزن والعجز والكسل والبخل والجبن والدين وغلبة الرجال.",
      de: "O Allah, ich suche Zuflucht bei Dir vor Sorge, Trauer, Unfaehigkeit, Traegheit, Geiz, Feigheit, Schulden und dem Ueberwaeltigtwerden durch Menschen."
    }),
    focus: localized({
      en: "A broad refuge-dua for emotional strain, debt pressure, and weakness.",
      ar: "دعاء استعاذة واسع للهم والدين والضعف والضغوط.",
      de: "Ein breites Schutz-Dua gegen Sorgen, Schuldendruck, Schwaeche und Belastung."
    }),
    guidance: localized({
      en: "No fixed count is attached in the source; one careful recitation is used as the guided target.",
      ar: "لا يرد له عدد ثابت في المصدر، ولذلك يعتمد العداد تلاوة واحدة كهدف مبدئي.",
      de: "Die Quelle nennt keine feste Anzahl; als gefuehrtes Startziel wird eine sorgfaeltige Wiederholung genutzt."
    })
  }),
  item({
    id: "healing-rabb-an-nas",
    category: "healing",
    countTarget: 1,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Riyad as-Salihin 902",
    arabic: "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، وَاشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
    transliteration: "Allahumma Rabb an-nas, adhhib al-basa, washfi anta ash-Shafi, la shifaa illa shifauka, shifaan la yughadiru saqaman",
    translations: localized({
      en: "O Allah, Lord of mankind, remove the harm and cure. You are the Healer. There is no healing except Your healing, a healing that leaves no illness behind.",
      ar: "اللهم رب الناس، أذهب البأس، واشفِ أنت الشافي، لا شفاء إلا شفاؤك، شفاء لا يغادر سقماً.",
      de: "O Allah, Herr der Menschen, nimm das Leid hinweg und heile. Du bist der Heiler. Es gibt keine Heilung ausser Deiner Heilung, eine Heilung, die keine Krankheit zuruecklaesst."
    }),
    focus: localized({
      en: "A direct healing dua for illness, recovery, and serious health moments.",
      ar: "دعاء مباشر للمرض والشفاء ولحظات العلاج الجادة.",
      de: "Ein direktes Heilungs-Dua fuer Krankheit, Genesung und ernste gesundheitliche Situationen."
    }),
    guidance: localized({
      en: "No fixed count is attached in the source; start with one sincere recitation and repeat as needed.",
      ar: "لا يرد له عدد ثابت في المصدر؛ ابدأ بتلاوة صادقة واحدة وكرر عند الحاجة.",
      de: "Die Quelle nennt keine feste Anzahl; beginne mit einer aufrichtigen Wiederholung und wiederhole bei Bedarf."
    })
  }),
  item({
    id: "healing-afiyah",
    category: "healing",
    countTarget: 1,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Sunan Ibn Majah 3871",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allahumma inni asalukal afwa wal afiyata fid-dunya wal-akhirah",
    translations: localized({
      en: "O Allah, I ask You for pardon and well-being in this world and the Hereafter.",
      ar: "اللهم إني أسألك العفو والعافية في الدنيا والآخرة.",
      de: "O Allah, ich bitte Dich um Vergebung und Wohlergehen in dieser Welt und im Jenseits."
    }),
    focus: localized({
      en: "A compact dua for afiyah, protection, and overall well-being.",
      ar: "دعاء موجز للعافية والحفظ والسلامة العامة.",
      de: "Ein kompaktes Dua fuer Afiyah, Schutz und allgemeines Wohlergehen."
    }),
    guidance: localized({
      en: "Used in morning and evening supplication; the page starts with one guided recitation.",
      ar: "يستعمل في أذكار الصباح والمساء، والعداد يبدأ بتلاوة موجهة واحدة.",
      de: "Wird im Morgen- und Abendwird genutzt; die Seite startet mit einer gefuehrten Wiederholung."
    })
  }),
  item({
    id: "sleep-ayat-al-kursi",
    category: "sleep",
    countTarget: 1,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Sahih al-Bukhari 2311",
    arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ...",
    transliteration: "Allahu la ilaha illa Huwa al-Hayyul-Qayyum ...",
    translations: localized({
      en: "Ayat al-Kursi before sleep.",
      ar: "آية الكرسي قبل النوم.",
      de: "Ayat al-Kursi vor dem Schlaf."
    }),
    focus: localized({
      en: "A bedtime recitation associated with protection through the night.",
      ar: "قراءة ليلية مشهورة مرتبطة بالحفظ طوال الليل.",
      de: "Eine bekannte Schlafenszeit-Rezitation, die mit Schutz in der Nacht verbunden ist."
    }),
    guidance: localized({
      en: "The source ties it to bedtime recitation without a repeated count; the page uses one completion target.",
      ar: "المصدر يربطه بقراءة وقت النوم من غير تكرار عددي، لذلك يعتمد العداد مرة واحدة.",
      de: "Die Quelle verknuepft es mit der Lesung vor dem Schlafen ohne feste Anzahl; der Zaehler nutzt eine einmalige Vollendung."
    })
  }),
  item({
    id: "general-hawqala",
    category: "general",
    countTarget: 100,
    countMode: "guided",
    authenticity: "sahih",
    reference: "Sahih al-Bukhari 6384",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    translations: localized({
      en: "There is no power and no strength except through Allah.",
      ar: "لا حول ولا قوة إلا بالله.",
      de: "Es gibt keine Macht und keine Kraft ausser durch Allah.",
      fr: "Il n'y a de puissance ni de force qu'en Allah.",
      tr: "Guc ve kuvvet ancak Allah iledir.",
      "zh-hans": "除凭真主外，绝无能力与力量。"
    }),
    focus: localized({
      en: "A broad dhikr of surrender and reliance repeated through the day.",
      ar: "ذكر عام للاستسلام والتوكل يكرر خلال اليوم.",
      de: "Ein allgemeiner Dhikr von Ergebung und Tawakkul fuer den ganzen Tag."
    }),
    guidance: localized({
      en: "The source praises it strongly without fixing a count; one hundred is used here as a practical session target.",
      ar: "المصدر يثني عليه كثيراً من غير عدد ثابت؛ والمئة هنا هدف عملي للجلسة.",
      de: "Die Quelle lobt ihn stark ohne feste Anzahl; einhundert dient hier als praktisches Sitzungsziel."
    })
  })
];

export function getDhikrCategories() {
  return DHIKR_CATEGORIES.filter(item => item.id !== "all");
}

export function getDhikrItems() {
  return DHIKR_ITEMS;
}
