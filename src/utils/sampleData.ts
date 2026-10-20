import { BookProject } from '../types/manuscript';

export const SAMPLE_BOOK_PROJECT: BookProject = {
  id: 'book-project-1',
  title: 'सफ़र के साए (Shadows of the Journey)',
  subtitle: 'एक लेखक की अनकही डायरी और दास्तान',
  authorName: 'कवि व कथाकार',
  genre: 'साहित्यिक संस्मरण / Literary Memoir',
  targetWordCount: 50000,
  primaryLanguage: 'Hindi / Hinglish',
  activeChapterId: 'ch-1',
  lastSavedAt: new Date().toISOString(),
  syncedToCloud: true,
  lastCloudSyncAt: new Date().toISOString(),
  chapters: [
    {
      id: 'ch-1',
      title: 'अध्याय १: बनारस की सुबह और पुरानी डायरी',
      subtitle: 'Chapter 1: Morning of Banaras & The Old Journal',
      type: 'chapter',
      status: 'in_progress',
      date: '2026-10-18',
      epigraphQuote: {
        quote: 'दुख सबको माँजता है, और चाहे स्वयं सब को मुक्ति देना वह न जाने कितनों को यह सिखाता है कि सब को मुक्त रखो।',
        author: 'सच्चिदानंद हीरानंद वात्स्यायन "अज्ञेय"',
        source: 'शेखर: एक जीवनी',
      },
      content: `गंगा के अस्सी घाट पर जब सूरज की पहली किरण पानी की लहरों पर बिखरती है, तो मन के भीतर दबे अनगिनत शब्द तैरने लगते हैं। 

आज बरसों बाद मैंने अपनी अलमारी के कोने से वह भूरे जिल्द वाली डायरी निकाली। उसके पन्नों पर स्याही थोड़ी फीकी पड़ चुकी थी, पर उसमें दर्ज एहसास आज भी उतने ही ताज़ा थे जितने उस सर्द रात में थे जब मैंने पहली बार कलम उठाई थी।

मुझे याद है, बापू हमेशा कहते थे—"शब्द केवल आवाज़ नहीं होते बेटा, शब्द रूह का आईना होते हैं। जब तक तुम अपने सच से नहीं डरोगे, तुम्हारी लिखी हर पंक्ति में ज़िंदगी धड़कती रहेगी।" 

लेकिन ज़िंदगी की रफ़्तार में हम अक्सर लिखना भूल जाते हैं। हम जीने का नाटक करते रहते हैं, जबकि हमारी असल ज़िंदगी उन खाली पन्नों पर हमारा इंतज़ार कर रही होती है। आज जब मैं यह किताब शुरू कर रहा हूँ, तो मेरे हाथ थोड़े कांप रहे हैं। क्या मैं उन तमाम चेहरों, उन अनकही मुलाक़ातों और उन अधूरी हसरतों को सही लफ़्ज़ दे पाऊँगा?

शायद हाँ। क्योंकि जो आग भीतर सुलगती रही है, उसे अब कागज़ पर रौशनी बनना ही होगा।`,
      createdAt: '2026-10-18T10:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ch-2',
      title: 'डायरी प्रविष्टि: उस गुमनाम स्टेशन की शाम',
      subtitle: 'Diary Entry: The Unnamed Railway Junction',
      type: 'diary',
      status: 'draft',
      date: '2026-09-14',
      content: `१४ सितम्बर, शाम ७:२० बजे।
गाड़ी दो घंटे लेट थी। प्लेटफ़ॉर्म नम्बर तीन पर एक बुज़ुर्ग चाय वाला अपनी छोटी सी केतली से भाप उड़ाती चाय कुल्हड़ में ढाल रहा था। 

उसके चेहरे की झुर्रियों में शायद मुझसे ज़्यादा कहानियां थीं। मैंने अपनी जेब से नोटबुक निकाली और फौरन कुछ पंक्तियाँ लिखीं:
"ठहरी हुई रेल की खिड़की से देखो,
तो लगता है पूरी दुनिया भाग रही है,
और हम बस एक तमाशाई हैं।"

इस दृश्य को मुझे अपनी किताब के तीसरे भाग में नायक के अकेलेपन को दर्शाने के लिए इस्तेमाल करना है।`,
      createdAt: '2026-09-14T19:20:00Z',
      updatedAt: '2026-09-14T20:15:00Z',
    },
    {
      id: 'ch-3',
      title: 'पात्र परिचय: प्रोफेसर आनंद और उनके मौन विचार',
      subtitle: 'Character Profile: Prof. Anand',
      type: 'characters',
      status: 'draft',
      date: '2026-10-01',
      content: `नाम: प्रोफेसर आनंद वर्मा (उम्र ५४ वर्ष)
व्यवसाय: दर्शनशास्त्र के सेवानिवृत्त अध्यापक।
स्वभाव: कम बोलने वाले, आँखों में गहरा चिंतन, हमेशा अपने हाथ में एक चमड़े का झोला और फाउंटेन पेन रखते हैं।

महत्वपूर्ण संवाद:
"किताबें हमें जीना नहीं सिखातीं, वे बस यह एहसास कराती हैं कि हम अकेले नहीं हैं जो इस दर्द से गुज़र रहे हैं।"`,
      createdAt: '2026-10-01T12:00:00Z',
      updatedAt: '2026-10-01T12:30:00Z',
    },
  ],
};

