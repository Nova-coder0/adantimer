export function buildDescription(language, topic, place) {
  const base = {
    en: `Check accurate ${topic.toLowerCase()}${place ? ` in ${place}` : ""}, see the next prayer countdown, and review today's full daily prayer schedule.`,
    ar: `\u062a\u062d\u0642\u0642 \u0645\u0646 ${topic}${place ? ` \u0641\u064a ${place}` : ""}\u060c \u0648\u0627\u0639\u0631\u0641 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u0635\u0644\u0648\u062a \u0627\u0644\u0643\u0627\u0645\u0644 \u0644\u0644\u064a\u0648\u0645.`,
    de: `Pruefe ${topic.toLowerCase()}${place ? ` in ${place}` : ""}, sieh den Countdown zum naechsten Gebet und den vollstaendigen Tagesplan.`,
    fr: `Consultez ${topic.toLowerCase()}${place ? ` a ${place}` : ""}, voyez la prochaine priere et le planning complet du jour.`,
    tr: `${topic.toLowerCase()}${place ? ` ${place} icin` : ""} bilgisini, sonraki namaz geri sayimini ve gunluk takvimi gorun.`,
    "zh-hans": `\u67e5\u770b${place ? `${place}\u7684` : ""}${topic}\u3001\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\u4ee5\u53ca\u4eca\u65e5\u5b8c\u6574\u65f6\u95f4\u8868\u3002`
  };
  return base[language] || base.en;
}

export function buildHeroSubtitle(language, topic, place) {
  const base = {
    en: place ? `Use this page to check ${topic.toLowerCase()} in ${place}, follow the live next-prayer countdown, and review the full daily salah schedule.` : "Check accurate daily prayer times, follow the next prayer countdown, and switch quickly to any city worldwide.",
    ar: place ? `\u0627\u0633\u062a\u062e\u062f\u0645 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0644\u0645\u0639\u0631\u0641\u0629 ${topic} \u0641\u064a ${place} \u0648\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0644\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0648\u062c\u062f\u0648\u0644 \u0627\u0644\u064a\u0648\u0645.` : "\u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0628\u062f\u0642\u0629 \u0648\u0627\u0646\u062a\u0642\u0644 \u0628\u0633\u0631\u0639\u0629 \u0625\u0644\u0649 \u0623\u064a \u0645\u062f\u064a\u0646\u0629.",
    de: place ? `Nutze diese Seite fuer ${topic.toLowerCase()} in ${place}, den Countdown zum naechsten Gebet und den vollstaendigen Tagesplan.` : "Pruefe genaue Gebetszeiten, den Countdown zum naechsten Gebet und beliebte Staedte weltweit.",
    fr: place ? `Utilisez cette page pour ${topic.toLowerCase()} a ${place}, le compte a rebours et le planning complet du jour.` : "Consultez les horaires precis, la prochaine priere et les pages villes populaires.",
    tr: place ? `Bu sayfada ${place} icin ${topic.toLowerCase()} bilgisini, sonraki namaz geri sayimini ve tam gunluk takvimi gorun.` : "Dogru vakitleri, sonraki namaz geri sayimini ve populer sehir sayfalarini hizli gorun.",
    "zh-hans": place ? `\u4f7f\u7528\u6b64\u9875\u67e5\u770b${place}\u7684${topic}\uff0c\u5e76\u67e5\u770b\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\u548c\u5b8c\u6574\u65f6\u95f4\u8868\u3002` : "\u67e5\u770b\u51c6\u786e\u793c\u62dc\u65f6\u95f4\u3001\u4e0b\u4e00\u6b21\u793c\u62dc\u5012\u8ba1\u65f6\u548c\u70ed\u95e8\u57ce\u5e02\u9875\u9762\u3002"
  };
  return base[language] || base.en;
}

export function buildLocationStatus(language, place) {
  return {
    en: `Prayer times for ${place}`,
    ar: `\u0645\u0648\u0627\u0642\u064a\u062a \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place}`,
    de: `Gebetszeiten fuer ${place}`,
    fr: `Horaires pour ${place}`,
    tr: `${place} icin vakitler`,
    "zh-hans": `${place}\u793c\u62dc\u65f6\u95f4`
  }[language] || `Prayer times for ${place}`;
}

