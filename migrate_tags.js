const path = require('path');
const initSqlJs = require('sql.js');
const fs = require('fs');
const DB_PATH = path.join(__dirname, 'words.db');

// Topic mapping: keyword-based
const topicMap = {
    'Education': [
        'curriculum','enrollment','scholarship','tuition','literacy','pedagogy','syllabus','diploma',
        'dissertation','undergraduate','postgraduate','seminar','tutorial','compulsory','elective',
        'plagiarism','assignment','assessment','cognitive','proficiency','lecture','academic','academy',
        'apprentice','apprenticeship','qualification','graduate','faculty','semester','thesis',
        'bibliography','bibliophile','campus','dean','degree','doctoral','enroll','exam','examination',
        'homework','instructor','kindergarten','learn','lesson','mentor','pupil','quiz','scholar',
        'school','student','study','teach','teacher','textbook','university','vocational','educate',
        'education','intellectual','professor','studious','didactic','erudite','illiterate',
        'knowledgeable','learned','literate','novice','prodigy','savant','tutor','valedictorian'
    ],
    'Health': [
        'diagnosis','symptom','therapy','chronic','epidemic','pandemic','immune','nutrition','obesity',
        'prescription','surgery','vaccination','hygiene','rehabilitation','well-being','contagious',
        'sedentary','allergy','disorder','fatigue','antibiotics','artery','biopsy','carcinogen',
        'cardiovascular','clinical','congenital','dermatology','dosage','fracture','hemorrhage',
        'immunization','incubation','inflammation','injection','malignant','neurological','organ',
        'pharmaceutical','physician','prognosis','psychiatry','remedy','transplant','trauma','vaccine',
        'ailment','anatomy','bacteria','cell','cholesterol','dehydration','hormone','infection',
        'malfunction','malnourished','mental','medical','patient','physiological','psychology',
        'recuperate','sanitary','sterilize','stethoscope','surgical','therapeutic','treatment',
        'virus','wellness','wound','anesthetic','antidote','asthma','calorie','dietary','inoculate',
        'pathogen','toxin'
    ],
    'Environment': [
        'pollution','sustainability','biodiversity','conservation','deforestation','emission',
        'ecosystem','renewable','fossil','drought','habitat','recycle','greenhouse','endangered',
        'erosion','contaminate','extinction','atmosphere','carbon','ozone','climate','coastal',
        'desert','equator','glacier','iceberg','irrigation','landscape','meteorology','monsoon',
        'precipitation','reef','savanna','tundra','volcano','wetland','ecology','terrain',
        'topography','tropical','seismic','tsunami','waterfall','avalanche','delta','fjord',
        'peninsula','plateau','vegetation','archipelago','basin','canyon','crater','estuary',
        'hemisphere','highland','latitude','longitude','maritime','marsh','meadow','ocean',
        'oasis','polar','reservoir','ridge','strait','subtropical','summit','tidal','tributary',
        'valley','biome','biosphere','flora','fauna','degrade','pollutant','smog','toxic',
        'sustainable','organic','pesticide','fertilizer','arable','barren','arid','fertile',
        'harvest','horticulture','cultivate'
    ],
    'Technology': [
        'innovation','artificial','automation','bandwidth','cybersecurity','database','digital',
        'download','encrypt','hardware','interface','malware','obsolete','processor','software',
        'upgrade','wireless','algorithm','simulate','compatible','virtual','internet','online',
        'network','server','browser','application','byte','code','computing','data','debug',
        'device','electronic','email','fiber','gadget','gigabyte','hack','icon','java','keyboard',
        'laptop','microchip','module','nanotechnology','operating','pixel','program','quantum',
        'robot','satellite','semiconductor','silicon','smartphone','streaming','tech','telecoms',
        'upload','website','cloud','artificial intelligence','machine learning','biotechnology',
        'prototype','broadband','router','transistor','sensor','drone','genomics'
    ],
    'Society': [
        'inequality','poverty','discrimination','urbanization','immigration','diversity','democracy',
        'bureaucracy','corruption','globalization','ideology','legislation','migration','minority',
        'philanthropy','prejudice','referendum','unemployment','volunteer','welfare','civilian',
        'community','culture','demographic','domestic','ethnic','heritage','humanitarian',
        'indigenous','institution','liberal','mainstream','municipal','norm','secular','sovereign',
        'tradition','urban','stereotype','tolerance','assimilate','multicultural','patriot',
        'citizenship','census','diaspora','emancipate','egalitarian','segregation','activism',
        'advocacy','civil','constitutional','electorate','franchise','governance','liberty',
        'populace','republic','suffrage','regime','socialism','capitalism','communism',
        'conservative','progressive','radical','revolution','reform','protest','rally'
    ],
    'Business': [
        'acquisition','bankruptcy','boom','brokerage','capital','commerce','commodity','consumer',
        'corporation','deficit','depreciation','dividend','embargo','entrepreneur','equity',
        'expenditure','fiscal','franchise','gross','incentive','increment','inflation','inventory',
        'invoice','liability','liquidate','merger','monopoly','mortgage','overhead','procurement',
        'profitable','prospectus','quota','recession','reimburse','retail','revenue','shareholder',
        'solvent','subsidiary','surplus','tariff','transaction','turnover','venture','wholesale',
        'budget','asset','audit','bond','broker','cash','credit','currency','debt','deposit',
        'earnings','economy','export','finance','fund','import','income','interest','invest',
        'lease','loan','market','pension','profit','salary','stock','tax','trade','wage',
        'outsource','freelance','startup','downsizing','payroll','remuneration','stipend',
        'accountable','corporate','fiscal','lucrative','monetary','stakeholder'
    ],
    'Law': [
        'acquit','amnesty','ballot','cabinet','censor','charter','clemency','coerce','compliance',
        'confiscate','constituent','contempt','convict','decree','defamation','defendant','depose',
        'detention','diplomat','enact','exile','extradite','felony','governance','grievance',
        'immunity','impeach','impartial','inaugurate','indict','judiciary','jurisdiction','lawsuit',
        'legislature','litigation','lobby','mandate','mediator','ordinance','parole','partisan',
        'petition','plaintiff','plebiscite','precedent','prosecution','ratification','repeal',
        'sanction','sovereignty','statute','subpoena','tribunal','tyranny','unconstitutional',
        'verdict','veto','warrant','witness','bail','bribery','custody','embezzlement','extortion',
        'forensic','fraud','fugitive','homicide','incarcerate','inmate','juvenile','kidnapping',
        'larceny','offender','pardon','perpetrator','probation','recidivism','restitution',
        'sentence','surveillance','testimony','theft','vandalism','arson','assault','advocate',
        'attorney','barrister','clause','contract','copyright','crime','enforce','guilty',
        'innocent','judge','jury','justice','legal','legitimate','license','penalty','permit',
        'prohibit','prosecute','regulate','rights','rule','sue','trial','violate','law'
    ],
    'Science': [
        'acceleration','anomaly','apparatus','archaeology','astronomy','biochemistry','botany',
        'calibrate','catalyst','chromosome','clone','compound','condensation','correlation',
        'decompose','defect','density','dilute','dissect','dissolve','DNA','electrode','embryo',
        'enzyme','evaporation','evolution','experiment','extinct','formula','frequency','fungus',
        'gene','geology','gravity','hereditary','hybrid','hypothesis','incubate','infection',
        'insulate','isotope','kinetic','larva','magnitude','mammal','metabolism','microbe',
        'molecule','mutation','neuron','nucleus','nutrient','organism','oxide','parasite',
        'pathogen','phenomenon','photosynthesis','physiology','plankton','pollinate','predator',
        'prey','primate','probe','protein','radioactive','receptor','reproduce','respiration',
        'sediment','specimen','spectrum','stem cell','stimulus','strain','synthesis','taxonomy',
        'thermal','tissue','transplant','vaccine','variable','vertebrate','wavelength','zoology',
        'acid','atom','biology','cell','chemical','chemistry','cosmic','element','empirical',
        'energy','genome','laboratory','mineral','neutron','particle','physics','plasma',
        'quantum','radiation','reaction','research','theory','thermodynamics'
    ],
    'Arts': [
        'aesthetic','allegory','anthology','artifact','biography','calligraphy','canvas',
        'caricature','choreography','chronicle','comedy','compose','craft','curator','dialect',
        'documentary','eloquence','epic','excerpt','exhibition','fiction','folklore','gallery',
        'genre','icon','improvise','inscription','legend','literary','lyric','manuscript',
        'masterpiece','memoir','metaphor','monument','mural','mythology','ode','orchestra',
        'parable','patron','performance','playwright','portrait','pottery','prose','protagonist',
        'recital','renaissance','repertoire','rhetoric','satire','sculpture','sonnet','symphony',
        'tragedy','verse','virtuoso','narrative','drama','theatre','opera','ballet','cinema',
        'concert','conductor','ensemble','melody','premiere','rehearsal','rhythm','solo',
        'spectacle','spectator','venue','acoustic','applause','auditorium','ballad','celebrity',
        'lyrics','novel','poem','poetry','author','creative','design','painting','photography',
        'abstract','contemporary','classic','modern','traditional'
    ],
    'Psychology': [
        'addiction','adolescence','aggression','altruism','anxiety','attachment','behavior',
        'cognition','compulsion','conditioning','conformity','consciousness','delusion','depression',
        'deviance','disposition','ego','emotion','empathy','extrovert','hallucination','identity',
        'inhibition','instinct','intelligence','introvert','mentality','motive','narcissism',
        'neurosis','obsession','paranoia','perception','personality','phobia','psyche',
        'rationalize','resilience','subconscious','temperament','therapy','trait','trauma',
        'ambivalent','apathetic','assertive','cautious','compassionate','conscientious','cynical',
        'defiant','diligent','eccentric','empathetic','enthusiastic','gregarious','gullible',
        'hostile','humble','impulsive','indifferent','industrious','insightful','intolerant',
        'intuitive','jovial','meticulous','modest','naive','obstinate','optimistic','passionate',
        'pessimistic','pragmatic','resilient','sarcastic','sensitive','skeptical','spontaneous',
        'stubborn','sympathetic','tactful','tenacious','tolerant','versatile','vindictive',
        'vulnerable','witty','zealous','mood','stress','self-esteem','motivation','habit',
        'attitude','bias','stereotype','prejudice'
    ],
    'Travel': [
        'commute','congestion','cruise','destination','detour','embarkation','excursion',
        'expedition','freight','itinerary','locomotive','navigate','pedestrian','pilgrim',
        'souvenir','terminal','transit','turbulence','vessel','voyage','accommodation','airport',
        'boarding','customs','departure','luggage','passport','reservation','resort','route',
        'schedule','sightseeing','ticket','tourism','tourist','travel','visa','backpack',
        'hitchhike','hostel','jet lag','nomadic','safari','wander'
    ],
    'Food': [
        'agriculture','beverage','calorie','cereal','cuisine','cultivate','delicacy','dietary',
        'famine','ferment','fertilizer','flock','forage','grain','harvest','livestock',
        'malnourished','organic','pesticide','plantation','poultry','preservative','staple',
        'subsistence','supplement','vegetation','yield','appetite','bake','boil','brew','chef',
        'consume','cook','diet','feast','flavor','gourmet','ingredient','meal','menu','recipe',
        'roast','seasoning','spice','taste','vegan','vegetarian'
    ],
    'Architecture': [
        'apartment','architecture','basement','blueprint','demolition','dwelling','elevation',
        'facade','foundation','infrastructure','insulation','landlord','lease','loft','penthouse',
        'plumbing','premises','refurbish','renovation','residential','scaffold','skyscraper',
        'sprawl','structure','suburban','tenant','terrace','ventilation','building','ceiling',
        'column','concrete','corridor','design','dome','floor','framework','masonry','pillar',
        'roof','staircase','wall','window','construction','urban','rural'
    ],
    'Work': [
        'appraisal','autonomy','bonus','colleague','competence','contractual','delegation',
        'dismissal','downsizing','freelance','hierarchy','human resources','intern','internship',
        'layoff','morale','negotiate','outsource','overtime','payroll','pension','probation',
        'productivity','promotion','qualification','recruit','redundancy','remuneration',
        'resignation','resume','sabbatical','stipend','subordinate','supervise','tenure',
        'vacancy','vocational','workload','career','employ','employer','employee','interview',
        'job','manager','occupation','office','profession','retire','salary','skill','staff',
        'wage','workplace','deadline','efficiency','teamwork'
    ],
    'Crime': [
        'acquittal','arson','bail','burglary','embezzlement','espionage','extortion',
        'forensic','fugitive','homicide','incarcerate','inmate','kidnapping','larceny','offender',
        'perpetrator','recidivism','restitution','surveillance','vandalism','crime','criminal',
        'detective','evidence','gang','guilty','investigate','murder','police','prison','rob',
        'steal','suspect','victim','violence','abuse','assault','blackmail','conspiracy',
        'counterfeit','corrupt','delinquent','smuggle','trespass'
    ],
    'Communication': [
        'broadcast','bulletin','censorship','circulation','commentary','correspondence','coverage',
        'credibility','editorial','headline','journalism','newsletter','objectivity','podcast',
        'propaganda','sensation','slogan','subscription','tabloid','transparency','advertise',
        'announce','blog','communicate','debate','interview','media','news','newspaper',
        'press','publish','radio','report','social media','speech','television','website',
        'discourse','dialogue','eloquent','articulate','fluent','persuade','rhetoric'
    ],
    'Philosophy': [
        'altruism','autonomy','benevolence','conscience','contemplation','determinism','dilemma',
        'dogma','empiricism','epistemology','existentialism','hedonism','humanism','integrity',
        'metaphysics','morality','nihilism','objectivism','paradox','pragmatism','relativism',
        'skepticism','stoicism','subjectivism','utilitarianism','virtue','ethics','ethical',
        'doctrine','ideology','principle','rational','logic','reason','wisdom','belief',
        'axiom','fallacy','premise','thesis','hypothesis','abstract','concrete','subjective',
        'objective'
    ],
    'Language': [
        'accent','bilingual','colloquial','connotation','context','denotation','discourse',
        'etymology','euphemism','fluency','grammar','idiom','jargon','lexicon','linguistic',
        'metaphor','monolingual','multilingual','nuance','phonetics','pragmatics','proficiency',
        'semantics','simile','slang','syntax','terminology','vernacular','vocabulary','alphabet',
        'consonant','vowel','noun','verb','adjective','adverb','pronoun','preposition',
        'conjunction','clause','sentence','paragraph','essay','translate','interpret','dialect'
    ],
    'Mathematics': [
        'algebra','approximate','arithmetic','axis','calculate','circumference','coefficient',
        'correlation','decimal','diameter','equation','exponential','fraction','geometry','graph',
        'integer','logarithm','median','parallel','percentage','perimeter','perpendicular',
        'probability','proportion','radius','ratio','statistics','symmetry','tangent','theorem',
        'variable','velocity','vertex','volume','formula','infinite','magnitude','compute',
        'numeric','quantity','sum','total','average','maximum','minimum','prime','square'
    ],
    'Music': [
        'acoustic','applause','ballad','composer','concert','conductor','encore','ensemble',
        'lyrics','melody','premiere','rehearsal','rhythm','solo','symphony','theatrical',
        'venue','harmony','instrument','opera','orchestra','pitch','scale','tempo','tone',
        'tune','beat','chord','classical','jazz','genre','soundtrack','vocalist'
    ]
};

