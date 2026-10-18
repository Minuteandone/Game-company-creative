/* Original narrative content by agent-01 (AI agent). No dependencies. */
(function (global) {
  "use strict";
  const WEATHER = Object.freeze({
    rain: Object.freeze({ label: "Rain", glyph: "☂", code: "R-01", hint: "Feeds the roof gardens; slows the harbor.", delta: Object.freeze({ gardens: 2, harbor: -1, lanterns: 0 }) }),
    sun: Object.freeze({ label: "Sun", glyph: "☀", code: "S-02", hint: "Charges the lantern archive; dries the gardens.", delta: Object.freeze({ gardens: -1, harbor: 0, lanterns: 2 }) }),
    wind: Object.freeze({ label: "Wind", glyph: "➶", code: "W-03", hint: "Carries the ferries; dims the lanterns.", delta: Object.freeze({ gardens: 0, harbor: 2, lanterns: -1 }) })
  });
  const DAYS = Object.freeze([
    {
      title: "The first blank square",
      intro: "The sky has been quiet for nineteen days. Three brass stamps wait beside the ledger. Outside, the whole town is waiting for a verb.",
      letters: [
        { from: "Jun • rooftop gardener", text: "The pear saplings have little white tags tied to their wrists. I gave them all names. They are getting too dry to answer." },
        { from: "Hal • ferry captain", text: "There's a parcel of medicine across the inlet. My boat can sail if the air remembers how to move." }
      ],
      outcomes: {
        rain: { title: "Names written in water", text: "Jun puts bowls beneath the leaves, and the saplings sound like applause. Hal watches the medicine parcel through the mist; the ferry cannot cross today." },
        sun: { title: "A room turns gold", text: "The old light-archive wakes up and projects a map onto its ceiling. Jun cups the dry soil in both hands. Hal sorts his ropes while he waits." },
        wind: { title: "The first crossing", text: "Hal's sail opens like a letter. By noon the parcel has crossed the inlet. Jun ties the saplings tighter against the gusts; the light-archive flickers." }
      }
    },
    {
      title: "A place to keep yesterday",
      intro: "The town's archive has one room of glass lanterns. Each lantern holds a voice someone was afraid to forget. Without enough light, their stories stay asleep.",
      letters: [
        { from: "Mira • keeper of the lanterns", text: "I promised a child she could hear her grandfather's laugh again. I don't have enough light to turn the lantern on." },
        { from: "Jun • rooftop gardener", text: "My seeds are pretending to sleep. Can you send them a reason to wake? A little water will do." }
      ],
      outcomes: {
        rain: { title: "The roof makes music", text: "Water drums on Jun's window ledge; thin green lines appear in her seed trays. Mira tells the child a story from memory, though she cannot play the voice." },
        sun: { title: "A laugh through glass", text: "The archive's walls bloom with voices. One child hears a laugh like a squeaky gate and grins. Jun starts collecting dew by hand." },
        wind: { title: "Letters with no stamps", text: "The ferry carries recordings from the outer docks. Mira acquires a new voice but cannot yet play it. In the gardens, paper seed labels flutter free." }
      }
    },
    {
      title: "Someone is almost home",
      intro: "A postcard arrives without a signature: 'If the harbor opens, I'll come back.' It is dated eleven years ago. No one knows who wrote it.",
      letters: [
        { from: "Hal • ferry captain", text: "There's a passenger at the far quay holding a red suitcase. They've been waiting through two dawns." },
        { from: "Mira • keeper of the lanterns", text: "One of the oldest lanterns holds a song about a red suitcase. I think the song knows who is coming." }
      ],
      outcomes: {
        rain: { title: "A return postponed", text: "The ferry stays tethered. Jun shelters the stranded passenger's postcard in a glass jar; its ink begins to run, but the address survives." },
        sun: { title: "A name in the song", text: "Mira plays the old song. It names a missing cartographer called Ilen. Across the inlet, someone with a red suitcase looks toward the bright window." },
        wind: { title: "The red suitcase", text: "The ferry arrives with a cartographer named Ilen. Nobody asks why it took eleven years. They clear a chair at the harbor table instead." }
      }
    },
    {
      title: "A map of ordinary miracles",
      intro: "A map of Hushport begins circulating. Instead of roads, it marks the places where somebody made room for somebody else. No one agrees who drew the first line.",
      letters: [
        { from: "Wren • kite-maker", text: "If you lend us wind, I can fly notes above the harbor. Every house could see a message meant for them." }
      ],
      outcomes: {
        rain: { title: "The map grows roots", text: "Jun turns the rooftop paths into a public garden. The map fills with tiny green constellations where strangers have shared umbrellas." },
        sun: { title: "The map glows", text: "Mira projects the town's map on the archive wall. For the first time, the town sees itself from the inside, outlined in ordinary kindnesses." },
        wind: { title: "A sky full of handwriting", text: "Wren's kites cross the inlet carrying notes in every color. Their strings become roads on a map that keeps changing." }
      }
    },
    {
      title: "The night of names",
      intro: "Tonight Hushport will gather on the quay. Not to celebrate perfect weather; it has never had that. To read aloud the names of everyone who kept the town going.",
      letters: [
        { from: "Mira • keeper of the lanterns", text: "A little sun would light the names we've saved. If we can't, we'll speak them. Either way, I will be there." },
        { from: "Hal • ferry captain", text: "People from across the inlet want to join us. If the wind comes, I'll bring them. If not, tell them we saved a place." },
        { from: "Jun • rooftop gardener", text: "I can bring the youngest pear tree to the quay. It grew crooked. So did we." }
      ],
      outcomes: {
        rain: { title: "A gathering beneath umbrellas", text: "Every umbrella opens at once, an uneven field of bright circles. Jun sets a small pear tree in the center. The names carry through the rainfall." },
        sun: { title: "The lantern evening", text: "Mira's glass lanterns turn the quay into a floating constellation. Faces and names shine against the harbor wall. Nobody has to remember alone." },
        wind: { title: "The harbor comes together", text: "The ferries arrive with lanterns tied to their rails, and Wren's kites carry the names overhead. The town makes room for one more boat." }
      }
    }
  ]);
  // Day four responds to whether Ilen physically returned on day three.
  const DAY4_ENTRIES = Object.freeze({
    rain: {
      intro: "The ferry has not brought Ilen home. Jun begins a map anyway, drawing the places where somebody made room for somebody else.",
      letter: { from: "Jun • rooftop gardener", text: "I drew a little map on a seed packet. It doesn't show roads. It shows every door I can knock on when somebody needs help." }
    },
    sun: {
      intro: "Mira finds an unfinished map behind an old lantern recording. The handwriting may belong to Ilen, still waiting across the inlet.",
      letter: { from: "Mira • keeper of the lanterns", text: "I think the map has room for everybody's story, even the people who haven't found their way back yet." }
    },
    wind: {
      intro: "Ilen is home. The returned cartographer begins drawing a map of Hushport, marking favors and reunions instead of roads.",
      letter: { from: "Ilen • returned cartographer", text: "Maps usually show how to get somewhere. Mine will show why anybody would want to." }
    }
  });
  const EPILOGUES = Object.freeze({
    balanced: { title: "A forecast made of neighbors", text: "The garden, harbor, and archive endure together. Hushport stops asking for perfect weather. Instead, people begin asking which neighbors need help carrying tomorrow." },
    gardens: { title: "The city with roots in its roof", text: "Jun's pear trees grow above the chimneys. Even on dry days, neighbors pass buckets from door to door. Neighbors mark every new garden on the town map." },
    harbor: { title: "The city that learned to arrive", text: "The ferries keep the inlet stitched together. People return, parcels find their owners, and an empty chair at the harbor table becomes a local tradition." },
    lanterns: { title: "The city of borrowed voices", text: "Mira opens the archive after sunset. People bring their memories and borrow one another's light. The old stories stop being locked behind glass." }
  });
  // A small number of delayed consequences; all selected from the previous days' resource totals.
  // The source tells the player which prior forecast choice to reconsider.
  const CALLBACKS = Object.freeze({
    gardens: {
      low: { from: "Jun • second morning", text: "I brought my seed trays to the office. Most are still bare. I will ask the neighbors for spare soil before I give up on them." },
      high: { from: "Jun • second morning", text: "The pear cutting took. I brought its first green branch to the quay so the waiting passengers could see something growing." }
    },
    harbor: {
      low: { from: "Hal • third morning", text: "I have written every stranded passenger's name on the quay board. We are delivering food across the inlet by hand where we can." },
      high: { from: "Hal • third morning", text: "One of the travelers finally crossed. They carried a letter for Mira: a voice she thought was lost still remembers the way home." }
    },
    lanterns: {
      low: { from: "Mira • fourth morning", text: "The glass was too dim to play the recording, so I sat with Jun and wrote the old song down from memory. It belongs to us even without light." },
      high: { from: "Mira • fourth morning", text: "An archive lantern played the red-suitcase song. Hal stopped on the archive steps to listen beside Mira." }
    },
    festival: {
      gardens: { from: "Jun • preparing the festival", text: "The rooftop beds need extra hands, so I am bringing empty pots to the quay. People can take a cutting and help the garden grow tomorrow." },
      harbor: { from: "Hal • preparing the festival", text: "Some neighbors cannot cross tonight. I will read their names into the harbor radio, and Wren will carry their replies back on paper kites." },
      lanterns: { from: "Mira • preparing the festival", text: "The archive cannot carry every voice tonight. I have asked everyone to bring one story they can tell aloud; we will keep the circle open." }
    }
  });
  global.BW_STORY = Object.freeze({ WEATHER, DAYS, DAY4_ENTRIES, EPILOGUES, CALLBACKS });
})(globalThis);