export const SAMPLE_BOOK_PROJECT_2: BookProject = {
  id: 'book-project-2',
  title: 'मौन के पार (Beyond the Silence)',
  subtitle: 'एक सामाजिक व रहस्यमयी उपन्यास',
  authorName: 'कवि व कथाकार',
  genre: 'उपन्यास / Novel',
  targetWordCount: 65000,
  primaryLanguage: 'Hindi / English',
  activeChapterId: 'bp2-ch1',
  coverColor: 'indigo',
  lastSavedAt: new Date().toISOString(),
  syncedToCloud: true,
  lastCloudSyncAt: new Date().toISOString(),
  chapters: [
    {
      id: 'bp2-ch1',
      title: 'अध्याय १: बंद हवेली और वह आखिरी चिट्ठी',
      subtitle: 'The Locked Mansion & The Last Letter',
      type: 'chapter',
      status: 'in_progress',
      date: '2026-10-15',
      epigraphQuote: {
        quote: 'मौन कभी कमजोर नहीं होता, वह केवल सही समय की प्रतीक्षा करता है।',
        author: 'रामधारी सिंह "दिनकर"',
        source: 'रश्मिरथी प्रसंग',
      },
      content: `पहाड़ी कस्बे के उस पुराने डाकघर में जब शाम की धुंध उतरती, तो डाकिया दीनदयाल अपनी पुरानी साइकिल को बरामदे में खड़ा करता। 

उस दिन एक बिना पते का लिफाफा आया था। मोहर पर कोई तारीख नहीं थी, बस लाल लाख से सील किया हुआ एक शब्द लिखा था—"अंतिम सच"। 

हवेली के ऊंचे लोहे के गेट पर ताला लगा था, लेकिन खिड़की के पर्दे के पीछे एक धीमी रोशनी अब भी कांप रही थी।`,
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bp2-ch2',
      title: 'पात्र रूपरेखा: इंस्पेक्टर कबीर राठौड़',
      subtitle: 'Character Profile: Inspector Kabir',
      type: 'characters',
      status: 'draft',
      date: '2026-10-16',
      content: `उम्र: ३८ वर्ष।
कद-काठी: लंबा, सख्त चेहरा, सिगार पीने की आदत।
विशेषता: मुकदमों में सबूतों से ज्यादा लोगों की खामोशी पर भरोसा करता है।`,
      createdAt: '2026-10-16T11:00:00Z',
      updatedAt: '2026-10-16T11:30:00Z',
    },
  ],
};

export const INITIAL_BOOKS_LIBRARY: BookProject[] = [
  SAMPLE_BOOK_PROJECT,
  SAMPLE_BOOK_PROJECT_2,
];