export function buildLocationText(language, place) {
  return {
    en: `${place} prayer schedule will load automatically after page start.`,
    ar: `\u0633\u064a\u062a\u0645 \u062a\u062d\u0645\u064a\u0644 \u062c\u062d\u0648\u0644 \u0627\u0644\u0635\u0644\u0627\u0629 \u0641\u064a ${place} \u062a\u0644\u0642\u0627\u0626\u064a\u0627 \u0628\u0639\u062f \u0628\u062f\u0621 \u0627\u0644\u0635\u0641\u062d\u0629.`,
    de: `Der Gebetsplan fuer ${place} wird nach dem Start automatisch geladen.`,
    fr: `Le planning de ${place} sera charge automatiquement au demarrage.`,
    tr: `${place} icin takvim sayfa acildiktan sonra otomatik yuklenecek.`,
    "zh-hans": `${place} \u7684\u793c\u62dc\u65f6\u95f4\u8868\u4f1a\u5728\u9875\u9762\u542f\u52a8\u540e\u81ea\u52a8\u52a0\u8f7d\u3002`
  }[language] || `${place} prayer schedule will load automatically after page start.`;
}

export function buildTodayScheduleHeading(language) {
  return { en: "Today's Prayer Schedule", ar: "\u062c\u062d\u0648\u0644 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u064a\u0648\u0645", de: "Heutiger Gebetsplan", fr: "Horaires du jour", tr: "Bugunun namaz takvimi", "zh-hans": "\u4eca\u65e5\u793c\u62dc\u65f6\u95f4\u8868" }[language] || "Today's Prayer Schedule";
}

export function buildFullScheduleHeading(language, topic) {
  return { en: `${topic} and Full Prayer Schedule`, ar: `${topic} \u0648\u062c\u062d\u0648\u0644 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u0643\u0627\u0645\u0644`, de: `${topic} und kompletter Gebetsplan`, fr: `${topic} et planning complet`, tr: `${topic} ve tam namaz takvimi`, "zh-hans": `${topic}\u4e0e\u5b8c\u6574\u65f6\u95f4\u8868` }[language] || `${topic} and Full Prayer Schedule`;
}

export function buildScheduleSummary(language, place) {
  return { en: `Daily prayer schedule and next salah countdown for ${place}.`, ar: `\u062c\u062f\u0648\u0644 \u0627\u0644\u0635\u0644\u0627\u0629 \u0627\u0644\u064a\u0648\u0645\u064a \u0648\u0627\u0644\u0639\u062f \u0627\u0644\u062a\u0646\u0627\u0632\u0644\u064a \u0641\u064a ${place}.`, de: `Taeglicher Gebetsplan und Countdown fuer ${place}.`, fr: `Planning quotidien et compte a rebours pour ${place}.`, tr: `${place} icin gunluk takvim ve geri sayim.`, "zh-hans": `${place} \u7684\u6bcf\u65e5\u65f6\u95f4\u8868\u4e0e\u5012\u8ba1\u65f6\u3002` }[language] || `Daily prayer schedule and next salah countdown for ${place}.`;
}

export function buildCurrentCitySummary(language) {
  return { en: "Accurate times for your current city.", ar: "\u0645\u0648\u0627\u0642\u064a\u062a \u062f\u0642\u064a\u0642\u0629 \u0644\u0645\u062d\u064a\u0646\u062a\u0643 \u0627\u0644\u062d\u0627\u0644\u064a\u0629.", de: "Praezise Zeiten fuer deine aktuelle Stadt.", fr: "Horaires precis pour votre ville actuelle.", tr: "Bulundugun sehir icin dogru vakitler.", "zh-hans": "\u4e3a\u4f60\u5f53\u524d\u57ce\u5e02\u63d0\u4f9b\u51c6\u786e\u65f6\u95f4\u3002" }[language] || "Accurate times for your current city.";
}