// Tag assignment rules based on word characteristics
// Speaking: everyday, conversational, phrasal verbs, emotions, common words
// Listening: everyday, common academic, phrasal verbs
// Reading: academic, formal, complex, rare words
// Writing: academic, formal, essay words, connectors

const speakingWords = new Set([
    // Phrasal verbs (all)
    'bring about','bring up','break down','break out','break through','call for','call off',
    'carry out','come about','come across','come up with','cut back','cut down','deal with',
    'die out','do away with','draw up','drop out','figure out','find out','get along','get over',
    'get rid of','give in','give up','go ahead','go through','hand in','hold back','keep up with',
    'lay off','look after','look forward to','look into','look up to','make up','pass away',
    'pick up','point out','put forward','put off','put up with','rule out','run out','set up',
    'stand for','take off','take on','take over','take up','turn down','turn out','work out',
    // Collocations
    'account for','adhere to','amount to','appeal to','apply for','approve of','arise from',
    'aspire to','attend to','attribute to','back up','bear in mind','benefit from','blow up',
    'boil down to','build on','catch on','cater to','come into effect','comply with','consist of',
    'contribute to','cope with','correspond to','count on','crack down on','depend on','derive from',
    'dispose of','distinguish between','draw on','dwell on','embark on','engage in','fall behind',
    'fall short of','focus on','give rise to','go against','impose on','inclined to','interfere with',
    'invest in','lead to','live up to','make do with','object to','opt for','originate from',
    'participate in','persist in','phase out','prevail over','prior to','prone to','provide for',
    'refrain from','regardless of','relate to','rely on','resort to','result from','result in',
    'run into','stem from','strive for','subject to','subscribe to','succeed in','suffer from',
    'sum up','switch to','take into account','tamper with','tend to','think of','turn to','ward off',
    // Emotions & personality
    'affectionate','aggressive','ambitious','anxious','arrogant','assertive','cautious',
    'compassionate','courageous','decisive','diligent','eccentric','empathetic','enthusiastic',
    'generous','genuine','gregarious','hostile','humble','impulsive','jovial','modest',
    'naive','obstinate','optimistic','passionate','patient','pessimistic','sensitive',
    'spontaneous','stubborn','sympathetic','tolerant','versatile','witty','zealous',
    // Common everyday
    'abandon','able','about','accept','achieve','act','add','admit','afford','agree','allow',
    'amazing','angry','appear','argue','arrive','ask','attempt','avoid','aware','basic',
    'beautiful','begin','believe','belong','benefit','born','bother','brave','bright','busy',
    'calm','capable','care','cause','certain','challenge','chance','change','cheap','choose',
    'claim','clear','close','collect','common','compare','complain','complete','concern',
    'confident','connect','consider','contain','continue','control','convenient','convince',
    'correct','create','curious','damage','danger','decide','demand','describe','despite',
    'develop','different','difficult','discover','discuss','earn','easy','effort','encourage',
    'enjoy','enough','essential','even','eventually','evidence','exactly','excellent','exchange',
    'exciting','expect','experience','explain','express','fail','familiar','famous','fear',
    'feel','finally','focus','follow','force','forget','fortunate','freedom','frequent','friend',
    'future','happen','happy','hard','hate','help','honest','hope','huge','idea','ignore',
    'imagine','immediate','important','improve','include','increase','influence','interest',
    'involve','issue','join','keen','kind','lack','likely','limit','manage','matter','mean',
    'mention','mind','miss','modern','natural','necessary','need','normal','notice','obvious',
    'offer','opinion','opportunity','option','own','particular','perhaps','personal','plan',
    'pleasant','plenty','popular','possible','prefer','prepare','present','prevent','probably',
    'problem','produce','promise','proper','protect','prove','provide','purpose','quality',
    'quick','quite','range','rather','reach','realize','reason','receive','recognize','recommend',
    'reduce','refuse','regard','relate','remember','remove','replace','require','responsible',
    'result','return','risk','role','save','seem','serious','share','simple','situation',
    'solution','sort','spend','strong','struggle','succeed','suffer','suggest','support',
    'suppose','sure','surprise','tend','terrible','tight','toward','trouble','trust','truth',
    'try','typical','understand','unfortunately','unless','until','unusual','upset','useful',
    'usual','various','whole','willing','wish','wonder','worry','worth'
]);

