// Initialize Firebase Admin App
let admin = require("firebase-admin");
let serviceAccount = require("../../../../../lendr-3e47b-firebase-adminsdk-ixt8q-5e56898fa2.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const usersToCreate = [
  {displayName: "Joe Momma", email: "joemomma@gmail.com", password: "amogus"},
  {displayName: "Hugh Jasper", email: "hughjasper@gmail.com", password: "amogus"},
  {displayName: "Candice Richards", email: "joemomma@gmail.com", password: "amogus"},
  {displayName: "Benjamin Dover", email: "joemomma@gmail.com", password: "amogus"},
  {displayName: "Wendy Nutts", email: "joemomma@gmail.com", password: "amogus"},
  {displayName: "Michael Hawk", email: "joemomma@gmail.com", password: "amogus"},
];

const toolsToCreate = [
  {
    preferences: {localPickup: false, delivery: false, useOnSite: false},
    visibility: 'draft',
    rate: {price: 25, timeUnit: 'day'},
    imageUrls: [],
    lenderUid: 'VQQngHQBeEP8h56uZ0zge9Eb4Ik1',
    location: {
      latitude: 43.8237743,
      geohash: '9xb923y5bx',
      longitude: -111.7776217,
    },
    holderUid: 'VQQngHQBeEP8h56uZ0zge9Eb4Ik1',
    name: 'Ayo',
    description: 'Duh uh',
  },
  {
    lenderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    location: {
      latitude: 43.82382353401531,
      geohash: '9xb923vur0',
      longitude: -111.7776913516126,
    },
    holderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    preferences: {localPickup: false, delivery: false, useOnSite: true},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FEkT03fIic85l2Hgx9rZP%2Fimg_0?alt=media&token=0e9e1c5a-b2e1-415c-8a61-5e0e04976e6c',
    ],
    rate: {timeUnit: 'hour', price: 69},
    name: 'Nice Cock',
    description: 'This mf fly as hell',
    visibility: 'published',
    brand: 'Tyson',
  },
  {
    visibility: 'published',
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FHoH245gfqbW6c2mAb8hh%2Fimg_0?alt=media&token=05e8e9cd-ae7c-47e2-ad87-e5b1fab2de6b',
    ],
    name: 'Tile Cutter',
    lenderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    description: 'This will cut your tiles. Guaranteed. How does it work, you ask? (I’m) Ben(jamin) Dover and I’ll show ya. ',
    location: {
      latitude: 43.82377584821227,
      geohash: '9xb923vgzr',
      longitude: -111.7776767681288,
    },
    holderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    brand: 'DeWalt',
    preferences: {localPickup: true, useOnSite: false, delivery: true},
    rate: {price: 32, timeUnit: 'week'},
  },
  {
    preferences: {localPickup: true, delivery: false, useOnSite: false},
    visibility: 'published',
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FJ47SwFBmrgaBBPd8dwQH%2Fimg_0?alt=media&token=a0044845-9eb7-4e50-8752-f34af7aabbd7',
    ],
    lenderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    name: 'Ladder',
    description: 'It’s a giant ladder. What more do you want from me ⁉️',
    location: {
      latitude: 43.82377357682729,
      geohash: '9xb923vgzx',
      longitude: -111.77766027065609,
    },
    brand: 'Giant',
    holderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    rate: {timeUnit: 'week', price: 29},
  },
  {
    preferences: {localPickup: true, delivery: false, useOnSite: true},
    visibility: 'published',
    rate: {price: 16, timeUnit: 'day'},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FKYXIkhioGwGdJqU3yYWv%2Fimg_0?alt=media&token=c36e6ef4-4494-4b21-8a4c-055d144bb30c',
    ],
    lenderUid: 'B2ulJyjmsPUaCOTdcIMxJxUUKoi2',
    name: 'Floor Jack',
    description: 'Where did this come from? Harbor Freight?',
    location: {
      geohash: '9xb923vuj6',
      latitude: 43.82379138525453,
      longitude: -111.77775648932368,
    },
    holderUid: 'B2ulJyjmsPUaCOTdcIMxJxUUKoi2',
    brand: 'Pittsburgh',
  },
  {
    lenderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    location: {
      latitude: 43.81475092650235,
      geohash: '9xb9221pkj',
      longitude: -111.78434231199525,
    },
    holderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    preferences: {useOnSite: false, localPickup: true, delivery: true},
    visibility: 'published',
    rate: {price: 28, timeUnit: 'week'},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FMMkAUZsjBFrbla8y0KX3%2Fimg_0?alt=media&token=0a040aea-1f64-419b-ba9e-d37da342cbeb',
    ],
    name: 'Sawzall ',
    brand: 'DeWalt',
    description: 'It sawz all’s',
  },
  {
    preferences: {localPickup: true, delivery: false, useOnSite: true},
    visibility: 'published',
    rate: {price: 33, timeUnit: 'day'},
    name: 'Compound Miter Saw',
    description: 'This right here is the best miter saw ya ever done seen. It’ll take your fingers right off. OSHA’s worst nightmare. ',
    brand: 'Ryobi ',
  },
  {
    preferences: {localPickup: true, delivery: true, useOnSite: false},
    visibility: 'published',
    rate: {price: 12, timeUnit: 'day'},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FPAxTxRtAwmXbhEx2eM4h%2Fimg_0?alt=media&token=76ea2150-123a-432b-8bca-632425327b1a',
    ],
    lenderUid: '1AWMpyyzTfXnDMGOu4R360qdmSL2',
    name: 'Circular Saw',
    description: 'Corded, not cordless. Stole this from my dad don’t tell him 🤫',
    location: {
      latitude: 43.82378460514541,
      geohash: '9xb923vup3',
      longitude: -111.7776727777617,
    },
    holderUid: '1AWMpyyzTfXnDMGOu4R360qdmSL2',
  },
  {
    visibility: 'published',
    rate: {price: 10, timeUnit: 'day'},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FYQ8wVSHRmKd5C2fkL0p0%2Fimg_0?alt=media&token=ebf9ad6f-d43f-47e8-9aed-ff2b49cf75c7',
    ],
    lenderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    name: 'Drill',
    description: 'Get drilled son',
    location: {
      latitude: 43.823790362029165,
      geohash: '9xb923vup6',
      longitude: -111.77767364367863,
    },
    holderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    brand: 'Ridgid',
    preferences: {delivery: true, useOnSite: false, localPickup: true},
  },
  {
    preferences: {localPickup: true, delivery: false, useOnSite: true},
    visibility: 'published',
    rate: {price: 33, timeUnit: 'week'},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FaNKWhPM947yVp1ShcYBy%2Fimg_0?alt=media&token=55d97899-4491-4951-b599-ce2fb520f07b',
    ],
    lenderUid: '1AWMpyyzTfXnDMGOu4R360qdmSL2',
    name: 'Router',
    description: 'Not the networking kind! I have a bunch of bits too just bring them back not broken pls thx 🙏 ',
    location: {
      geohash: '9xb923vgze',
      latitude: 43.82375337287918,
      longitude: -111.77766401200654,
    },
    holderUid: '1AWMpyyzTfXnDMGOu4R360qdmSL2',
  },
  {
    preferences: {localPickup: false, delivery: false, useOnSite: true},
    visibility: 'published',
    rate: {price: 14, timeUnit: 'hour'},
    lenderUid: '1AWMpyyzTfXnDMGOu4R360qdmSL2',
    name: 'Lathe',
    description: 'This thing is like 120 years old. No idea who made it or where it came from but it works great. They just don’t make ‘em like they used to 😮‍💨',
    location: {
      latitude: 43.82375337287918,
      geohash: '9xb923vgze',
      longitude: -111.77766401200654,
    },
    holderUid: '1AWMpyyzTfXnDMGOu4R360qdmSL2',
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FbyZLfyg35nV7tq151iY0%2Fimg_0?alt=media&token=23a10dff-7eb0-42d9-8459-b560e3592893',
    ],
  },
  {
    preferences: {localPickup: true, delivery: true, useOnSite: true},
    visibility: 'published',
    rate: {price: 15, timeUnit: 'week'},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FoAZtfF7LesBd3e8M83SA%2Fimg_0?alt=media&token=ee4f6660-f765-46e2-986e-cf3ba67cdb97',
    ],
    lenderUid: '8vmY84LGS9hyfT3zZAqFZwakvQg1',
    name: 'Hedge trimmer',
    description: 'I was in electrical the whole time I swear',
    location: {
      geohash: '9xb923vung',
      latitude: 43.82379471208456,
      longitude: -111.77769799205268,
    },
    holderUid: '8vmY84LGS9hyfT3zZAqFZwakvQg1',
  },
  {
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2FvbHWSA5HJe9jjWezn6OS%2Fimg_0?alt=media&token=a3f6f5ab-4b4f-4018-8bb6-6df8f8a22d07',
    ],
    lenderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    location: {
      latitude: 43.81462785574658,
      geohash: '9xb9220y8n',
      longitude: -111.78485293060422,
    },
    holderUid: '6DdLnZ6jtMP8VT8OCqr1EXAasd02',
    preferences: {localPickup: false, delivery: false, useOnSite: true},
    visibility: 'published',
    rate: {price: 25, timeUnit: 'hour'},
    name: 'MIATATATATATATA',
    description: 'Mia’a',
  },
  {
    preferences: {localPickup: true, delivery: false, useOnSite: false},
    visibility: 'published',
    rate: {price: 30, timeUnit: 'week'},
    imageUrls: [
      'https://firebasestorage.googleapis.com/v0/b/lendr-3e47b.appspot.com/o/toolImages%2Fw5qAzNQa54ngwVZcK9eh%2Fimg_0?alt=media&token=803ba6c0-0277-4bb8-8b27-d988e5edb8f2',
    ],
    lenderUid: 'B2ulJyjmsPUaCOTdcIMxJxUUKoi2',
    name: 'Engine lift',
    description: 'Can pull the Miata right off the motor ',
    location: {
      latitude: 43.82379413136575,
      geohash: '9xb923vune',
      longitude: -111.77771176662223,
    },
    holderUid: 'B2ulJyjmsPUaCOTdcIMxJxUUKoi2',
  },
];


const generateAuthUsers = () => {

};

// export async function getAllTools(): Promise<ITool[]> {
//   const querySnapshot = await admin.firestore().collection("tools").get();
//   let tools: ITool[] = [];
//   querySnapshot.forEach(doc => tools.push({
//     ...doc.data(),
//   } as ITool));
//   return tools;
// }
//
// getAllTools().then((tools) => {
//   for (let tool of tools) {
//     console.log(tool);
//   }
// })
