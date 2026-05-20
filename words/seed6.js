const path = require('path');
const initSqlJs = require('sql.js');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'words.db');

const words = [
// ===== ACADEMIC VERBS =====
["abstain","saqlanmoq, tiyilmoq","refrain, avoid, withhold","He abstained from voting."],
["acclaim","olqishlamoq, tan olmoq","praise, applaud, honor","The book was acclaimed by critics."],
["acclimate","moslashmoq, ko'nikmoq","adapt, adjust, accustom","It takes time to acclimate to a new culture."],
["accrue","yig'ilmoq, to'planmoq","accumulate, amass, build up","Experience accrues over the years."],
["acquiesce","jim rozi bo'lmoq","agree, consent, comply","She acquiesced to his request."],
["adhere","rioya qilmoq, yopishmoq","comply, stick, follow","We must adhere to safety standards."],
["admonish","ogohlantirmoq, tanbeh bermoq","warn, scold, caution","The teacher admonished the student."],
["advocate","qo'llab-quvvatlamoq","support, promote, champion","She advocates for human rights."],
["affirm","tasdiqlash, ishontirmoq","confirm, assert, declare","The president affirmed his commitment to peace."],
["aggravate","og'irlashtirmoq, yomonlashtirmoq","worsen, intensify, exacerbate","Smoking aggravates lung diseases."],
["agitate","bezovta qilmoq, hayajonga solmoq","upset, stir, provoke","The news agitated the financial markets."],
["allay","yupantirmoq, tinchitmoq","calm, ease, soothe","She allayed his concerns with a smile."],
["allocate","ajratmoq, taqsimlamoq","distribute, assign, apportion","Resources were allocated fairly."],
["allude","ishora qilmoq","hint, refer, suggest","The speaker alluded to recent events."],
["amalgamate","birlashtirmoq","merge, combine, unite","Two departments were amalgamated."],
["ameliorate","yaxshilamoq","improve, enhance, better","Steps were taken to ameliorate conditions."],
["annex","qo'shib olmoq, ilova qilmoq","attach, add, seize","The museum annexed a new wing."],
["annihilate","to'liq yo'q qilmoq","destroy, obliterate, wipe out","The asteroid could annihilate life on Earth."],
["antagonize","dushman qilmoq, g'azablantirmoq","provoke, anger, irritate","His comments antagonized the audience."],
["appease","xotirjam qilmoq","calm, pacify, placate","The manager tried to appease the client."],
["apportion","taqsimlamoq","divide, share, distribute","The blame was apportioned equally."],
["appraise","baho bermoq","evaluate, assess, value","The expert appraised the property."],
["apprehend","tushunmoq, qo'lga olmoq","understand, arrest, seize","Police apprehended the suspect at dawn."],
["arbitrate","hakamlik qilmoq","mediate, judge, settle","A third party was asked to arbitrate."],
["ascertain","aniqlash, bilib olmoq","determine, discover, establish","Police ascertained the cause of the fire."],
["assail","hujum qilmoq, tanqid qilmoq","attack, criticize, assault","Critics assailed the government's decision."],
["assert","ta'kidlamoq, da'vo qilmoq","claim, declare, state","She asserted her right to speak."],
["atone","gunohini yuvmoq, uzr so'ramoq","repent, make amends, compensate","He tried to atone for his past mistakes."],
["augment","oshirmoq, kuchaytirmoq","increase, boost, enhance","She augmented her income with freelancing."],

// ===== ACADEMIC NOUNS =====
["aberration","og'ish, normadan chetga chiqish","anomaly, deviation, irregularity","The result was an aberration in the data."],
["accolade","mukofot, maqtov","award, honor, praise","She received the highest accolade."],
["acumen","zukkolik, aqlli bo'lish","insight, sharpness, intelligence","His business acumen led to great success."],
["adage","maqol, donishmandona so'z","saying, proverb, maxim","As the old adage goes, time is money."],
["advent","kelishi, paydo bo'lishi","arrival, emergence, dawn","The advent of computers changed the world."],
["adversity","qiyinchilik, baxtsizlik","hardship, misfortune, difficulty","She showed courage in the face of adversity."],
["affinity","yaqinlik, moyillik","attraction, kinship, connection","He has an affinity for classical music."],
["affluence","badavlatlik, boylik","wealth, richness, prosperity","Affluence does not guarantee happiness."],
["aftermath","oqibat, ortidan keladigan","consequence, result, wake","The aftermath of the disaster was devastating."],
["allegiance","sodiqlik, sadoqat","loyalty, fidelity, devotion","Soldiers pledge allegiance to the flag."],
["allusion","ishora, nozik ma'no","reference, hint, mention","The poem contains an allusion to Homer."],
["altruism","beg'arazlik, o'zga uchun qayg'urish","selflessness, generosity, charity","True altruism expects nothing in return."],
["ambiguity","noaniqlik, ikki ma'nolilik","uncertainty, vagueness, obscurity","The contract was full of ambiguity."],
["amnesty","amnistiya, kechirim","pardon, forgiveness, reprieve","A general amnesty was declared."],
["anarchy","tartibsizlik, boshboshdoqlik","chaos, disorder, lawlessness","Anarchy followed the revolution."],
["anecdote","qisqa hikoya, latifa","story, tale, narrative","He told an amusing anecdote about his travels."],
["anguish","iztirob, azob","agony, pain, torment","She felt deep anguish at the loss."],
["animosity","adovat, dushmanlik","hostility, hatred, ill will","There was deep animosity between the groups."],
["anomaly","g'ayritabiiylik, anomaliya","irregularity, oddity, exception","The data showed a clear anomaly."],
["antecedent","oldingi holat, sabab","predecessor, cause, origin","The antecedents of the conflict go back decades."],
["anthology","to'plam, gulchin","collection, compilation, treasury","An anthology of modern poetry was published."],
["antipathy","nafrat, yoqtirmaslik","dislike, aversion, hostility","She had a strong antipathy to violence."],
["apathy","befarqlik, loqaydlik","indifference, unconcern, lethargy","Widespread apathy undermines democracy."],
["aplomb","o'ziga ishonch, xotirjamlik","confidence, composure, poise","She handled the pressure with aplomb."],
["apparatus","apparat, qurilma","equipment, machinery, device","The scientific apparatus was complex."],
["apprehension","xavotir, tushunish","anxiety, understanding, fear","There was growing apprehension about the economy."],
["aptitude","iste'dod, layoqat","talent, ability, gift","She has a natural aptitude for languages."],
["aristocracy","zodagonlar, oliy tabaqalar","nobility, elite, upper class","The aristocracy lost power after the revolution."],
["artifact","buyum, san'at asari","object, relic, antique","The artifact dates back to 3000 BC."],

// ===== ACADEMIC ADJECTIVES =====
["abject","nochor, dahshatli","miserable, wretched, pitiful","They live in abject poverty."],
["abrupt","to'satdan, keskin","sudden, sharp, unexpected","The car came to an abrupt stop."],
["abstract","mavhum, abstrakt","theoretical, conceptual, intangible","Abstract art does not depict reality."],
["acute","o'tkir, keskin","severe, sharp, intense","There is an acute shortage of doctors."],
["adamant","qat'iy, o'jar","firm, resolute, unyielding","She was adamant about her decision."],
["adept","mohir, usta","skilled, proficient, expert","He is adept at problem-solving."],
["adverse","salbiy, noqulay","unfavorable, harmful, detrimental","Adverse weather delayed the flight."],
["affable","xushmuomala, samimiy","friendly, warm, approachable","The manager has an affable personality."],
["affluent","badavlat, boy","wealthy, rich, prosperous","Affluent families live in the suburbs."],
["aghast","dahshatga tushgan","horrified, shocked, appalled","He was aghast at the destruction."],
["agile","epchil, tez","nimble, quick, flexible","Cats are very agile animals."],
["akin","o'xshash, qarindosh","similar, related, comparable","Joy and happiness are akin."],
["ambiguous","noaniq, ikki ma'noli","vague, unclear, equivocal","His reply was deliberately ambiguous."],
["ambivalent","ikkilanuvchi, qarama-qarshi hisli","undecided, uncertain, mixed","She felt ambivalent about the move."],
["amenable","tayyor, ko'nuvchan","willing, agreeable, receptive","He is amenable to new ideas."],
["amicable","do'stona, sulhli","friendly, cordial, peaceful","They reached an amicable agreement."],
["ample","yetarli, mo'l","sufficient, abundant, generous","There was ample time to prepare."],
["analogous","o'xshash, analogik","similar, comparable, parallel","The two cases are analogous."],
["anomalous","g'ayrioddiy, nostandart","abnormal, irregular, unusual","The anomalous weather surprised everyone."],
["apathetic","befarq, loqayd","indifferent, uninterested, passive","Voters were increasingly apathetic."],
["apprehensive","xavotirli, tashvishli","anxious, worried, fearful","She was apprehensive about the exam."],
["arbitrary","o'zboshimchalik, asossiz","random, capricious, subjective","The rules seemed arbitrary and unfair."],
["arcane","sir, maxfiy","mysterious, secret, obscure","The rituals were arcane and complex."],
["archaic","eskirgan, qadimiy","outdated, old, antiquated","Some laws are archaic and need reform."],
["ardent","otashin, ishtiyoqli","passionate, enthusiastic, fervent","He is an ardent supporter of democracy."],
["arduous","mashaqqatli, qiyin","difficult, hard, grueling","The arduous journey tested their limits."],
["arid","qurg'oq, issiq","dry, barren, parched","Arid regions receive very little rain."],
["articulate","aniq, ravon so'zli","eloquent, clear, fluent","She is an articulate debater."],
["assiduous","tirishqoq, sergak","diligent, hardworking, dedicated","An assiduous student achieves great results."],
["astute","zukko, aqlli","shrewd, clever, sharp","She is an astute businesswoman."],
["audacious","jasur, dovyurak","bold, daring, brave","It was an audacious rescue mission."],
["auspicious","omadli, qulаy","favorable, promising, fortunate","The year had an auspicious beginning."],
["austere","qattiq, oddiy","strict, plain, severe","The monastery has an austere lifestyle."],
["authentic","haqiqiy, asl","genuine, real, true","Is this painting authentic?"],
["benevolent","xayrxoh, mehribon","kind, generous, charitable","A benevolent leader cares for all."],
["benign","zararsiz, xayrixoh","harmless, kind, gentle","The growth was found to be benign."],
["blatant","ochiqdan-ochiq, yuzaga ko'ringan","obvious, flagrant, brazen","It was a blatant error."],
["bleak","tushkun, xira","grim, dismal, desolate","The economic outlook remains bleak."],
["brazen","uyatsiz, surbet","bold, shameless, audacious","It was a brazen act of defiance."],
["brevity","qisqalik, lo'ndalik","shortness, conciseness, briefness","Brevity in writing is appreciated."],
["brittle","mo'rt, sinuvchan","fragile, breakable, crisp","The old bones were brittle."],
["burgeoning","tez o'suvchi, rivojlanuvchi","growing, expanding, flourishing","The burgeoning tech industry creates jobs."],
["candid","ochiq, samimiy","honest, frank, straightforward","She gave a candid interview about her struggles."],

// ===== MEDICINE & BODY =====
["abdomen","qorin","stomach, belly, midsection","She felt pain in her abdomen."],
["ailment","kasallik, dard","illness, disease, condition","He suffered from a minor ailment."],
["antibiotic","antibiotik","antimicrobial, medicine, drug","The doctor prescribed antibiotics."],
["artery","arteriya, tomir","blood vessel, vein, vessel","A blocked artery can cause a heart attack."],
["biopsy","biopsiya, to'qima olish","tissue sample, examination, test","The biopsy revealed no cancer."],
["carcinogen","kanserogen, rak keltirib chiqaruvchi","cancer-causing agent, toxin","Asbestos is a known carcinogen."],
["cardiovascular","yurak-qon tomir","heart-related, circulatory","Cardiovascular disease is the leading cause of death."],
["clinical","klinik, amaliy","medical, hospital, therapeutic","Clinical trials showed promising results."],
["congenital","tug'ma, ona qornidagi","inborn, hereditary, innate","The child had a congenital heart defect."],
["contagious","yuqumli, tarqaladigan","infectious, communicable, spreading","The flu is highly contagious."],
["dermatology","dermatologiya, teri kasalliklari","skin science, skin care","She specializes in dermatology."],
["diagnosis","tashxis, kasallikni aniqlash","detection, identification, analysis","An accurate diagnosis is essential."],
["dosage","dozа, miqdor","amount, quantity, portion","Follow the recommended dosage."],
["epidemic","epidemiya, tarqalish","outbreak, spread, plague","The epidemic was brought under control."],
["fracture","sinish, yorilish","break, crack, rupture","She suffered a fracture in her wrist."],
["hemorrhage","qon ketish, qon oqishi","bleeding, blood loss","The patient suffered a brain hemorrhage."],
["immunization","immunlashtirish, emlash","vaccination, inoculation, shot","Childhood immunization prevents diseases."],
["incubation","inkubatsiya, rivojlanish davri","development, gestation, hatching","The incubation period is 14 days."],
["inflammation","yallig'lanish","swelling, irritation, redness","Inflammation is a sign of infection."],
["injection","in'ektsiya, ukol","shot, jab, vaccination","The nurse gave him an injection."],
["malignant","xavfli, yomon sifatli","cancerous, dangerous, harmful","The tumor was found to be malignant."],
["neurological","nevrologik, asab bilan bog'liq","brain-related, nervous system","Neurological disorders require specialist care."],
["organ","organ, a'zo","body part, tissue, structure","The heart is a vital organ."],
["pharmaceutical","farmatsevtik, dori","drug, medicine, medicinal","The pharmaceutical industry is profitable."],
["physician","shifokor, tabib","doctor, medical practitioner, clinician","She consulted a physician about her symptoms."],
["prognosis","prognoz, bashorat","outlook, forecast, prediction","The prognosis for recovery is good."],
["psychiatry","psixiatriya","mental health, psychology","Psychiatry treats mental disorders."],
["remedy","davo, yechim","cure, treatment, solution","Natural remedies are often effective."],
["symptom","alomat, belgi","sign, indication, warning","Fatigue is a common symptom."],
["therapy","terapiya, davolash","treatment, counseling, cure","Physical therapy helped her recovery."],
["transplant","ko'chirish, transplantatsiya","transfer, graft, implant","She received a kidney transplant."],
["trauma","shikast, jarohat","injury, wound, shock","Head trauma requires immediate attention."],
["vaccine","vaksina, em","immunization, inoculation, shot","The COVID vaccine saved millions of lives."],

// ===== PHILOSOPHY & ETHICS =====
["altruism","beg'arazlik, fidoyilik","selflessness, charity","True altruism expects no reward."],
["autonomy","mustaqillik, erkinlik","independence, self-governance, freedom","Moral autonomy is important in ethics."],
["benevolence","xayrixohlik, mehribonlik","kindness, generosity, goodwill","Benevolence is a virtue in all cultures."],
["conscience","vijdon, imon","morality, ethics, inner voice","Let your conscience be your guide."],
["contemplation","fikrlash, mushohada","meditation, reflection, thought","Contemplation leads to deeper understanding."],
["determinism","determinizm, taqdirga bo'ysunish","fatalism, predestination","Determinism argues that all events are predetermined."],
["dilemma","ikkilanish, murakkab holat","predicament, quandary, problem","She faced an ethical dilemma."],
["dogma","dogma, tashqi qayd","doctrine, belief, principle","Scientific inquiry questions dogma."],
["empiricism","empirizm, tajribaga asoslangan","experimentalism, observation","Empiricism values evidence over theory."],
["epistemology","epistemologiya, bilish nazariyasi","theory of knowledge, cognition","Epistemology studies the nature of knowledge."],
["existentialism","ekzistensializm, mavjudlik falsafasi","philosophy of existence","Existentialism focuses on individual freedom."],
["hedonism","hedonizm, rohatga intilish","pleasure-seeking, self-indulgence","Hedonism values pleasure above all else."],
["humanism","insonparvarlik, gumanizm","humanitarianism, compassion","Humanism emphasizes the value of human life."],
["ideology","mafkura, g'oyalar tizimi","belief system, doctrine, philosophy","Political ideology shapes policy."],
["integrity","halollik, butunlik","honesty, morality, wholeness","She acted with integrity throughout her career."],
["metaphysics","metafizika","philosophy of being, ontology","Metaphysics explores the nature of reality."],
["morality","axloqiylik, odoblilik","ethics, virtue, principles","Morality guides human behavior."],
["nihilism","nigilizm, inkor qilish","negativism, skepticism, rejection","Nihilism rejects all moral principles."],
["objectivism","ob'ektivizm","realism, rationalism","Objectivism advocates individual rights."],
["paradox","paradoks, qarama-qarshilik","contradiction, puzzle, anomaly","The grandfather paradox is famous in physics."],
["pragmatism","pragmatizm, amaliyotchilik","practicality, realism, utilitarianism","Pragmatism values practical results."],
["relativism","relyativizm, nisbiylik","subjectivism, variability","Moral relativism argues ethics vary by culture."],
["skepticism","shubhachilik, skeptitsizm","doubt, questioning, disbelief","Healthy skepticism is important in science."],
["stoicism","stoitsizm, sabr-toqat","patience, endurance, resilience","Stoicism teaches emotional control."],
["subjectivism","sub'ektivizm, shaxsiy idrok","personal viewpoint, individual perspective","Subjectivism holds that truth is personal."],
["utilitarianism","utilitarizm, eng ko'p foyda","pragmatism, consequentialism","Utilitarianism seeks the greatest good for all."],
["virtue","fazialt, yaxshi xislat","goodness, morality, excellence","Patience is a virtue."],

// ===== LINGUISTICS & LANGUAGE =====
["accent","urg'u, sheva","pronunciation, dialect, stress","She speaks with a British accent."],
["bilingual","ikki tilli","dual-language, multilingual","Many children grow up bilingual."],
["colloquial","og'zaki, xalqona","informal, conversational, everyday","The essay should not use colloquial language."],
["connotation","yashirin ma'no, qo'shimcha ma'no","implication, overtone, suggestion","The word has negative connotations."],
["context","kontekst, mazmun","setting, background, framework","Understanding context is key to comprehension."],
["denotation","asosiy ma'no, to'g'ridan-to'g'ri ma'no","literal meaning, definition","The denotation of the word is straightforward."],
["dialect","sheva, lahja","accent, vernacular, idiom","Each region has its own dialect."],
["discourse","nutq, gapirish","speech, conversation, discussion","Academic discourse uses formal language."],
["etymology","etimologiya, so'z kelib chiqishi","word origin, word history","The etymology of this word is fascinating."],
["euphemism","evfemizm, yumshoq ifoda","polite expression, indirect term","Passed away is a euphemism for died."],
["fluency","ravonlik, erkin gapirish","proficiency, command, mastery","Fluency in English is required for the job."],
["grammar","grammatika","syntax, language rules, structure","Good grammar is essential for clear writing."],
["idiom","ibora, maqol","expression, phrase, saying","Break the ice is a common English idiom."],
["jargon","professional so'zlar, jargon","terminology, lingo, slang","Legal jargon is hard for non-lawyers."],
["lexicon","lug'at, so'z boyligi","vocabulary, dictionary, word list","The lexicon of English keeps growing."],
["linguistic","lingvistik, til bilan bog'liq","language-related, verbal","Linguistic diversity is a global treasure."],
["literacy","savodxonlik, o'qish bilish","reading ability, education","Improving literacy is a priority."],
["metaphor","metafora, ko'chma ma'no","figure of speech, comparison","Time is money is a famous metaphor."],
["monolingual","bir tilli","single-language","Most children start out monolingual."],
["multilingual","ko'p tilli","polyglot, many languages","The EU is a multilingual organization."],
["nuance","noziklik, ingichkalik","subtlety, shade, fine point","The nuances of the language take years to learn."],
["phonetics","fonetika, tovush ilmi","sound study, pronunciation","Phonetics helps with correct pronunciation."],
["pragmatics","pragmatika, amaliy til","language use, context meaning","Pragmatics studies how context affects meaning."],
["proficiency","malaka, mahorat","skill, competence, expertise","English proficiency is tested in IELTS."],
["rhetoric","ritorika, notiqlik san'ati","oratory, eloquence, persuasion","Political rhetoric can be misleading."],
["semantics","semantika, ma'no ilmi","meaning study, interpretation","Semantics analyzes word meanings."],
["simile","o'xshatish","comparison, analogy, likeness","As brave as a lion is a simile."],
["slang","jargon, ko'cha tili","informal language, colloquialism","Teenagers often use slang."],
["syntax","sintaksis, gap tuzilishi","grammar, sentence structure","English syntax differs from Uzbek."],
["terminology","terminologiya, atamalar","vocabulary, jargon, nomenclature","Medical terminology can be complex."],
["vernacular","mahalliy til, xalq tili","native language, dialect, local speech","The book is written in the vernacular."],
["vocabulary","lug'at, so'z boyligi","lexicon, word stock, terminology","Building vocabulary is key for IELTS."],

// ===== NUMBERS & MATH =====
["adjacent","yondosh, qo'shni (geometriyada)","next to, neighboring, adjoining","Adjacent angles share a common side."],
["algebra","algebra","mathematics, equations","She studied algebra in school."],
["approximate","taxminiy, yaqin","rough, estimated, close","The approximate distance is 100 km."],
["arithmetic","arifmetika","math, calculation, computation","Basic arithmetic includes addition and subtraction."],
["axis","o'q, markaz","center line, pivot, spindle","The earth rotates on its axis."],
["calculate","hisoblash","compute, figure, determine","Calculate the total cost."],
["circumference","aylana, perimetr","perimeter, circle, boundary","The circumference of the earth is 40,000 km."],
["coefficient","koeffitsient","factor, multiplier, number","The coefficient of friction was calculated."],
["correlation","korrelyatsiya, bog'liqlik","connection, relationship, link","There is a strong correlation between the variables."],
["decimal","o'nlik, kasr","fraction, point, tenth","Express the answer as a decimal."],
["diameter","diametr","width, breadth, span","The diameter of the circle is 10 cm."],
["equation","tenglama","formula, expression, calculation","Solve the equation for x."],
["exponential","eksponensial, tez o'suvchi","rapid, geometric, dramatic","Exponential growth doubled the population."],
["fraction","kasr, qism","portion, part, segment","A fraction of the population disagreed."],
["geometry","geometriya","shape study, spatial math","Geometry deals with shapes and angles."],
["graph","grafik, diagramma","chart, diagram, plot","The graph shows a clear upward trend."],
["hypothesis","gipoteza, faraz","theory, assumption, conjecture","The hypothesis was tested with experiments."],
["increment","o'sish, qo'shimcha","increase, addition, step","Prices rose in small increments."],
["infinite","cheksiz, tugamaydigan","limitless, boundless, endless","The universe may be infinite."],
["integer","butun son","whole number","Five is an integer."],
["logarithm","logarifm","mathematical function, log","Logarithms simplify complex calculations."],
["magnitude","kattalik, hajm","size, extent, scale","The magnitude of the earthquake was 6.5."],
["median","o'rtancha, mediana","middle, midpoint, average","The median income is $50,000."],
["parallel","parallel, teng","side by side, comparable","The two lines are parallel."],
["percentage","foiz, ulush","proportion, share, fraction","What percentage of students passed?"],
["perimeter","perimetr, tashqi chegara","boundary, circumference, border","Calculate the perimeter of the rectangle."],
["perpendicular","perpendikulyar, tik burchakli","at right angles, vertical","The two lines are perpendicular."],
["probability","ehtimollik, imkoniyat","likelihood, chance, odds","The probability of rain is 70%."],
["proportion","nisbat, mutanosiblik","ratio, share, relationship","The proportion of women in STEM is growing."],
["radius","radius","half-diameter, distance from center","The radius of the circle is 5 cm."],
["ratio","nisbat, koeffitsient","proportion, rate, fraction","The ratio of boys to girls is 3 to 2."],
["statistics","statistika","data analysis, numbers, figures","Statistics show a decline in crime."],
["symmetry","simmetriya, mutanosiblik","balance, proportion, harmony","The building has perfect symmetry."],
["tangent","urinma, chetga chiqish","touching line, digression","He went off on a tangent during the speech."],
["theorem","teorema","principle, law, proposition","Pythagoras' theorem is fundamental."],
["variable","o'zgaruvchi, turlicha","factor, element, changeable","There are many variables in the experiment."],
["velocity","tezlik","speed, pace, rate","The velocity of light is 300,000 km/s."],
["vertex","uchlik, cho'qqi nuqta","point, peak, apex","The vertex of the triangle is at the top."],
["volume","hajm, ovoz balandligi","capacity, size, amount","Calculate the volume of the cylinder."],
];

async function seed() {
    const SQL = await initSqlJs();
    let db;

    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
        db.run(`CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, english TEXT NOT NULL, uzbek TEXT NOT NULL, synonyms TEXT DEFAULT '', example TEXT DEFAULT '', score INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    }

    const existing = new Set();
    const rows = db.exec('SELECT english FROM words');
    if (rows.length > 0) {
        rows[0].values.forEach(r => existing.add(r[0].toLowerCase()));
    }

    let added = 0;
    const stmt = db.prepare('INSERT INTO words (english, uzbek, synonyms, example) VALUES (?, ?, ?, ?)');

    for (const [eng, uzb, syn, ex] of words) {
        if (!existing.has(eng.toLowerCase())) {
            stmt.run([eng, uzb, syn || '', ex || '']);
            existing.add(eng.toLowerCase());
            added++;
        }
    }
    stmt.free();

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));

    const total = db.exec('SELECT COUNT(*) FROM words');
    console.log(`${added} ta yangi so'z qo'shildi. Jami: ${total[0].values[0][0]} ta so'z.`);
    db.close();
}

seed().catch(console.error);