const writingWords = new Set([
    // Connectors & discourse markers
    'furthermore','moreover','nevertheless','nonetheless','notwithstanding','hence','thereby',
    'consequently','subsequently','conversely','alternatively','correspondingly','likewise',
    'similarly','accordingly','thus','therefore','however','although','whereas','whilst',
    'despite','contrary','forthcoming','hitherto','whereby','wherein','henceforth',
    // Formal/academic verbs
    'facilitate','implement','constitute','comprise','encompass','utilize','advocate',
    'demonstrate','illustrate','indicate','emphasize','acknowledge','assert','contend',
    'maintain','postulate','hypothesize','substantiate','corroborate','refute','elucidate',
    'delineate','enumerate','juxtapose','synthesize','analyze','evaluate','assess','examine',
    'investigate','conclude','deduce','infer','derive','attribute','allocate','distribute',
    'accumulate','aggregate','fluctuate','diminish','augment','enhance','exacerbate',
    'ameliorate','mitigate','alleviate','precipitate','culminate','instigate','propagate',
    'proliferate','perpetuate','undermine','reinforce','supplement','complement','supersede',
    // Academic nouns
    'phenomenon','paradigm','methodology','framework','infrastructure','criterion','criteria',
    'hypothesis','thesis','premise','discourse','rhetoric','ideology','hierarchy','bureaucracy',
    'demographic','statistic','parameter','variable','component','dimension','perspective',
    'implication','ramification','repercussion','correlation','discrepancy','disparity',
    'ambiguity','anomaly','paradox','dilemma','consensus','controversy','contention',
    'assertion','assumption','conception','notion','perception','interpretation','rationale',
    // Academic adjectives
    'fundamental','integral','inherent','intrinsic','empirical','theoretical','conceptual',
    'comprehensive','explicit','implicit','predominant','prevalent','pertinent','relevant',
    'subsequent','concurrent','preliminary','provisional','tentative','definitive','conclusive',
    'substantial','considerable','significant','negligible','marginal','pivotal','crucial',
    'paramount','indispensable','feasible','viable','plausible','tangible','abstract',
    'arbitrary','ambiguous','coherent','consistent','rigid','flexible','dynamic','static',
    'volatile','robust','subtle','profound','superficial','mundane','novel','conventional'
]);

