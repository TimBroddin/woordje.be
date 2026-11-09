"use client";

// Anonymous identity: a random secret token (lets you rejoin a room after a
// refresh) and a display name, both kept in localStorage.
const TOKEN_KEY = "woordje-mp-token";
const NAME_KEY = "woordje-mp-name";
const LENGTH_KEY = "woordje-mp-length";

const ADJECTIVES = [
  "Snelle",
  "Slimme",
  "Dappere",
  "Vrolijke",
  "Stille",
  "Wijze",
  "Gekke",
  "Sluwe",
  "Lieve",
  "Stoere",
  "Brave",
  "Kleine",
];
const ANIMALS = [
  "Egel",
  "Vos",
  "Uil",
  "Das",
  "Mol",
  "Kat",
  "Otter",
  "Mus",
  "Bever",
  "Haas",
  "Panda",
  "Pinguïn",
  "Eekhoorn",
  "Kikker",
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const randomName = () => `${pick(ADJECTIVES)} ${pick(ANIMALS)}`.slice(0, 16);

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode etc: identity just won't survive a reload
  }
};

let memoryToken = null;
export function getToken() {
  let token = read(TOKEN_KEY) || memoryToken;
  if (!token) {
    // getRandomValues also works on plain http (LAN testing), randomUUID doesn't
    token = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    write(TOKEN_KEY, token);
  }
  memoryToken = token;
  return token;
}

export function getName() {
  let name = read(NAME_KEY);
  if (!name) {
    name = randomName();
    write(NAME_KEY, name);
  }
  return name;
}

export const saveName = (name) => write(NAME_KEY, name);

export function getPreferredLength() {
  const len = parseInt(read(LENGTH_KEY));
  return len >= 3 && len <= 10 ? len : 5;
}
export const savePreferredLength = (len) => write(LENGTH_KEY, String(len));


const PRESENCE_KEY = "woordje-mp-presence";
let memoryPresence = null;
/** Anonymous id for the "x online" count. Not the room token: that one stays secret. */
export function getPresenceId() {
  let id = read(PRESENCE_KEY) || memoryPresence;
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    write(PRESENCE_KEY, id);
  }
  memoryPresence = id;
  return id;
}
