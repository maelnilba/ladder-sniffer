const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { v4: uuidv4 } = require("uuid");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(proccess.env.SPID, proccess.env.SPTK);
puppeteer.use(StealthPlugin());
const MODE_TEST = false;
const Cyrilic = [
  "Р",
  "С",
  "Т",
  "У",
  "Ф",
  "Х",
  "Ц",
  "Ч",
  "Ш",
  "Щ",
  "Ь",
  "Ю",
  "Я",
  "а",
  "б",
  "в",
  "г",
  "ґ",
  "д",
  "е",
  "є",
  "ж",
  "з",
  "и",
  "і",
  "ї",
  "й",
  "к",
  "л",
  "м",
  "н",
  "о",
  "п",
  "р",
  "с",
  "т",
  "у",
  "ф",
  "х",
  "ц",
  "ч",
  "ш",
  "щ",
  "ь",
  "ю",
  "я",
];

const UTF = [
  "	",
  "!",
  '"',
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  ",",
  ".",
  "/",
  "0",
  "1",
  "2",
  "3",
  ".",
  "4",
  "5",
  "T",
  "6",
  "7",
  "8",
  "V",
  "W",
  "9",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "L",
  "N",
  "O",
];

var browser = null;
(async () => {
  browser = await puppeteer.launch({ headless: true });
  console.log("browser is running....");
})();

function func(input) {
  process.send("Hello " + input);
}

process.on("message", async function (m) {
  try {
    await LaunchC(m);
  } catch (e) {
    console.log(e, "Error in procress.on");
  }
});

const LaunchC = async (Queue) => {
  try {
    await readQueue(Queue, browser);
  } catch (e) {
    console.log(e, "Error in LaunchC");
  }
};

const getElo = async (browser, uid, type, p = null) => {
  let pseudo = p;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 800 });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.resourceType() !== "document") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setDefaultNavigationTimeout(10000);

    if (type === 1) {
      const URL =
        "https://www.dofus.com/fr/mmorpg/communaute/annuaires/pages-persos/";
      await page.goto(URL + uid + "-snif");
      let pageTitle = await page.title();
      if (pageTitle == "Attention Required! | Cloudflare") {
        process.send("CLOUDFLARE404");
        await page.waitForTimeout(70000);
        await page.goto(URL + uid + "-snif");
        await page.waitForTimeout(1000);
        process.send("CLOUDFLARE200");
      }
      let texts = await page.evaluate(() => {
        let data = [];
        let elements = document.getElementsByClassName("ak-total-kolizeum");
        for (var element of elements) data.push(element.textContent);
        return data;
      });

      let server = await page.evaluate(() => {
        let data = [];
        let elements = document.getElementsByClassName(
          "ak-directories-server-name"
        );
        for (var element of elements) data.push(element.textContent);
        return data;
      });
      if (!server) {
        server = ["unknow", "null"];
      }
      let elo = 0;
      if (texts[0] != undefined) {
        let elotxt = texts[0].split(":")[1];
        elo = elotxt.replace(/ /g, "");
      } else {
        elo = 0;
      }
      await page.close();
      return [Number(elo), server[0]];
    } else if (type === 3) {
      if (!checkIfAllowedPseudo(pseudo)) {
        pseudo = convertCyrlicToUTF(pseudo);
      }
      const URL =
        "https://www.dofus.com/fr/mmorpg/communaute/ladder/kolizeum?type=duel&level=&name=";
      await page.goto(URL + capitalizeFirstLetter(pseudo));
      let pageTitle = await page.title();
      if (pageTitle == "Attention Required! | Cloudflare") {
        process.send("CLOUDFLARE404");
        await page.waitForTimeout(70000);
        await page.goto(URL + capitalizeFirstLetter(pseudo));
        await page.waitForTimeout(1000);
        process.send("CLOUDFLARE200");
      }
      let data = await page.evaluate(() => {
        let inHTML = [];
        let elements = document.querySelectorAll("tbody > tr");
        for (var element of elements) inHTML.push(element.innerHTML);
        return inHTML;
      });
      let elo = 0;
      let server = "null";
      for (e of data) {
        if (e.includes(uid)) {
          elo = e.split("<td>").pop().split("</td>")[0];
          server = e
            .match(/>(.*?)</g)[10]
            .substring(1, e.match(/>(.*?)</g)[10].length - 1);
        }
      }
      await page.close();
      return [Number(elo), server];
    }
  } catch (e) {
    console.log(e, "Error in getElo");
    return [0, null];
  }
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function checkIfAllowedPseudo(pseudo) {
  let p = pseudo.replace(/-/g, "");
  if (!/[^a-zA-Z]/.test(p)) {
    return true;
  } else {
    return false;
  }
}

function convertCyrlicToUTF(text) {
  let res = "";
  let arr = Array.from(text);
  for (let k = 0; k < arr.length; k++) {
    let kn = UTF.indexOf(arr[k]);
    if (kn != -1) {
      res = res + Cyrilic[kn];
    }
  }

  return res;
}