// Generates an authentic SVG diary page image as base64 for testing OCR immediately
export function createSampleHandwrittenDiarySvg(theme: 'hindi' | 'english' = 'hindi'): string {
  if (theme === 'hindi') {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <defs>
        <pattern id="lines" width="100" height="34" patternUnits="userSpaceOnUse">
          <line x1="0" y1="33" x2="100" y2="33" stroke="#cbd5e1" stroke-width="1.2" />
        </pattern>
        <filter id="paper-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
          <feDiffuseLighting in="noise" lighting-color="#fffbeb" surfaceScale="2" result="light">
            <feDistantLight azimuth="60" elevation="50"/>
          </feDiffuseLighting>
          <feBlend mode="multiply" in="SourceGraphic" in2="light"/>
        </filter>
      </defs>
      
      <!-- Vintage notebook paper background -->
      <rect width="800" height="1000" fill="#fefae0" />
      <rect width="800" height="1000" fill="url(#lines)" opacity="0.8" />
      
      <!-- Margin line -->
      <line x1="120" y1="0" x2="120" y2="1000" stroke="#f87171" stroke-width="2" opacity="0.6" />
      <line x1="124" y1="0" x2="124" y2="1000" stroke="#f87171" stroke-width="1" opacity="0.4" />
      
      <!-- Header / Date in handwriting style -->
      <text x="140" y="80" font-family="'Caveat', 'Segoe Script', cursive, serif" font-size="24" fill="#1e3a8a" font-weight="bold">
        दिनांक: १५ अक्टूबर २०२६ | रात १०:३० बजे
      </text>
      <text x="140" y="115" font-family="'Caveat', cursive, serif" font-size="28" fill="#0f172a" font-weight="bold">
        शीर्षक: यादों का झरोखा और नई किताब
      </text>
      
      <!-- Handwritten Diary Content in Hindi -->
      <g font-family="'Caveat', 'Noto Sans Devanagari', cursive, sans-serif" font-size="22" fill="#1e293b" letter-spacing="1">
        <text x="140" y="185">आज पूरा दिन बारिश होती रही। खिड़की पर बैठ कर चाय पीते हुए</text>
        <text x="140" y="219">मुझे अपने गाँव के पुराने मकान की याद आ गयी। छत से टपकता पानी</text>
        <text x="140" y="253">और दादी माँ की सुनाई हुई परियों की कहानियां।</text>
        
        <text x="140" y="321">मैंने फैसला किया है कि किताब का मुख्य पात्र "माधव" अपने बचपन</text>
        <text x="140" y="355">की इस बारिश को कभी नहीं भूल पाएगा। वही बारिश उसके जीवन</text>
        <text x="140" y="389">का सबसे बड़ा मोड़ बन जाती है जब वह शहर जाने वाली बस पकड़ता है।</text>
        
        <text x="140" y="457">डायरी में लिखने का मज़ा ही कुछ और है। हाथ से कलम चलाते हुए</text>
        <text x="140" y="491">दिमाग की गति और दिल की धड़कन एक ताल में बहने लगती है।</text>
        <text x="140" y="525">कल सुबह माधव और उसके दोस्त कबीर के बीच का संवाद लिखना है।</text>
        
        <!-- Scratched note in margin -->
        <text x="25" y="400" transform="rotate(-90 25,400)" font-size="14" fill="#b91c1c" font-style="italic">
          *नोट: कबीर का किरदार थोड़ा विद्रोही होना चाहिए!
        </text>
        
        <!-- Signature -->
        <text x="450" y="660" font-size="26" font-style="italic" fill="#1e3a8a">~ एक मुसाफिर कलमकार</text>
      </g>
    </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } else {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <defs>
        <pattern id="lines2" width="100" height="34" patternUnits="userSpaceOnUse">
          <line x1="0" y1="33" x2="100" y2="33" stroke="#cbd5e1" stroke-width="1.2" />
        </pattern>
      </defs>
      <rect width="800" height="1000" fill="#fdfbf7" />
      <rect width="800" height="1000" fill="url(#lines2)" opacity="0.8" />
      <line x1="120" y1="0" x2="120" y2="1000" stroke="#f87171" stroke-width="2" opacity="0.6" />
      
      <text x="140" y="80" font-family="'Caveat', cursive, serif" font-size="24" fill="#1e3a8a" font-weight="bold">
        Date: October 19, Late Night Journal
      </text>
      <text x="140" y="115" font-family="'Caveat', cursive, serif" font-size="28" fill="#0f172a" font-weight="bold">
        Reflections for Chapter 4: The Silent Crossing
      </text>
      
      <g font-family="'Caveat', cursive, serif" font-size="22" fill="#1e293b">
        <text x="140" y="185">The midnight fog crept through the quiet mountain pass.</text>
        <text x="140" y="219">Sarah held the weathered letter against her chest,</text>
        <text x="140" y="253">wondering if forgiving someone ever undoes the silence.</text>
        
        <text x="140" y="321">"We don't travel to escape life," she whispered to the wind,</text>
        <text x="140" y="355">"we travel so that life does not escape from us."</text>
        
        <text x="140" y="423">Need to weave this thought into the climax before dawn.</text>
        <text x="140" y="457">Check grammar in the prologue dialogue tomorrow.</text>
        
        <text x="450" y="580" font-size="26" font-style="italic" fill="#1e3a8a">~ Author Note</text>
      </g>
    </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