const readingWords = new Set([
    // All writing words are also reading words (added below)
    // Plus complex/rare vocabulary
    'aberration','abjure','abnegation','abrogate','abscond','abstinence','accolade','acerbic',
    'acquiesce','acrimonious','acumen','adamant','admonition','adroit','adulation','aegis',
    'affidavit','affluent','aggrandize','alacrity','albeit','allegory','allusion','amalgamate',
    'ambivalence','ameliorate','amiable','amnesia','analogous','anecdotal','animosity','anomalous',
    'antagonist','antecedent','antipathy','apathy','aplomb','appease','apposite','apprehension',
    'aptitude','arbiter','archaic','ardent','arduous','aristocratic','ascendancy','ascetic',
    'aspiration','assiduous','astound','atrocity','attenuate','audacious','auspicious','austere',
    'authoritarian','avarice','aversion','bellicose','benevolent','benign','brazen','burgeon',
    'buttress','cabal','cadence','calamity','callous','calumny','capitulate','caprice','carnage',
    'caveat','cerebral','charlatan','chimera','circumscribe','circumspect','circumvent',
    'clandestine','clemency','cogent','collusion','commensurate','compendium','complacent',
    'complicit','composure','concoct','condescend','confluence','congenial','conjecture',
    'connive','connoisseur','consecrate','consequential','construe','consummate','contentious',
    'contiguous','contrite','conundrum','convalescence','convivial','copious','cordial',
    'corroborate','cosmopolitan','countenance','covert','covet','craven','credence','crescendo',
    'cryptic','culpable','cumbersome','cursory','dearth','debacle','debilitate','debunk',
    'decadent','decorum','defamatory','deft','defunct','degenerate','deleterious','delineate',
    'delude','deluge','demarcation','demise','demure','denizen','deplorable','deprecate',
    'derelict','deride','derogatory','desolate','despot','dexterous','diabolical','dichotomy',
    'diffuse','digress','dilapidated','din','dire','disconcert','discord','disdain','disenchant',
    'disgruntled','disparage','disparity','disposition','disproportionate','disseminate','dissent',
    'dissipate','dissuade','diverge','divest','docile','dogmatic','doldrums','dormant','draconian',
    'dubious','dwindle','ebullient','edify','efface','efficacy','effusive','egregious','elicit',
    'eloquent','elucidate','elusive','emanate','embellish','embroil','eminent','endemic',
    'engender','enigma','enmity','enshroud','entice','entrench','envisage','ephemeral',
    'epitome','equitable','erratic','erudite','espouse','estrange','exacerbate','exalt',
    'exonerate','expedient','exponential','expropriate','exquisite','extant','extenuating',
    'extravagant','exuberant','fabricate','facet','faction','fallacy','fallible','feign',
    'felicity','ferocious','fervent','festive','fetid','fickle','figurative','flagrant',
    'fleeting','foible','foment','formidable','forthright','foster','frugal','futile',
    'galvanize','garner','germane','germinate','glib','gregarious','groundbreaking','grudge',
    'gullible','hamper','harness','havoc','hegemony','heinous','heresy','hermit','heuristic',
    'hiatus','holistic','homage','homogeneous','ignite','illuminate','immaculate','immerse',
    'imminent','impair','impasse','impeccable','impede','impetus','implausible','implore',
    'impostor','impoverish','impunity','incapacitate','incessant','incidental','incite',
    'incompatible','inconclusive','indelible','indemnity','induce','indulge','inept','inert',
    'infamous','ingenious','innocuous','insatiable','insidious','insinuate','insipid',
    'insolvent','instigate','intermittent','intrepid','intricate','intrigue','intrinsic',
    'introspection','inundate','invariably','invoke','irate','ironic','irreconcilable',
    'irreparable','irreversible','jubilant','judicious','juxtapose','kindle','kinship',
    'laborious','labyrinth','lackluster','lament','latent','laudable','lavish','lenient',
    'lethal','leverage','liaison','linger','loophole','lucid','luminous','lure','magnate',
    'meager','menace','mercenary','meticulous','microcosm','militant','myriad','nascent',
    'negate','negligent','nepotism','niche','nocturnal','nominal','nonchalant','nostalgia',
    'noxious','nullify','oblivious','obscure','obstruct','omnipresent','onset','opaque',
    'opportune','opulent','orchestrate','ordeal','orthodox','ostensible','ostentatious',
    'oust','outweigh','overt','pacify','painstaking','palatable','palpable','panacea',
    'paramount','pecuniary','pedestrian','peril','periphery','permeate','perpetrate',
    'perplexing','persecute','persevere','pervasive','pinnacle','pious','pivotal','placate',
    'plausible','plethora','plight','poignant','polarize','polemic','ponder','portray',
    'posterity','potent','precaution','precipitate','preclude','predecessor','predicament',
    'preeminent','prerequisite','preoccupation','prevalent','procrastinate','prodigious',
    'profound','proliferate','prolific','prolong','proponent','propriety','provenance',
    'provoke','proximity','prudent','pseudonym','purport','ramification','rampant','rationale',
    'realm','rebuke','reconcile','relegate','relinquish','remorse','renounce','repeal',
    'repercussion','replenish','replicate','repository','repression','reproach','repudiate',
    'requisite','rescind','resent','residual','retaliate','retract','retrospect','revere',
    'revive','revoke','rudimentary','rupture','ruthless','sabotage','sacred','sacrifice',
    'sacrosanct','sagacious','sanction','saturate','scrutinize','semblance','serene','shrewd',
    'simultaneous','slump','soar','solace','solidarity','solitary','sophisticated','speculate',
    'stagnant','steadfast','stringent','subjective','succinct','succumb','superfluous',
    'supersede','surmount','susceptible','symbiotic','synthesize','systematic','tacit',
    'tenacious','tentative','transcend','transgress','transient','tumultuous','ubiquitous',
    'unilateral','unprecedented','usurp','vacillate','vanquish','vehement','venerate',
    'verbose','vindicate','vivid','volatile','wane','wary'
]);