const readQueue = async (Q, browser) => {
  try {
    for (let i = 0; i < Q.length; i++) {
      let match = Q[i];
      let type = getMatchType(match);
      let m_uuid = uuidv4();

      for (let n = 0; n < match.attackers.length; n++) {
        if (match.attackers[n].level > 199) {
          let [playerElo, server] = await getElo(
            browser,
            match.attackers[n].uid,
            type,
            match.attackers[n]._name
          );
          match.attackers[n] = {
            ...match.attackers[n],
            elo: playerElo,
            server,
          };
        } else {
          match.attackers[n] = {
            ...match.attackers[n],
            elo: 0,
            server: null,
          };
        }
      }

      for (let n = 0; n < match.defenders.length; n++) {
        if (match.defenders[n].level > 199) {
          let [playerElo, server] = await getElo(
            browser,
            match.defenders[n].uid,
            type,
            match.defenders[n]._name
          );
          match.defenders[n] = {
            ...match.defenders[n],
            elo: playerElo,
            server,
          };
        } else {
          match.defenders[n] = {
            ...match.defenders[n],
            elo: 0,
            server: null,
          };
        }
      }
      match = { ...match, type, m_uuid };
      try {
        if (!MODE_TEST) {
          await savePlayerData(match);
          await saveMatchData(match);
        }
      } catch (e) {
        console.log(e, "Error in readQueue, saving data", match);
      }
    }
  } catch (e) {
    console.log(e, "Error in readQueue");
  }
};

const getMatchType = ({ attackers, defenders }) => {
  if (attackers.length === 3 || defenders.length === 3) {
    return 1;
  } else if (attackers.length === 1 || defenders.length === 1) {
    return 3;
  }
  return 0;
};

const saveMatchData = async (match) => {
  const { attackers, defenders, type, time } = match;
  if (type == 1) {
    let matche = {
      id: uuidv4(),
      players1: Number(attackers[0].uid),
      players2: Number(attackers[1].uid),
      players3: Number(attackers[2].uid),
      players4: Number(defenders[0].uid),
      players5: Number(defenders[1].uid),
      players6: Number(defenders[2].uid),
      cote1: [attackers[0].elo, attackers[1].elo, attackers[2].elo],
      cote2: [defenders[0].elo, defenders[1].elo, defenders[2].elo],
      time: time ?? 0,
    };
    const { data, error } = await supabase.from("matchs_3v3").insert([matche]);
    if (error) {
      console.log(error);
    }
  } else if (type == 3) {
    let matche = {
      id: uuidv4(),
      players1: Number(attackers[0].uid),
      players2: Number(defenders[0].uid),
      cote1: attackers[0].elo,
      cote2: defenders[0].elo,
      time: time ?? 0,
    };
    const { data, error } = await supabase.from("matchs_1v1").insert([matche]);
    if (error) {
      console.log(error);
    }
  }
};

const savePlayerData = async (match) => {
  for (let n = 0; n < match.defenders.length; n++) {
    let { uid, level, breed, _name, elo, server } = match.defenders[n];
    let player = {};
    if (match.type == 1) {
      if (Number(elo) > 20) {
        player = {
          id: Number(uid),
          cote_3v3: Number(elo),
          pseudo: _name,
          serveur: server,
          classe: Number(breed),
          level: Number(level),
        };
      } else {
        if (server) {
          player = {
            id: Number(uid),
            pseudo: _name,
            serveur: server,
            classe: Number(breed),
            level: Number(level),
          };
        } else {
          player = {
            id: Number(uid),
            pseudo: _name,
            classe: Number(breed),
            level: Number(level),
          };
        }
      }
    } else if (match.type == 3) {
      if (Number(elo) > 20) {
        player = {
          id: Number(uid),
          cote_1v1: Number(elo),
          pseudo: _name,
          serveur: server,
          classe: Number(breed),
          level: Number(level),
        };
      } else {
        if (server) {
          player = {
            id: Number(uid),
            pseudo: _name,
            serveur: server,
            classe: Number(breed),
            level: Number(level),
          };
        } else {
          player = {
            id: Number(uid),
            pseudo: _name,
            classe: Number(breed),
            level: Number(level),
          };
        }
      }
    }
    const { data, error } = await supabase.from("players").upsert(player);
    if (error) {
      console.log(error);
    }
  }
  for (let n = 0; n < match.attackers.length; n++) {
    let { uid, level, breed, _name, elo, server } = match.attackers[n];
    let player = {};
    if (match.type == 1) {
      if (Number(elo) > 20) {
        player = {
          id: Number(uid),
          cote_3v3: Number(elo),
          pseudo: _name,
          serveur: server,
          classe: Number(breed),
          level: Number(level),
        };
      } else {
        if (server) {
          player = {
            id: Number(uid),
            pseudo: _name,
            serveur: server,
            classe: Number(breed),
            level: Number(level),
          };
        } else {
          player = {
            id: Number(uid),
            pseudo: _name,
            classe: Number(breed),
            level: Number(level),
          };
        }
      }
    } else if (match.type == 3) {
      if (Number(elo) > 20) {
        player = {
          id: Number(uid),
          cote_1v1: Number(elo),
          pseudo: _name,
          serveur: server,
          classe: Number(breed),
          level: Number(level),
        };
      } else {
        if (server) {
          player = {
            id: Number(uid),
            pseudo: _name,
            serveur: server,
            classe: Number(breed),
            level: Number(level),
          };
        } else {
          player = {
            id: Number(uid),
            pseudo: _name,
            classe: Number(breed),
            level: Number(level),
          };
        }
      }
    }
    const { data, error } = await supabase.from("players").upsert(player);
    if (error) {
      console.log(error);
    }
  }
};
