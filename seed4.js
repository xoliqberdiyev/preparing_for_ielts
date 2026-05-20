const path = require('path');
const initSqlJs = require('sql.js');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'words.db');

const words = [
// ===== PHRASAL VERBS (IELTS Essential) =====
["bring about","sabab bo'lmoq, keltirib chiqarmoq","cause, create, produce","The reforms brought about significant changes."],
["bring up","tarbiyalamoq, gapni boshlamoq","raise, mention, nurture","She was brought up in a small village."],
["break down","buzilmoq, parchalanmoq","fail, collapse, decompose","The car broke down on the highway."],
["break out","boshlanmoq, tarqalmoq","erupt, start, spread","War broke out in 1939."],
["break through","yorib o'tmoq, muvaffaqiyatga erishmoq","penetrate, achieve, overcome","Scientists broke through in cancer research."],
["call for","talab qilmoq","demand, require, need","The situation calls for immediate action."],
["call off","bekor qilmoq","cancel, abandon, postpone","The event was called off due to rain."],
["carry out","bajarmoq, amalga oshirmoq","perform, execute, conduct","The team carried out the experiment."],
["come about","sodir bo'lmoq","happen, occur, arise","How did this situation come about?"],
["come across","duch kelmoq, tasodifan topmoq","encounter, find, discover","I came across an interesting article."],
["come up with","o'ylab topmoq","invent, devise, think of","She came up with a brilliant idea."],
["cut back","qisqartirmoq, kamaytirmoq","reduce, decrease, curtail","The company cut back on spending."],
["cut down","kesmoq, kamaytirmoq","reduce, fell, decrease","We need to cut down on sugar."],
["deal with","shug'ullanmoq, hal qilmoq","handle, manage, address","How do you deal with stress?"],
["die out","yo'q bo'lmoq, tugamoq","disappear, become extinct, vanish","Many species are dying out."],
["do away with","yo'q qilmoq, tugatmoq","eliminate, abolish, remove","The government did away with the old system."],
["draw up","tuzmoq, tayyorlamoq","draft, prepare, compose","She drew up a detailed plan."],
["drop out","tashlab ketmoq, chiqib ketmoq","withdraw, quit, leave","He dropped out of university."],
["figure out","tushunmoq, hal qilmoq","understand, solve, determine","Can you figure out this problem?"],
["find out","bilmoq, aniqlash","discover, learn, determine","She found out the truth eventually."],
["get along","yaxshi munosabatda bo'lmoq","cooperate, agree, be friendly","They get along very well."],
["get over","yengmoq, o'tkazib yubormoq","overcome, recover, surmount","It took months to get over the illness."],
["get rid of","qutulmoq","eliminate, remove, discard","We need to get rid of old habits."],
["give in","bo'ysunmoq, taslim bo'lmoq","surrender, yield, submit","He finally gave in to the pressure."],
["give up","voz kechmoq, tashlamoq","quit, abandon, stop","Never give up on your dreams."],
["go ahead","davom etmoq, boshlash","proceed, continue, start","The project will go ahead as planned."],
["go through","boshdan kechirmoq, o'tmoq","experience, undergo, endure","She went through a difficult period."],
["hand in","topshirmoq, bermoq","submit, deliver, present","Please hand in your assignment by Friday."],
["hold back","to'xtatmoq, yashirmoq","restrain, prevent, withhold","She held back her tears."],
["keep up with","qadam bilan yurmoq, ergashmoq","maintain pace, follow, match","It is hard to keep up with technology."],
["lay off","ishdan bo'shatmoq","dismiss, fire, let go","The company laid off 200 workers."],
["look after","g'amxo'rlik qilmoq","care for, tend, mind","She looks after her elderly parents."],
["look forward to","intiqlik bilan kutmoq","anticipate, await, expect","I look forward to hearing from you."],
["look into","tekshirmoq, o'rganmoq","investigate, examine, explore","Police are looking into the matter."],
["look up to","hurmat qilmoq","admire, respect, revere","Children look up to their teachers."],
["make up","to'ldirmoq, yarashmoq, to'qib chiqarmoq","compose, reconcile, invent","Women make up 60% of the workforce."],
["pass away","vafot etmoq","die, perish, decease","Her grandfather passed away last year."],
["pick up","olmoq, o'rganmoq","collect, learn, acquire","She picked up Spanish while traveling."],
["point out","ko'rsatmoq, e'tibor qaratmoq","indicate, highlight, mention","He pointed out several errors."],
["put forward","taklif qilmoq","propose, suggest, recommend","She put forward a new plan."],
["put off","kechiktirmoq","postpone, delay, defer","The meeting was put off until Monday."],
["put up with","chidamoq, sabr qilmoq","tolerate, endure, bear","I cannot put up with this noise."],
["rule out","istisno qilmoq, rad etmoq","exclude, eliminate, reject","Doctors ruled out cancer."],
["run out","tugamoq, tamom bo'lmoq","exhaust, deplete, expire","We ran out of time."],
["set up","tashkil etmoq, o'rnatmoq","establish, create, found","They set up a new business."],
["stand for","ma'nosi bo'lmoq, himoya qilmoq","represent, symbolize, support","UN stands for United Nations."],
["take off","uchmoq, yechmoq, muvaffaqiyatga erishmoq","depart, remove, succeed","The plane took off on time."],
["take on","qabul qilmoq, o'z zimmasiga olmoq","accept, assume, undertake","She took on additional responsibilities."],
["take over","boshqaruvni olmoq","assume control, acquire, seize","The new CEO took over last month."],
["take up","boshlamoq, band qilmoq","begin, start, occupy","She took up painting as a hobby."],
["turn down","rad etmoq, pasaytirmoq","reject, refuse, decline","He turned down the job offer."],
["turn out","natija bermoq, bo'lib chiqmoq","result, prove, produce","Everything turned out well in the end."],
["work out","hal qilmoq, mashq qilmoq","solve, exercise, calculate","She works out every morning."],

// ===== COLLOCATIONS & IELTS EXPRESSIONS =====
["account for","tushuntirmoq, tashkil etmoq","explain, constitute, represent","Tourism accounts for 20% of the economy."],
["adhere to","rioya qilmoq","follow, comply with, observe","All students must adhere to the rules."],
["amount to","teng bo'lmoq, tashkil etmoq","equal, total, reach","The costs amounted to $1 million."],
["appeal to","murojaat qilmoq, yoqmoq","attract, request, please","The idea appeals to young people."],
["apply for","ariza bermoq","request, seek, petition","She applied for a scholarship."],
["approve of","ma'qullash","support, agree with, favor","Her parents did not approve of the plan."],
["arise from","kelib chiqmoq","result from, stem from, originate","Problems arise from poor communication."],
["aspire to","intilmoq","aim for, strive for, hope for","She aspires to become a diplomat."],
["attend to","e'tibor bermoq, shug'ullanmoq","deal with, look after, handle","Please attend to this matter urgently."],
["attribute to","bog'lamoq, sabab deb ko'rsatmoq","credit to, assign to, ascribe to","The success was attributed to teamwork."],
["back up","qo'llab-quvvatlamoq, zahira nusxa olmoq","support, confirm, copy","Data should be backed up regularly."],
["bear in mind","esda tutmoq","remember, consider, note","Bear in mind that the deadline is tomorrow."],
["benefit from","foyda olmoq","gain from, profit from","Students benefit from practical experience."],
["blow up","portlamoq, kattalashtirmoq","explode, enlarge, escalate","The situation blew up quickly."],
["boil down to","asosiy narsa bo'lmoq","amount to, reduce to, simplify to","The argument boils down to cost."],
["build on","asoslash, rivojlantirmoq","develop, expand on, strengthen","We need to build on our success."],
["catch on","tushunmoq, mashhur bo'lmoq","understand, become popular","The trend quickly caught on."],
["cater to","xizmat ko'rsatmoq","serve, provide for, supply","The hotel caters to business travelers."],
["come into effect","kuchga kirmoq","take effect, become active","The new law comes into effect in January."],
["comply with","rioya qilmoq","obey, follow, adhere to","Companies must comply with regulations."],
["consist of","iborat bo'lmoq","comprise, contain, include","The team consists of ten members."],
["contribute to","hissa qo'shmoq","add to, help, assist","Exercise contributes to good health."],
["cope with","engmoq, bardosh bermoq","manage, handle, deal with","She learned to cope with pressure."],
["correspond to","mos kelmoq","match, agree with, relate to","The results correspond to our predictions."],
["count on","ishonmoq, tayanmoq","rely on, depend on, trust","You can count on my support."],
["crack down on","qattiq choralar ko'rmoq","suppress, punish, enforce","Police cracked down on illegal parking."],
["depend on","bog'liq bo'lmoq","rely on, count on, hinge on","Success depends on hard work."],
["derive from","kelib chiqmoq","originate from, stem from","The word derives from Greek."],
["dispose of","tashlamoq, yo'q qilmoq","discard, remove, throw away","Dispose of waste properly."],
["distinguish between","farqlamoq","differentiate, tell apart","Can you distinguish between fact and opinion?"],
["draw on","foydalanmoq, tayanmoq","use, rely on, utilize","She drew on her experience."],
["dwell on","uzoq o'ylamoq","focus on, think about, linger on","Do not dwell on the past."],
["embark on","kirishmoq, boshlamoq","begin, start, undertake","They embarked on a new project."],
["engage in","shug'ullanmoq","participate in, take part in","He engaged in volunteer work."],
["fall behind","ortda qolmoq","lag, trail, lose ground","She fell behind in her studies."],
["fall short of","yetmaslik, bo'lmaslik","fail to reach, lack, miss","Revenue fell short of expectations."],
["focus on","diqqatni qaratmoq","concentrate on, center on","The study focuses on climate change."],
["give rise to","sabab bo'lmoq","cause, lead to, produce","Poverty gives rise to many problems."],
["go against","qarshi bo'lmoq","oppose, contradict, violate","This goes against our principles."],
["impose on","yuklash, majbur qilmoq","force on, inflict on","Do not impose your views on others."],
["inclined to","moyil bo'lmoq","likely to, tend to, prone to","She is inclined to agree."],
["interfere with","aralashmoq, xalaqit bermoq","disrupt, hinder, obstruct","Noise interferes with concentration."],
["invest in","sarmoya qo'ymoq","fund, finance, support","The government invested in education."],
["lead to","olib kelmoq, sabab bo'lmoq","cause, result in, bring about","Lack of exercise leads to health problems."],
["live up to","kutgandek bo'lmoq","meet, satisfy, fulfill","The product lived up to expectations."],
["make do with","bor narsa bilan yashash","manage with, cope with","We had to make do with limited resources."],
["object to","qarshi bo'lmoq","oppose, protest, disagree","She objected to the proposal."],
["opt for","tanlamoq","choose, select, prefer","She opted for the cheaper option."],
["originate from","kelib chiqmoq","stem from, derive from, come from","The tradition originates from ancient times."],
["participate in","ishtirok etmoq","take part in, join in, engage in","Students participate in various activities."],
["persist in","davom ettirmoq","continue, keep on, insist on","He persisted in his efforts."],
["phase out","bosqichma-bosqich tugatmoq","eliminate gradually, discontinue","The old system will be phased out."],
["prevail over","g'alaba qilmoq","overcome, triumph, win","Justice will prevail over injustice."],
["prior to","oldin, avval","before, preceding, earlier than","Prior to the meeting, read the report."],
["prone to","moyil, xavfi bor","likely, inclined, susceptible","The area is prone to flooding."],
["provide for","ta'minlamoq","supply, support, cater for","Parents provide for their children."],
["refrain from","tiyilmoq, saqlanmoq","avoid, abstain from, resist","Please refrain from smoking."],
["regardless of","qaramay, qaramasdan","despite, irrespective of","He continued regardless of the criticism."],
["relate to","bog'liq bo'lmoq, tushunmoq","connect to, concern, empathize","Many students can relate to this problem."],
["rely on","tayanmoq, ishonmoq","depend on, count on, trust","She relies on public transport."],
["resort to","murojaat qilmoq (oxirgi chora)","turn to, fall back on, use","He resorted to borrowing money."],
["result from","natija bo'lmoq","stem from, arise from, follow","Accidents result from carelessness."],
["result in","natijaga olib kelmoq","lead to, cause, produce","The mistake resulted in a delay."],
["run into","duch kelmoq, to'qnash kelmoq","encounter, meet, face","She ran into problems with the project."],
["stem from","kelib chiqmoq","originate from, arise from","His anger stems from frustration."],
["strive for","intilmoq","aim for, work towards, pursue","We strive for excellence."],
["subject to","bog'liq, ta'sirda","dependent on, liable to, conditional on","The plan is subject to approval."],
["subscribe to","obuna bo'lmoq, qo'shilmoq","agree with, support, sign up for","She subscribes to the magazine."],
["succeed in","muvaffaqiyatga erishmoq","achieve, accomplish, manage","She succeeded in passing the exam."],
["suffer from","aziyat chekmoq","endure, experience, undergo","He suffers from chronic pain."],
["sum up","xulosa qilmoq","summarize, conclude, recap","To sum up, education is essential."],
["switch to","o'tmoq, almashtirmoq","change to, shift to, convert to","The country switched to renewable energy."],
["take into account","hisobga olmoq","consider, factor in, bear in mind","Take into account all the risks."],
["tamper with","buzmoq, aralashmoq","interfere with, meddle with","Someone tampered with the evidence."],
["tend to","moyil bo'lmoq","incline to, be likely to","People tend to resist change."],
["think of","o'ylamoq, eslamoq","consider, regard, remember","What do you think of this idea?"],
["turn to","murojaat qilmoq","resort to, approach, seek help","She turned to her friends for advice."],
["ward off","oldini olmoq, himoya qilmoq","prevent, fend off, avert","Vaccines ward off diseases."],

// ===== ADDITIONAL UNIQUE ACADEMIC WORDS =====
["aberration","og'ish, g'ayritabiiylik","anomaly, deviation, irregularity","The result was an aberration."],
["abhor","jirkanmoq, nafratlanmoq","detest, loathe, hate","She abhors violence in any form."],
["abjure","voz kechmoq, rad etmoq","renounce, reject, abandon","He abjured his former beliefs."],
["ablaze","yonayotgan, porlayotgan","burning, on fire, glowing","The building was ablaze within minutes."],
["abnormal","g'ayritabiiy, noodatiy","unusual, atypical, irregular","The test results were abnormal."],
["aboriginal","tub joy, mahalliy","indigenous, native, original","Aboriginal art is highly valued."],
["abrasion","ishqalanish, tirnash","scratch, scrape, graze","The fall caused a minor abrasion."],
["abscond","qochmoq, yashirinmoq","flee, escape, run away","The thief absconded with the money."],
["absolve","oqlamoq, kechirmoq","forgive, pardon, acquit","He was absolved of all responsibility."],
["abstain","voz kechmoq, tiyilmoq","refrain, avoid, withhold","She abstained from alcohol."],
["abyss","tubsiz chuqurlik, jarlik","chasm, gulf, void","The country was on the edge of an abyss."],
["accede","rozi bo'lmoq, qo'shilmoq","agree, consent, comply","The government acceded to the demands."],
["accolade","mukofot, maqtov","award, honor, praise","She received many accolades for her work."],
["accomplish","bajarmoq, erishmoq","achieve, complete, fulfill","He accomplished his mission."],
["accrue","yig'ilmoq, to'planmoq","accumulate, amass, build up","Interest accrues monthly."],
["acme","cho'qqi, eng yuqori daraja","peak, pinnacle, summit","She reached the acme of her career."],
["acquiesce","indamay rozi bo'lmoq","agree, comply, consent","He acquiesced to their demands."],
["acrimonious","achchiq, o'tkir","bitter, hostile, harsh","The debate became acrimonious."],
["adamant","qat'iy, o'zgarmas","firm, resolute, unyielding","She was adamant about her position."],
["addendum","qo'shimcha, ilova","supplement, appendix, addition","An addendum was added to the contract."],
["adept","mohir, usta","skilled, expert, proficient","She is adept at negotiation."],
["adjudicate","hukm chiqarmoq, hal qilmoq","judge, decide, arbitrate","The court adjudicated the dispute."],
["admonition","ogohlantirish, tanbeh","warning, caution, reprimand","He received an admonition from the judge."],
["adversary","dushman, raqib","opponent, enemy, rival","She faced a worthy adversary."],
["advocate","himoyachi, qo'llab-quvvatlamoq","supporter, champion, promote","He advocates for environmental protection."],
["affidavit","qasamyod, guvohnoma","sworn statement, testimony, declaration","She signed an affidavit."],
["affluence","boylik, badavlatlik","wealth, prosperity, richness","The city's affluence attracted many residents."],
["aggravate","og'irlashtirmoq, xafa qilmoq","worsen, irritate, exacerbate","His comments aggravated the situation."],
["agile","epchil, tez","nimble, quick, flexible","She has an agile mind."],
["alchemy","alkimyo, sehrgarlik","magic, transformation, sorcery","The alchemy of turning lead into gold."],
["alienate","begona qilmoq, uzoqlashmoq","estrange, isolate, distance","His behavior alienated his friends."],
["allegory","allegoriya, ramziy hikoya","parable, fable, metaphor","The story is an allegory of power."],
["alleviate","yengillashtirmoq","ease, relieve, mitigate","The medicine alleviated her pain."],
["allocate","taqsimlamoq, ajratmoq","assign, distribute, allot","Resources were allocated efficiently."],
["altruistic","fidoyikorona, beg'araz","selfless, charitable, generous","His motivations were purely altruistic."],
["ambivalence","ikkilanish, qarama-qarshi his","indecision, uncertainty, mixed feelings","She felt ambivalence about the decision."],
["amenable","qulay, tayyor","agreeable, willing, receptive","He was amenable to the suggestion."],
["amicable","do'stona, tinch","friendly, cordial, harmonious","They reached an amicable settlement."],
["amnesty","amnistiya, avf","pardon, forgiveness, clemency","An amnesty was declared for minor offenses."],
["amplify","kuchaytirmoq","increase, boost, magnify","The speaker amplified the sound."],
["anarchy","boshboshdoqlik","chaos, lawlessness, disorder","The country descended into anarchy."],
["anecdotal","rivoyatga oid","informal, unverified, hearsay","The evidence was merely anecdotal."],
["animosity","adovat, dushmanlik","hostility, hatred, enmity","There was animosity between the groups."],
["annex","qo'shib olmoq","add, attach, incorporate","Russia annexed Crimea in 2014."],
["annihilate","qirmoq, yo'q qilmoq","destroy, obliterate, eliminate","The army annihilated the opposition."],
["annotation","izoh, sharh","note, comment, explanation","The book includes helpful annotations."],
["anomaly","g'ayritabiiylik","irregularity, deviation, exception","The weather anomaly puzzled scientists."],
["antagonist","qarama-qarshi tomon","opponent, adversary, enemy","The protagonist defeated the antagonist."],
["antipathy","nafrat, yoqtirmaslik","aversion, dislike, hostility","She felt an antipathy towards dishonesty."],
["apathy","befarqlik","indifference, unconcern, lethargy","Voter apathy led to low turnout."],
["apex","cho'qqi, eng yuqori nuqta","peak, summit, zenith","The company reached the apex of success."],
["appease","tinchitmoq, ko'nglini olmoq","pacify, calm, soothe","The company tried to appease angry customers."],
["applicable","qo'llash mumkin","relevant, appropriate, suitable","The rule is applicable to all employees."],
["appraise","baholamoq, ko'rib chiqmoq","evaluate, assess, estimate","The jeweler appraised the diamond."],
["apprehend","tushunmoq, qo'lga olmoq","understand, arrest, grasp","Police apprehended the criminal."],
["apprentice","shogird, o'rganuvchi","trainee, novice, student","She started as an apprentice chef."],
["apt","mos, to'g'ri","appropriate, fitting, suitable","It was an apt comparison."],
["arbiter","hakam, hakim","judge, referee, authority","The court acted as the final arbiter."],
["archaic","eskirgan, qadimiy","outdated, ancient, obsolete","The law is archaic and needs updating."],
["arduous","mashaqqatli, og'ir","difficult, grueling, tough","The arduous journey lasted weeks."],
["arid","quruq, qurg'oq","dry, parched, barren","The arid landscape stretched for miles."],
["aristocratic","zodagonlik","noble, elite, upper-class","She came from an aristocratic family."],
["articulate","aniq ifodalash","express clearly, enunciate, verbalize","She articulated her thoughts beautifully."],
["ascend","ko'tarilmoq, yuqorilash","rise, climb, go up","The balloon ascended into the sky."],
["ascertain","aniqlash, tekshirmoq","determine, discover, verify","We need to ascertain the truth."],
["aspiration","orzu, intilish","ambition, goal, hope","Her aspiration is to help others."],
["assail","hujum qilmoq","attack, assault, criticize","Critics assailed the government's policy."],
["assent","rozilik, ma'qullash","agreement, approval, consent","The board gave its assent."],
["assertion","da'vo, bayonot","claim, statement, declaration","Her assertion was backed by evidence."],
["assiduous","tirishqoq, g'ayratli","diligent, hardworking, persistent","He was assiduous in his studies."],
["astound","hayratga solmoq","amaze, astonish, stun","The news astounded the world."],
["atrocity","vahshiylik, razolat","brutality, cruelty, horror","War atrocities must be punished."],
["attain","erishmoq, qo'lga kiritmoq","achieve, reach, accomplish","She attained the highest level."],
["audacity","jasurlik, betgachoparlik","boldness, nerve, daring","He had the audacity to disagree."],
["auspicious","qulay, hayirli","favorable, promising, fortunate","The ceremony began on an auspicious note."],
["authoritative","vakolatli, ishonchli","reliable, official, commanding","The book is an authoritative guide."],
["avarice","tamah, ochko'zlik","greed, cupidity, acquisitiveness","Corporate avarice led to the crisis."],
["avid","ishtiyoqli, havasli","eager, keen, passionate","She is an avid supporter of education."],
["axiom","aksioma, umumiy qabul qilingan haqiqat","principle, truth, postulate","It is an axiom that education is vital."],
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