async function migrate() {
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(buffer);

    // Get all words
    const rows = db.exec('SELECT id, english FROM words');
    if (rows.length === 0) { console.log('No words found'); return; }

    const words = rows[0].values; // [[id, english], ...]

    // Build reverse lookup: word -> topic
    const wordToTopic = {};
    for (const [topic, wordList] of Object.entries(topicMap)) {
        for (const w of wordList) {
            wordToTopic[w.toLowerCase()] = topic;
        }
    }

    let topicUpdated = 0;
    let tagUpdated = 0;

    for (const [id, english] of words) {
        const eng = (english || '').toLowerCase().trim();

        // Assign topic
        const topic = wordToTopic[eng] || '';

        // Assign tags
        const tags = [];

        // Reading: academic/complex words + all writing words
        if (readingWords.has(eng) || writingWords.has(eng)) {
            tags.push('reading');
        }

        // Writing: formal/academic
        if (writingWords.has(eng)) {
            tags.push('writing');
        }

        // Speaking: conversational, common
        if (speakingWords.has(eng)) {
            tags.push('speaking');
        }

        // Listening: same as speaking mostly
        if (speakingWords.has(eng)) {
            tags.push('listening');
        }

        // If no tags assigned, assign based on topic
        if (tags.length === 0) {
            // Academic words default to reading,writing
            // Check if it's likely academic (not a super common word)
            if (eng.length > 6) {
                tags.push('reading', 'writing');
            } else {
                tags.push('reading', 'speaking', 'listening');
            }
        }

        const tagStr = [...new Set(tags)].join(',');

        if (topic || tagStr) {
            db.run('UPDATE words SET topic = ?, tags = ? WHERE id = ?', [topic, tagStr, id]);
            if (topic) topicUpdated++;
            tagUpdated++;
        }
    }

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));

    console.log(`Jami: ${words.length} ta so'z`);
    console.log(`Topic biriktirildi: ${topicUpdated} ta`);
    console.log(`Tag biriktirildi: ${tagUpdated} ta`);

    // Stats
    const topicStats = db.exec("SELECT topic, COUNT(*) FROM words WHERE topic != '' GROUP BY topic ORDER BY COUNT(*) DESC");
    if (topicStats.length > 0) {
        console.log('\nTopic statistikasi:');
        topicStats[0].values.forEach(([t, c]) => console.log(`  ${t}: ${c}`));
    }

    const tagStats = db.exec("SELECT 'speaking' as tag, COUNT(*) FROM words WHERE tags LIKE '%speaking%' UNION ALL SELECT 'listening', COUNT(*) FROM words WHERE tags LIKE '%listening%' UNION ALL SELECT 'reading', COUNT(*) FROM words WHERE tags LIKE '%reading%' UNION ALL SELECT 'writing', COUNT(*) FROM words WHERE tags LIKE '%writing%'");
    if (tagStats.length > 0) {
        console.log('\nTag statistikasi:');
        tagStats[0].values.forEach(([t, c]) => console.log(`  ${t}: ${c}`));
    }

    db.close();
}

migrate().catch(console.error);
