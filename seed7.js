const path = require('path');
const initSqlJs = require('sql.js');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'words.db');

// Only completely new words not in previous seeds
const words = [
["abode","turar joy, uy","home, dwelling, residence","She found a comfortable abode."],
["absolve","oqlash, kechirim bermoq","forgive, pardon, exonerate","The court absolved her of all charges."],
["abstinence","o'zini tiyish, parhez","self-denial, restraint, sobriety","Abstinence from junk food improved his health."],
["abyss","jarlik, tubsizlik","chasm, void, depths","The economy was on the brink of an abyss."],
["accessory","aksessuar, qo'shimcha buyum","supplement, attachment, add-on","The phone comes with several accessories."],
["accomplice","jinoyat sherigi","partner in crime, associate","The accomplice was arrested."],
["accordance","muvofiqlik","agreement, conformity, compliance","In accordance with the rules, he was disqualified."],
["accrue","ortib bormoq","accumulate, increase, grow","Savings accrue interest over time."],
["acidity","kislotalik","sourness, sharpness, tartness","Soil acidity affects plant growth."],
["acme","eng yuqori daraja, cho'qqi","peak, pinnacle, zenith","The Roman Empire reached its acme."],
["acquaintance","tanish, bilish","friend, contact, associate","He is an old acquaintance of mine."],
["acrimonious","achchiq, ziddiyatli","bitter, hostile, resentful","The acrimonious debate lasted hours."],
["acuity","o'tkirlik, sezgirlik","sharpness, keenness, perception","Visual acuity declines with age."],
["adage","maqol, naql so'z","saying, proverb, maxim","The old adage proves true again."],
["addendum","qo'shimcha, ilova","supplement, appendix, postscript","An addendum was attached to the report."],
["adherent","tarafdor, izdosh","follower, supporter, devotee","The movement has many adherents."],
["adjunct","qo'shimcha, yordamchi qism","supplement, accessory, addition","Coffee is an adjunct to breakfast."],
["adroit","mohir, usta","skillful, deft, clever","He is adroit at negotiations."],
["adulation","haddan tashqari maqtov","flattery, worship, praise","Celebrity adulation is unhealthy."],
["adversarial","qarama-qarshi, dushmаnona","hostile, opposing, antagonistic","The adversarial system promotes justice."],
["aegis","homiylik, himoya","protection, sponsorship, patronage","The project operates under the aegis of UNESCO."],
["affidavit","qasamyod hujjati","sworn statement, declaration","She signed an affidavit in court."],
["affront","haqorat, xo'rlik","insult, offense, slight","His remarks were an affront to her dignity."],
["afterthought","keyinchalik o'ylangan narsa","addition, supplement, reconsideration","Safety was an afterthought in the design."],
["agate","aqiq (tosh)","gemstone, mineral, jewel","The ring was set with agate."],
["agenda","kun tartibi, reja","plan, schedule, program","Climate change tops the political agenda."],
["aggregate","umumiy miqdor, jami","total, sum, combined","The aggregate demand increased."],
["aghast","hayratda, dahshatda","shocked, horrified, appalled","She stood aghast at the scene."],
["ailment","kasallik, bemorlik","illness, disease, sickness","Common ailments include colds and flu."],
["alchemy","kimyogarchilik, sehrgarlik","magic, transformation, wizardry","Medieval alchemy sought to create gold."],
["alcove","o'yiq, tortma joy","niche, recess, bay","She read quietly in the alcove."],
["algorithm","algoritm, hisoblash usuli","formula, procedure, method","Social media uses complex algorithms."],
["alias","taxallus, laqab","pseudonym, nickname, pen name","The author wrote under an alias."],
["alienation","begonalashish, uzoqlashish","isolation, estrangement, detachment","Social alienation is a modern problem."],
["allegation","ayblov, da'vo","accusation, charge, claim","The allegations were investigated."],
["allergy","allergiya, yuqtirish","sensitivity, reaction, intolerance","Pollen allergies are common in spring."],
["alliance","ittifoq, hamkorlik","partnership, coalition, union","NATO is a military alliance."],
["allotment","ajratilgan ulush, qism","share, portion, allocation","Each family received a land allotment."],
["allowance","nafaqa, cho'ntak puli","stipend, grant, allocation","Children receive a weekly allowance."],
["allure","jozibadorlik, maftunkorlik","charm, attraction, appeal","The allure of fame is powerful."],
["almanac","taqvim, yilnoma","calendar, yearbook, reference","The almanac contains useful information."],
["altercation","janjal, so'z talashish","quarrel, argument, dispute","A verbal altercation occurred."],
["altitude","balandlik, irtifa","height, elevation, level","The plane flew at a high altitude."],
["alumnus","bitiruvchi, sobiq talaba","graduate, former student","He is an alumnus of Oxford."],
["ambiance","muhit, kayfiyat","atmosphere, mood, environment","The restaurant has a lovely ambiance."],
["ambiguity","noaniqlik, ikki xillik","vagueness, uncertainty, obscurity","Remove ambiguity from the contract."],
["ambulance","tez yordam mashinasi","emergency vehicle, rescue van","An ambulance arrived within minutes."],
["amendment","tuzatish, o'zgartirish","correction, modification, revision","The amendment was approved by parliament."],
["amity","do'stlik, tinchlik","friendship, peace, goodwill","The two nations live in amity."],
["amnesia","xotirasizlik, yod yo'qotish","memory loss, forgetfulness","He suffered from temporary amnesia."],
["ammunition","o'q-dori, dalil","bullets, weapons, evidence","They ran out of ammunition."],
["amphibian","amfibiya, suv-quruqlik hayvoni","frog, salamander, newt","Frogs are amphibians."],
["amphitheater","amfiteatr","arena, stadium, theater","The ancient amphitheater still stands."],
["ample","keng, mo'l","spacious, abundant, sufficient","The garden has ample space."],
["amplitude","amplituda, kenglik","range, magnitude, extent","The amplitude of the wave was measured."],
["amulet","tumor, tug'a","charm, talisman, lucky piece","She wore an amulet for protection."],
["analgesic","og'riq qoldiruvchi dori","painkiller, pain reliever","The doctor prescribed an analgesic."],
["anchor","langar, tayanch","support, base, secure","Trust is the anchor of relationships."],
["anecdotal","rivoyatga oid, tasdiqlangan emas","informal, unverified, personal","The evidence was anecdotal."],
["anesthetic","narkoz, og'riqsizlantiruvchi","painkiller, sedative, numbing agent","Local anesthetic was applied."],
["annex","ilova, qo'shimcha bino","extension, addition, wing","The hospital annex has 100 beds."],
["annotation","izoh, tushuntirish","note, comment, explanation","The annotations helped understand the text."],
["annuity","yillik to'lov, pensiya","pension, income, allowance","She receives an annuity from her investments."],
["antagonism","qarama-qarshilik, dushmanlik","hostility, opposition, conflict","There was growing antagonism between the groups."],
["ante","oldingi, avvalgi","before, prior, previous","The ante-war period was peaceful."],
["antenna","antenna, tutqich","aerial, receiver, feeler","The TV antenna picks up local channels."],
["anthology","she'riy to'plam, gulchin","collection, compilation, treasury","The anthology features emerging writers."],
["anthropology","antropologiya, odamshunoslik","study of humans, ethnology","She majored in anthropology."],
["antibody","antitana, himoya oqsili","immune protein, defense cell","Antibodies fight infections in the body."],
["antidote","tiryak, davo, yechim","cure, remedy, countermeasure","Kindness is an antidote to hatred."],
["antiquity","qadimiyat, qadimgi davrlar","ancient times, old age, past","Artifacts from antiquity were found."],
["antithesis","qarama-qarshilik, zidlik","opposite, contrast, reverse","Love is the antithesis of hate."],
["aperture","teshik, ochilish","opening, hole, gap","Light enters through the aperture."],
["aphorism","aforizm, hikmatli so'z","saying, maxim, proverb","He is known for his clever aphorisms."],
["aplomb","vazminlik, o'ziga ishonch","composure, confidence, poise","She performed with aplomb."],
["apocalypse","qiyomat, halokat","catastrophe, disaster, doomsday","The film depicts an apocalypse scenario."],
["apparatus","asbob-uskunalar, tizim","equipment, machinery, system","The laboratory apparatus was modern."],
["apparel","kiyim, libos","clothing, garments, attire","The store sells sports apparel."],
["apparition","sharpa, ruh","ghost, phantom, specter","She claimed to have seen an apparition."],
["appetite","ishtaha, xohish","hunger, desire, craving","Fresh air gives you a good appetite."],
["appliance","maishiy texnika, qurilma","device, machine, gadget","The kitchen has modern appliances."],
["applicant","ariza beruvchi, nomzod","candidate, contender, aspirant","Over 200 applicants applied for the position."],
["appoint","tayinlamoq, belgilamoq","assign, designate, nominate","She was appointed as the new director."],
["appraisal","ko'rib chiqish, baho","evaluation, assessment, review","A performance appraisal was conducted."],
["apprentice","shogird, o'rganuvchi","trainee, student, learner","She started as an apprentice baker."],
["arbitrary","asossiz, o'zboshimcha","random, subjective, unjustified","The penalty seemed arbitrary."],
["arbitration","hakamlik, arbitraj","mediation, settlement, judgment","The dispute was resolved through arbitration."],
["arboretum","daraxtlar bog'i","botanical garden, tree garden","The arboretum has 500 species of trees."],
["archipelago","orollar guruhi","island chain, island group","Japan is an archipelago."],
["archive","arxiv, saqlash joyi","record, repository, library","The national archive holds historical documents."],
["arena","arena, maydon","stadium, field, ring","The political arena is competitive."],
["aristocracy","zodagonlar tabaqasi","nobility, elite, gentry","The aristocracy ruled for centuries."],
["armament","qurollanish, qurol-yarog'","weapons, arms, munitions","Nuclear armament is a global concern."],
["armistice","sulh, otashkes","ceasefire, truce, peace","An armistice was signed in 1918."],
["aroma","xushbo'y hid, atir","scent, fragrance, smell","The aroma of fresh coffee filled the room."],
["array","qator, to'plam","collection, range, series","A vast array of products is available."],
["arson","qasddan o't qo'yish","fire-setting, incendiarism","The arson destroyed three buildings."],
["articulate","aniq gapiruvchi, ifodali","clear, eloquent, expressive","She is an articulate speaker."],
["ascetic","zohid, tarkidunyochi","austere, self-denying, monk-like","The ascetic monk lived simply."],
["aspiration","intilish, orzu-umid","ambition, hope, dream","Her aspiration to become president inspired many."],
["assailant","hujum qiluvchi","attacker, aggressor, assaulter","The assailant was identified."],
["assassinate","suiqasd qilmoq","murder, kill, eliminate","The president was assassinated."],
["assemble","yig'moq, to'plamoq","gather, collect, construct","Workers assembled the machine."],
["assessment","baholash, tekshirish","evaluation, appraisal, analysis","Risk assessment is crucial for safety."],
["asset","aktiv, mulk","resource, property, advantage","Her language skills are a great asset."],
["assimilate","o'zlashtirmoq, singdirmoq","absorb, integrate, adapt","Immigrants assimilate into new cultures."],
["assumption","taxmin, faraz","presumption, belief, supposition","The assumption proved incorrect."],
["assurance","ishonch, kafolat","guarantee, confidence, promise","She gave assurance that the work would be done."],
["asteroid","asteroid, kichik sayyora","space rock, meteoroid","An asteroid passed close to Earth."],
["asthma","astma, nafas qisilishi","breathing disorder, respiratory disease","Asthma affects millions of children."],
["asylum","boshpana, panoh joyi","refuge, shelter, sanctuary","Refugees sought asylum abroad."],
["atoll","atoll, halqasimon orol","coral island, reef island","The atoll is surrounded by clear water."],
["atrocity","dahshatli ish, vahshiylik","brutality, horror, cruelty","War atrocities must be prosecuted."],
["attain","erishmoq, qo'lga kiritmoq","achieve, reach, accomplish","She attained a high level of success."],
["attic","shiftxona, chortoq","loft, garret, upper room","Old furniture was stored in the attic."],
["attribute","xususiyat, sifat","quality, characteristic, property","Honesty is her best attribute."],
["auction","kim oshdi savdosi","sale, bidding, public sale","The painting was sold at auction."],
["audacious","jasur, qo'rqmas","bold, daring, fearless","The audacious plan worked perfectly."],
["audible","eshitiladigan","heard, perceptible, detectable","Her voice was barely audible."],
["audit","tekshiruv, taftish","review, examination, inspection","The annual audit revealed no issues."],
["aura","aura, kayfiyat","atmosphere, quality, vibe","The old library has a special aura."],
["auspice","homiylik, kafolat","patronage, sponsorship, support","Under the auspices of the UN."],
["authentic","haqiqiy, chinakam","genuine, real, original","The painting is authentic."],
["autobiography","tarjimai hol, o'zi haqida","memoir, life story, personal history","She wrote an autobiography at age 50."],
["autonomy","avtonom, mustaqillik","independence, self-governance","Regional autonomy was granted."],
["avalanche","qor ko'chkisi, to'satdan ko'p","snowslide, landslide, flood","An avalanche of complaints followed."],
["avarice","tamahkorlik, ochko'zlik","greed, cupidity, rapacity","His avarice knew no limits."],
["avenge","qasos olmoq, o'ch olmoq","revenge, retaliate, repay","She vowed to avenge her father."],
["avert","oldini olmoq, boshqa tomonga burmoq","prevent, avoid, deflect","Quick thinking averted the accident."],
["aviation","aviatsiya, uchish","flying, aeronautics, air travel","Aviation technology has advanced greatly."],
["avid","havasli, ishtiyoqli","keen, eager, enthusiastic","He is an avid reader of history."],
["awning","soyabon, ayvon","canopy, shade, cover","The awning protected us from the sun."],
["axiom","aksioma, umumiy haqiqat","truth, principle, maxim","It is an axiom that hard work pays off."],
["azure","ko'k rang, moviy","blue, sky-blue, cerulean","The azure sky was cloudless."],
["babble","g'o'ldiramoq, bema'ni gapirmoq","chatter, prattle, mumble","The baby babbled happily."],
["backbone","orqa miya, tayanch","spine, support, foundation","Tourism is the backbone of the island economy."],
["backlash","teskari ta'sir, qaytarish","reaction, repercussion, resistance","The policy caused a public backlash."],
["badge","nishon, belgi","emblem, symbol, insignia","She wore her university badge proudly."],
["baffle","gangitmoq, hayron qilmoq","confuse, puzzle, perplex","The mystery baffled investigators."],
["bailout","qutqaruv, moliyaviy yordam","rescue, aid, financial support","The bank received a government bailout."],
["bane","balo, yovuzlik","curse, plague, nuisance","Mosquitoes are the bane of summer."],
["baptism","cho'mdirish, initsiatsiya","christening, initiation, ceremony","It was his baptism of fire in business."],
["barometer","barometr, ko'rsatkich","indicator, gauge, measure","Consumer confidence is a barometer of the economy."],
["barracks","kazarma, harbiy turar joy","military housing, camp","Soldiers live in the barracks."],
["barren","hosil bermaydigan, bo'sh","infertile, empty, desolate","The barren land could not be farmed."],
["bastion","qal'a, tayanch nuqta","fortress, stronghold, citadel","The city was a bastion of freedom."],
["beacon","mayoq, yo'l ko'rsatuvchi","signal, guide, light","The lighthouse served as a beacon."],
["benevolence","saxovatlilik, yaxshilik","kindness, generosity, charity","His benevolence helped many families."],
["bewilder","gangitmoq, hayratga solmoq","confuse, puzzle, baffle","The complex instructions bewildered students."],
["bias","tarafkashlik, noto'g'ri yo'nalish","prejudice, partiality, favoritism","Avoid bias in scientific research."],
["bibliophile","kitobsevar","book lover, reader, bookworm","She is an avid bibliophile."],
["bilateral","ikki tomonlama","mutual, two-sided, reciprocal","A bilateral agreement was signed."],
["biodiversity","biologik xilma-xillik","species variety, ecological diversity","Biodiversity loss threatens ecosystems."],
["biome","biom, tabiiy zona","ecosystem, habitat, region","The tundra is a cold biome."],
["biosphere","biosfera, tiriklik muhiti","living world, ecosystem, nature","The biosphere supports all life."],
["bizarre","g'alati, ajoyib","strange, odd, weird","The story was quite bizarre."],
["bland","mazasiz, oddiy","tasteless, dull, mild","The food was bland."],
["blasphemy","kufr, haqorat","sacrilege, profanity, irreverence","Blasphemy is a serious offense in some countries."],
["blemish","dog', nuqson","flaw, defect, imperfection","The diamond had a small blemish."],
["bliss","baxt, saodаt","happiness, joy, ecstasy","She was in a state of pure bliss."],
["blizzard","bo'ron, qor bo'roni","snowstorm, tempest, gale","The blizzard closed all roads."],
["blockade","blokada, qamal","siege, embargo, barrier","The naval blockade prevented supplies."],
["blueprint","loyiha, reja","plan, design, scheme","The blueprint for the building was approved."],
["blunder","qo'pol xato","mistake, error, gaffe","The president's blunder made headlines."],
["blur","xiralashmoq, noaniq bo'lmoq","smear, obscure, cloud","The line between work and life has blurred."],
["boast","maqtanmoq, faxrlanmoq","brag, show off, crow","He boasted about his achievements."],
["bolster","mustahkamlash, qo'llab-quvvatlash","support, reinforce, strengthen","New data bolstered the argument."],
["bombard","bombardimon, yomg'irdek yog'dirmoq","attack, shell, assault","She was bombarded with questions."],
["bonanza","katta muvaffaqiyat, boylik","windfall, jackpot, fortune","The oil discovery was a bonanza."],
["bondage","qullik, qaramlik","slavery, captivity, servitude","They fought against bondage."],
["boon","ne'mat, rahmat","blessing, benefit, gift","Clean water is a boon to health."],
["bottleneck","tor joy, to'siq","obstacle, jam, blockage","The bridge is a bottleneck for traffic."],
["bounty","saxovatlilik, mukofot","generosity, reward, prize","Nature's bounty feeds the world."],
["bourgeois","burjua, o'rta tabaqа","middle class, conventional","Bourgeois values dominated society."],
["brevity","qisqalik, lo'ndalik","shortness, conciseness, terseness","Brevity is valued in academic writing."],
["brochure","buklet, kitobchа","pamphlet, leaflet, catalog","The travel brochure looked appealing."],
["broker","broker, vositachi","agent, dealer, intermediary","A real estate broker helped them find a home."],
["browse","ko'z yugurtirmoq, qarab chiqmoq","look through, scan, skim","She browsed the bookstore."],
["brunt","asosiy zarba","force, impact, burden","The coast bore the brunt of the storm."],
["buckle","taqalamoq, bukilmoq","fasten, bend, collapse","The bridge buckled under the weight."],
["budge","jilmoq, siljitmoq","move, shift, give way","The door would not budge."],
["buffer","tampon, himoyalovchi","cushion, barrier, shield","Parks serve as a buffer against noise."],
["bulge","bo'rtiq, shishmoq","swell, protrude, expand","The bag was bulging with books."],
["bully","bosqinchi, qo'rqitmoq","intimidate, harass, threaten","Bullying in schools is a serious problem."],
["buoyant","suzuvchi, xushchaqchaq","floating, cheerful, optimistic","The economy remains buoyant."],
["bureaucracy","byurokratiya, idorabozlik","administration, red tape, officialdom","Bureaucracy can hinder progress."],
["burgeon","tez o'smoq, rivoj topmoq","grow, flourish, expand","The industry is burgeoning."],
["buttress","tayanch, mustahkamlovchi","support, prop, reinforce","Evidence buttresses the theory."],
["bygone","o'tgan, eski","past, former, previous","Bygone traditions are still remembered."],
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
