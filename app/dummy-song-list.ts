interface Artist {
  id?: string;
  name: string;
}

interface Song {
  id?: string;
  title: string;
  artist: Artist;
  content: string; // Represents lyrics of the song
  external: {
    id: string; // Unique identifier for the external resource
    url: string; // URL to the sheet music or other external resource
    source: string; // Name of the source providing the external resource
  };
}

export const dummySongList: Song[] = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    artist: { id: "1", name: "Queen" },
    content: "Is this the real life? Is this just fantasy?", // Example lyrics
    external: {
      id: "ext1",
      url: "https://www.sheetsource.com/queen/bohemian-rhapsody",
      source: "SheetSource",
    },
  },
  {
    id: "2",
    title: "Imagine",
    artist: { id: "2", name: "John Lennon" },
    content: "Imagine all the people living life in peace...", // Example lyrics
    external: {
      id: "ext2",
      url: "https://www.sheetsource.com/john-lennon/imagine",
      source: "SheetSource",
    },
  },
  {
    id: "3",
    title: "Billie Jean",
    artist: { id: "3", name: "Michael Jackson" },
    content: "Billie Jean is not my lover, she's just a girl...", // Example lyrics
    external: {
      id: "ext3",
      url: "https://www.sheetsource.com/michael-jackson/billie-jean",
      source: "SheetSource",
    },
  },
  {
    id: "4",
    title: "Like a Rolling Stone",
    artist: { id: "4", name: "Bob Dylan" },
    content: "How does it feel, to be on your own?", // Example lyrics
    external: {
      id: "ext4",
      url: "https://www.sheetsource.com/bob-dylan/like-a-rolling-stone",
      source: "SheetSource",
    },
  },
  {
    id: "5",
    title: "Smells Like Teen Spirit",
    artist: { id: "5", name: "Nirvana" },
    content: "Here we are now, entertain us...", // Example lyrics
    external: {
      id: "ext5",
      url: "https://www.sheetsource.com/nirvana/smells-like-teen-spirit",
      source: "SheetSource",
    },
  },
  {
    id: "6",
    title: "Hey Jude",
    artist: { id: "6", name: "The Beatles" },
    content: "Hey Jude, don't make it bad...", // Example lyrics
    external: {
      id: "ext6",
      url: "https://www.sheetsource.com/the-beatles/hey-jude",
      source: "SheetSource",
    },
  },
  {
    id: "7",
    title: "Purple Rain",
    artist: { id: "7", name: "Prince" },
    content: "I never meant to cause you any sorrow...", // Example lyrics
    external: {
      id: "ext7",
      url: "https://www.sheetsource.com/prince/purple-rain",
      source: "SheetSource",
    },
  },
  {
    id: "8",
    title: "Stairway to Heaven",
    artist: { id: "8", name: "Led Zeppelin" },
    content: "And she's buying a stairway to heaven...", // Example lyrics
    external: {
      id: "ext8",
      url: "https://www.sheetsource.com/led-zeppelin/stairway-to-heaven",
      source: "SheetSource",
    },
  },
  {
    id: "9",
    title: "What's Going On",
    artist: { id: "9", name: "Marvin Gaye" },
    content: "Mother, mother, there's too many of you crying...", // Example lyrics
    external: {
      id: "ext9",
      url: "https://www.sheetsource.com/marvin-gaye/whats-going-on",
      source: "SheetSource",
    },
  },
  {
    id: "10",
    title: "Respect",
    artist: { id: "10", name: "Aretha Franklin" },
    content: "R-E-S-P-E-C-T, find out what it means to me...", // Example lyrics
    external: {
      id: "ext10",
      url: "https://www.sheetsource.com/aretha-franklin/respect",
      source: "SheetSource",
    },
  },
  {
    id: "11",
    title: "Hotel California",
    artist: { id: "11", name: "Eagles" },
    content: "Welcome to the Hotel California...", // Example lyrics
    external: {
      id: "ext11",
      url: "https://www.sheetsource.com/eagles/hotel-california",
      source: "SheetSource",
    },
  },
  {
    id: "12",
    title: "Good Vibrations",
    artist: { id: "12", name: "The Beach Boys" },
    content: "Good, good vibrations...", // Example lyrics
    external: {
      id: "ext12",
      url: "https://www.sheetsource.com/the-beach-boys/good-vibrations",
      source: "SheetSource",
    },
  },
  {
    id: "13",
    title: "Johnny B. Goode",
    artist: { id: "13", name: "Chuck Berry" },
    content: "Go Johnny go, go...", // Example lyrics
    external: {
      id: "ext13",
      url: "https://www.sheetsource.com/chuck-berry/johnny-b-goode",
      source: "SheetSource",
    },
  },
  {
    id: "14",
    title: "Superstition",
    artist: { id: "14", name: "Stevie Wonder" },
    content: "Very superstitious, writing's on the wall...", // Example lyrics
    external: {
      id: "ext14",
      url: "https://www.sheetsource.com/stevie-wonder/superstition",
      source: "SheetSource",
    },
  },
  {
    id: "15",
    title: "No Woman, No Cry",
    artist: { id: "15", name: "Bob Marley" },
    content: "No woman, no cry...", // Example lyrics
    external: {
      id: "ext15",
      url: "https://www.sheetsource.com/bob-marley/no-woman-no-cry",
      source: "SheetSource",
    },
  },
  {
    id: "16",
    title: "Sweet Child O' Mine",
    artist: { id: "16", name: "Guns N' Roses" },
    content: "She's got a smile that it seems to me...", // Example lyrics
    external: {
      id: "ext16",
      url: "https://www.sheetsource.com/guns-n-roses/sweet-child-o-mine",
      source: "SheetSource",
    },
  },
  {
    id: "17",
    title: "Yesterday",
    artist: { id: "6", name: "The Beatles" },
    content: "Yesterday, all my troubles seemed so far away...", // Example lyrics
    external: {
      id: "ext17",
      url: "https://www.sheetsource.com/the-beatles/yesterday",
      source: "SheetSource",
    },
  },
  {
    id: "18",
    title: "Hallelujah",
    artist: { id: "17", name: "Leonard Cohen" },
    content: "Hallelujah, Hallelujah...", // Example lyrics
    external: {
      id: "ext18",
      url: "https://www.sheetsource.com/leonard-cohen/hallelujah",
      source: "SheetSource",
    },
  },
  {
    id: "19",
    title: "Wonderwall",
    artist: { id: "18", name: "Oasis" },
    content: "Because maybe, you're gonna be the one that saves me...", // Example lyrics
    external: {
      id: "ext19",
      url: "https://www.sheetsource.com/oasis/wonderwall",
      source: "SheetSource",
    },
  },
  {
    id: "20",
    title: "Let It Be",
    artist: { id: "6", name: "The Beatles" },
    content: "Let it be, let it be...", // Example lyrics
    external: {
      id: "ext20",
      url: "https://www.sheetsource.com/the-beatles/let-it-be",
      source: "SheetSource",
    },
  },
  {
    id: "21",
    title: "Every Breath You Take",
    artist: { id: "19", name: "The Police" },
    content: "Every breath you take, every move you make...", // Example lyrics
    external: {
      id: "ext21",
      url: "https://www.sheetsource.com/the-police/every-breath-you-take",
      source: "SheetSource",
    },
  },
  {
    id: "22",
    title: "Losing My Religion",
    artist: { id: "20", name: "R.E.M." },
    content: "That's me in the corner, that's me in the spotlight...", // Example lyrics
    external: {
      id: "ext22",
      url: "https://www.sheetsource.com/rem/losing-my-religion",
      source: "SheetSource",
    },
  },
  {
    id: "23",
    title: "Hotel California",
    artist: { id: "11", name: "Eagles" },
    content: "Such a lovely place, such a lovely face...", // Example lyrics
    external: {
      id: "ext23",
      url: "https://www.sheetsource.com/eagles/hotel-california",
      source: "SheetSource",
    },
  },
  {
    id: "24",
    title: "Born to Run",
    artist: { id: "21", name: "Bruce Springsteen" },
    content: "Tramps like us, baby we were born to run...", // Example lyrics
    external: {
      id: "ext24",
      url: "https://www.sheetsource.com/bruce-springsteen/born-to-run",
      source: "SheetSource",
    },
  },
  {
    id: "25",
    title: "Light My Fire",
    artist: { id: "22", name: "The Doors" },
    content: "Come on baby, light my fire...", // Example lyrics
    external: {
      id: "ext25",
      url: "https://www.sheetsource.com/the-doors/light-my-fire",
      source: "SheetSource",
    },
  },
  {
    id: "26",
    title: "Wish You Were Here",
    artist: { id: "23", name: "Pink Floyd" },
    content: "How I wish, how I wish you were here...", // Example lyrics
    external: {
      id: "ext26",
      url: "https://www.sheetsource.com/pink-floyd/wish-you-were-here",
      source: "SheetSource",
    },
  },
  {
    id: "27",
    title: "Bridge Over Troubled Water",
    artist: { id: "24", name: "Simon & Garfunkel" },
    content: "Like a bridge over troubled water, I will lay me down...", // Example lyrics
    external: {
      id: "ext27",
      url: "https://www.sheetsource.com/simon-garfunkel/bridge-over-troubled-water",
      source: "SheetSource",
    },
  },
  {
    id: "28",
    title: "Hotel California",
    artist: { id: "11", name: "Eagles" },
    content: "You can check out any time you like, but you can never leave...", // Example lyrics
    external: {
      id: "ext28",
      url: "https://www.sheetsource.com/eagles/hotel-california",
      source: "SheetSource",
    },
  },
  {
    id: "29",
    title: "God Only Knows",
    artist: { id: "12", name: "The Beach Boys" },
    content: "God only knows what I'd be without you...", // Example lyrics
    external: {
      id: "ext29",
      url: "https://www.sheetsource.com/the-beach-boys/god-only-knows",
      source: "SheetSource",
    },
  },
  {
    id: "30",
    title: "Roxanne",
    artist: { id: "19", name: "The Police" },
    content: "Roxanne, you don't have to put on the red light...", // Example lyrics
    external: {
      id: "ext30",
      url: "https://www.sheetsource.com/the-police/roxanne",
      source: "SheetSource",
    },
  },
  {
    id: "31",
    title: "Sweet Home Alabama",
    artist: { id: "25", name: "Lynyrd Skynyrd" },
    content: "Sweet home Alabama, where the skies are so blue...", // Example lyrics
    external: {
      id: "ext31",
      url: "https://www.sheetsource.com/lynyrd-skynyrd/sweet-home-alabama",
      source: "SheetSource",
    },
  },
  {
    id: "32",
    title: "Under Pressure",
    artist: { id: "1", name: "Queen & David Bowie" },
    content: "Pressure pushing down on me, pressing down on you...", // Example lyrics
    external: {
      id: "ext32",
      url: "https://www.sheetsource.com/queen/under-pressure",
      source: "SheetSource",
    },
  },
  {
    id: "33",
    title: "I Still Haven't Found What I'm Looking For",
    artist: { id: "26", name: "U2" },
    content: "But I still haven't found what I'm looking for...", // Example lyrics
    external: {
      id: "ext33",
      url: "https://www.sheetsource.com/u2/i-still-havent-found-what-im-looking-for",
      source: "SheetSource",
    },
  },
  {
    id: "34",
    title: "Back in Black",
    artist: { id: "27", name: "AC/DC" },
    content: "Back in black, I hit the sack...", // Example lyrics
    external: {
      id: "ext34",
      url: "https://www.sheetsource.com/ac-dc/back-in-black",
      source: "SheetSource",
    },
  },
  {
    id: "35",
    title: "Livin' on a Prayer",
    artist: { id: "28", name: "Bon Jovi" },
    content: "Whoa, we're halfway there...", // Example lyrics
    external: {
      id: "ext35",
      url: "https://www.sheetsource.com/bon-jovi/livin-on-a-prayer",
      source: "SheetSource",
    },
  },
  {
    id: "36",
    title: "Sweet Caroline",
    artist: { id: "29", name: "Neil Diamond" },
    content: "Sweet Caroline, good times never seemed so good...", // Example lyrics
    external: {
      id: "ext36",
      url: "https://www.sheetsource.com/neil-diamond/sweet-caroline",
      source: "SheetSource",
    },
  },
  {
    id: "37",
    title: "We Will Rock You",
    artist: { id: "1", name: "Queen" },
    content: "We will, we will rock you...", // Example lyrics
    external: {
      id: "ext37",
      url: "https://www.sheetsource.com/queen/we-will-rock-you",
      source: "SheetSource",
    },
  },
  {
    id: "38",
    title: "American Pie",
    artist: { id: "30", name: "Don McLean" },
    content: "Bye, bye Miss American Pie...", // Example lyrics
    external: {
      id: "ext38",
      url: "https://www.sheetsource.com/don-mclean/american-pie",
      source: "SheetSource",
    },
  },
  {
    id: "39",
    title: "Heroes",
    artist: { id: "31", name: "David Bowie" },
    content: "We can be heroes, just for one day...", // Example lyrics
    external: {
      id: "ext39",
      url: "https://www.sheetsource.com/david-bowie/heroes",
      source: "SheetSource",
    },
  },
  {
    id: "40",
    title: "Tiny Dancer",
    artist: { id: "32", name: "Elton John" },
    content: "Hold me closer, tiny dancer...", // Example lyrics
    external: {
      id: "ext40",
      url: "https://www.sheetsource.com/elton-john/tiny-dancer",
      source: "SheetSource",
    },
  },
];
