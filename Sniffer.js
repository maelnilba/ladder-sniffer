const Cap = require("cap").Cap;
const decoders = require("cap").decoders;
const anyBase = require("any-base");
const ByteArray = require("bytearray-node");
const { Endian } = require("bytearray-node/enums/");
var robot = require("robotjs");
const fs = require("fs");
const exec = require("child_process").execFile;
var kill = require("tree-kill");
var processWindows = require("node-process-windows");
const fork = require("child_process").fork;
const { createClient } = require("@supabase/supabase-js");
var scrapper1v1 = fork(__dirname + "/Scrapper.js");
var scrapper3v3 = fork(__dirname + "/Scrapper.js");

var CLOUDFLARE = false;
scrapper1v1.on("message", function (response) {
  if (response == "CLOUDFLARE404") {
    CLOUDFLARE = true;
  }
});
scrapper3v3.on("message", function (response) {
  if (response == "CLOUDFLARE200") {
    CLOUDFLARE = false;
  }
});

const supabase = createClient(proccess.env.SPID, proccess.env.SPTK);

const getMapRunningFightListMessage = async () => {
  const { data, error } = await supabase
    .from("messageTypes")
    .select("id")
    .eq("name", "MapRunningFightListMessage");
  return data[0].id;
};

const getMapRunningFightDetailsMessage = async () => {
  const { data, error } = await supabase
    .from("messageTypes")
    .select("id")
    .eq("name", "MapRunningFightDetailsMessage");
  return data[0].id;
};

const getExchangeRequestedTradeMessage = async () => {
  const { data, error } = await supabase
    .from("messageTypes")
    .select("id")
    .eq("name", "MapRunningFightDetailsMessage");
  return data[0].id;
};

const getWarningMessages = async () => {
  const { data, error } = await supabase
    .from("messageTypes")
    .select("id")
    .eq("status", "warning");
  let msgs = [];
  for (let i = 0; i < data.length; i++) {
    msgs.push(data[i].id);
  }
  return msgs;
};

var MapRunningFightListMessage = 0; //getMapRunningFightListMessage();
var MapRunningFightDetailsMessage = 0; //getMapRunningFightDetailsMessage();
var ExchangeRequestedTradeMessage = 0;
var WarningMessages = [];
(async () => {
  MapRunningFightListMessage = await getMapRunningFightListMessage();
})();
(async () => {
  MapRunningFightDetailsMessage = await getMapRunningFightDetailsMessage();
})();
(async () => {
  ExchangeRequestedTradeMessage = await geExchangeRequestedTradeMessage();
})();
(async () => {
  WarningMessages = await getWarningMessages();
})();

const saveWarningLog = (id) => {
  let d = new Date();
  fs.appendFile(
    "warningLog.txt",
    `${id} ${d.getHours()}:${d.getMinutes()}`,
    function (err) {
      if (err) throw err;
    }
  );
};
const MY_IP = "192.168.1.14";
// const MY_IP = "192.168.1.16"; -- MINI_PC
var dofusPath = "../Dofus/Dofus.exe";
var isSwitching = false;
var matchQueue1v1 = [];
var matchQueue3v3 = [];
var last_id = null;
var fightListPacket = "";
var fightListLenght = 0;
var fightDatalen = 0;
var fightList = {};
var dofusWindows = [];
var loginToken = process.env.LOGINSINFOS;

var specPos = {
  x: 105,
  y: 65,
};
var specFirstLinePos = {
  x: 1000,
  y: 160,
};

var specLastLinePos = {
  x: 1000,
  y: 160,
};

var leaveFightPos = {
  x: 1000,
  y: 160,
};

var findKoloPos = {
  x: 1000,
  y: 160,
};

const warningHour = [2, 5, 8, 10, 13, 15, 18, 21, 23];
const warningHM = {
  2: 15,
  5: 45,
  8: 15,
  10: 45,
  13: 15,
  15: 45,
  18: 15,
  21: 45,
  23: 45,
};

var AccountNDC = "";
var AccountPWD = "";

const getNewAccount = () => {
  let hasNewAccount = false;
  while (!hasNewAccount) {
    let rnd = Math.floor(Math.random() * loginToken.length);
    let nNDC = loginToken[rnd].ndc;
    let nPWD = loginToken[rnd].pwd;

    if (nNDC !== AccountNDC && nPWD !== AccountPWD) {
      AccountNDC = nNDC;
      AccountPWD = nPWD;
      hasNewAccount = true;
    }
  }
};

const timeToSwitch = async () => {
  let d = new Date();
  let h = d.getHours();
  if (warningHour.includes(h)) {
    let m = d.getMinutes();
    if (m == warningHM[h]) {
      OpenNewDofus();
    } else if (m == warningHM[h] + 2) {
      ReSwitchToLogin();
    } else if (m == warningHM[h] + 4) {
      SwitchToNewDofus();
    } else if (m < warningHM[h] - 3 && m > warningHM[h] + 8) {
      DoRandomAction();
    }
  } else {
    DoRandomAction();
  }
};

const DoRandomAction = () => {
  // specLastKolo();
  let actionId = Math.floor(Math.random() * (100 - 1 + 1) + 1);
  if (actionId > 0 && actionId <= 20) {
    openMap();
  } else if (actionId > 20 && actionId <= 40) {
    openSocial();
  } else if (actionId > 40 && actionId <= 55) {
    openBak();
  } else if (actionId > 55 && actionId <= 65) {
    specLastKolo();
  } else if (actionId > 65 && actionId <= 75) {
    // openKoloAndSearch();
  } else if (actionId > 75 && actionId <= 90) {
    DoRandomMouseMove();
  } else {
  }
};
const openSocial = () => {
  robot.typeString("f");
  setTimeout(function () {
    robot.keyTap("f");
    robot.moveMouseSmooth(specLastLinePos.x, specLastLinePos.y);
    robot.mouseClick();
  }, Math.floor(Math.random() * (5000 - 4000 + 1) + 4000));
};

const openMap = () => {
  robot.typeString("m");
  setTimeout(function () {
    robot.keyTap("m");
    robot.moveMouseSmooth(specLastLinePos.x, specLastLinePos.y);
    robot.mouseClick();
  }, Math.floor(Math.random() * (8000 - 7000 + 1) + 7000));
};

const openBak = () => {
  robot.typeString("b");
  setTimeout(function () {
    robot.keyTap("escape");
    robot.moveMouseSmooth(specLastLinePos.x, specLastLinePos.y);
    robot.mouseClick();
  }, Math.floor(Math.random() * (7000 - 6000 + 1) + 6000));
};

const specLastKolo = () => {
  setTimeout(function () {
    robot.moveMouseSmooth(specLastLinePos.x, specLastLinePos.y);
    robot.mouseClick("left", true);
    robot.moveMouseSmooth(leaveFightPos.x, leaveFightPos.y);
    setTimeout(function () {
      robot.mouseClick();
      setTimeout(function () {
        RedisplaySpecList();
      }, Math.floor(Math.random() * (5000 - 4000 + 1) + 4000));
    }, Math.floor(Math.random() * (25000 - 15000 + 1) + 15000));
  }, Math.floor(Math.random() * (3000 - 2500 + 1) + 2500));
};

const openKoloAndSearch = () => {
  setTimeout(function () {
    robot.typeString("k");
    setTimeout(function () {
      robot.moveMouseSmooth(findKoloPos.x, findKoloPos.y);
      robot.mouseClick();
      setTimeout(function () {
        robot.keyTap("escape");
        robot.keyTap("escape");
        setTimeout(function () {
          robot.moveMouseSmooth(specLastLinePos.x, specLastLinePos.y);
          robot.mouseClick();
        }, 2500);
      }, 2500);
    }, 2000);
  }, 1000);
};

const DoRandomMouseMove = () => {
  for (let l = 0; l < 2; l++) {
    let min = Math.floor(Math.random() * (800 - 200 + 1) + 200);
    let max = Math.floor(Math.random() * (800 - 200 + 1) + 200);
    if (min > max) {
      [min, max] = [max, min];
    }
    let rndX = Math.floor(Math.random() * (max - min + 1) + min);
    let rndY = Math.floor(Math.random() * (max - min + 1) + min);
    robot.moveMouseSmooth(rndX, rndY);
  }
};

const RemoveExchange = () => {
  setTimeout(function () {
    robot.keyTap("escape");
  }, Math.floor(Math.random() * (1000 - 500 + 1) + 500));
};

const launchDofus = (index) => {
  dofusWindows[index] = exec(dofusPath, function () {});
};

const killDofus = (index) => {
  kill(dofusWindows[index].pid, () => {
    dofusWindows.shift();
  });
};

const focusWinByPID = ({ pid }) => {
  var activeProcesses = processWindows.getProcesses(function (err, processes) {
    var dofusProcesses = processes.filter((p) => p.pid == pid);
    if (dofusProcesses.length > 0) {
      processWindows.focusWindow(dofusProcesses[0]);
    }
  });
};

const switchWindows = (activeIndex) => {
  if (activeIndex === 0) {
    focusWinByPID(dofusWindows[0]);
  } else {
    focusWinByPID(dofusWindows[1]);
  }
};

const dofusLogin = () => {
  getNewAccount();
  robot.keyTap("enter"); // mask the advert
  robot.typeStringDelayed(AccountNDC, 1000);
  robot.keyTap("tab");
  robot.typeStringDelayed(AccountPWD, 1000);
  robot.keyTap("enter");
};

const DisplaySpecList = () => {
  robot.moveMouseSmooth(specPos.x, specPos.y);
  robot.mouseClick();
  ScrollAllSpecList();
};

const RedisplaySpecList = () => {
  robot.moveMouseSmooth(specPos.x, specPos.y);
  robot.mouseClick();
  ScrollMouseSpecList();
};

const ScrollMouseSpecList = () => {
  robot.moveMouseSmooth(listBarPos.x, listBarPos.y);
  robot.mouseToggle("down");
  robot.dragMouse(listBarPos.x, listBarPos.y + 300);
  robot.mouseToggle("up");
};

const ScrollAllSpecList = () => {
  robot.moveMouseSmooth(specFirstLinePos.x, specFirstLinePos.y);
  robot.mouseClick();
  for (let i = 0; i < 100; i++) {
    setTimeout(function () {
      robot.keyTap("down");
    }, i * (Math.floor(Math.random() * (100 - 70)) + 70));
  }
};

const closeCurrentDofus = () => {
  killDofus(0);
};

const OpenNewDofus = () => {
  const ni = dofusWindows.length;
  dofusWindows.push("new");
  launchDofus(ni);
  setTimeout(function () {
    switchWindows(0);
  }, 20000);
};

const ReSwitchToLogin = () => {
  setTimeout(function () {
    focusWinByPID(dofusWindows[1]);
    dofusLogin();
    switchWindows(0);
  }, 20000);
};

const SwitchToNewDofus = () => {
  isSwitching = true;
  switchWindows(1);
  setTimeout(function () {
    RedisplaySpecList();
    closeCurrentDofus();
    isSwitching = false;
  }, 2000);
};

const setupDofus = () => {
  setTimeout(function () {
    launchDofus(0);
    setTimeout(function () {
      focusWinByPID(dofusWindows[0]);
      dofusLogin();
      setTimeout(function () {
        DisplaySpecList();
      }, 60000);
    }, 20000);
  }, 200);
};

const getMatchType = ({ attackers, defenders }) => {
  if (attackers.length === 3 || defenders.length === 3) {
    return 1;
  } else if (attackers.length === 1 || defenders.length === 1) {
    return 3;
  }
  return 0;
};

function CheckIfNew(match) {
  let type = getMatchType(match);
  if (last_id != match.fightId) {
    if (type == 1) {
      matchQueue3v3.push({
        ...match,
        ts: fightList[match.fightId] ?? new Date().getTime(),
      });
    } else if (type == 3) {
      matchQueue1v1.push({
        ...match,
        ts: fightList[match.fightId] ?? new Date().getTime(),
      });
    }
    last_id = match.fightId;
    GoUpMatch();
  }
}

function GoUpMatch() {
  robot.keyTap("down");
}

function CheckEndedMatch() {
  let endedM1V1 = [];
  let endedM3V3 = [];

  for (let i = 0; i < matchQueue1v1.length; i++) {
    let MFightId = matchQueue1v1[i].fightId;
    if (!fightList.hasOwnProperty(MFightId)) {
      endedM1V1.push({
        ...matchQueue1v1[i],
        time: new Date().getTime() - matchQueue1v1[i].ts * 1000,
      });
      matchQueue1v1.splice(i, 1);
    }
  }
  for (let i = 0; i < matchQueue3v3.length; i++) {
    let MFightId = matchQueue3v3[i].fightId;
    if (!fightList.hasOwnProperty(MFightId)) {
      endedM3V3.push({
        ...matchQueue3v3[i],
        time: new Date().getTime() - matchQueue3v3[i].ts * 1000,
      });
      matchQueue3v3.splice(i, 1);
    }
  }
  if (!CLOUDFLARE) {
    scrapper1v1.send(endedM1V1);
    scrapper3v3.send(endedM3V3);
  }
}

setupDofus();
// --------------------------------------------------------------------------------------------------------------------------------------------------------

const PROTOCOL = decoders.PROTOCOL;
const c = new Cap();
const device = Cap.findDevice(MY_IP);
const filter = "tcp port 5555";
const bufSize = 10 * 1024 * 1024;
const buffer = Buffer.alloc(65535);
var linkType = c.open(device, filter, bufSize, buffer);
c.setMinBytes && c.setMinBytes(0);
c.on("packet", function (nbytes, trunc) {
  raw_data = buffer.slice(0, nbytes);
  if (linkType === "ETHERNET") {
    var ret = decoders.Ethernet(buffer);
    if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
      ret = decoders.IPV4(buffer, ret.offset);
      let info = {
        srcaddr: ret.info.srcaddr,
        dstaddr: ret.info.dstaddr,
      };
      if (ret.info.protocol === PROTOCOL.IP.TCP) {
        const toBin = anyBase(anyBase.HEX, anyBase.BIN);
        const toDec = anyBase(anyBase.BIN, anyBase.DEC);
        var datalen = ret.info.totallen - ret.hdrlen;
        ret = decoders.TCP(buffer, ret.offset);
        datalen -= ret.hdrlen;
        const content = buffer.toString(
          "hex",
          ret.offset,
          ret.offset + datalen
        );
        const rb = buffer.toString("hex", ret.offset, ret.offset + datalen);
        let hexData = content.slice(0, 4);
        let binData = toBin(hexData).slice(0, -2);
        let msgId = toDec(binData);
        if (!(info.srcaddr === MY_IP)) {
          if (msgId == ExchangeRequestedTradeMessage) {
            RemoveExchange();
          }
          if (WarningMessages.includes(msgId)) {
            saveWarningLog(msgId);
          }
          if (msgId == MapRunningFightDetailsMessage && !isSwitching) {
            ExtractFightInfo(rb);
          } else if (
            fightListLenght == 0 &&
            msgId == MapRunningFightListMessage
          ) {
            fightList = {};
            var buffr = Buffer.from(rb, "hex");
            const input = new ByteArray(buffr);
            input.endian = Endian.BIG_ENDIAN;
            if (input.bytesAvailable < 2) {
              console.log("Empty packet !");
              return;
            }

            let hiHeader = input.readUnsignedShort();
            let packetId = hiHeader >> 2;
            let lengthType = hiHeader & 0b11;
            let length = 0;
            let instanceId = -1;
            if (lengthType === 0) {
              length = 0;
            } else if (lengthType === 1) {
              length = input.readUnsignedByte();
            } else if (lengthType === 2) {
              length = input.readUnsignedShort();
            } else if (lengthType === 3) {
              length =
                ((input.readByte() & 255) << 16) +
                ((input.readByte() & 255) << 8) +
                (input.readByte() & 255);
            }
            // console.log(datalen);
            if (datalen >= 1400) {
              console.log("Phase 1");
              fightListLenght = length;
              fightListPacket += rb;
              fightDatalen = datalen;
            }
          } else if (
            datalen >= 30 &&
            fightListLenght > fightDatalen + datalen + 100
          ) {
            console.log("phase 2");
            fightDatalen += datalen;
            fightListPacket += rb;
          } else if (
            fightListLenght !== 0 &&
            datalen >= 1000 &&
            fightListLenght <= fightDatalen + datalen + 10
          ) {
            console.log("Phase 3");
            let fightl = fightListPacket;
            fightListPacket = "";
            fightDatalen = 0;
            fightListLenght = 0;
            ExtractList(fightl + rb, "hex");

            setTimeout(function () {
              GoUpMatch();
              setTimeout(function () {
                console.log("CHECK ENDED MATCH");
                CheckEndedMatch();
                timeToSwitch();
              }, 10000);
            }, 2000);
          }
        }
      }
    }
  }
});

function ExtractList(buff) {
  var buffr = Buffer.from(buff, "hex");
  const input = new ByteArray(buffr);
  input.endian = Endian.BIG_ENDIAN;
  if (input.bytesAvailable < 2) {
    console.log("Empty packet !");
    return;
  }
  let hiHeader = input.readUnsignedShort();
  let packetId = hiHeader >> 2;
  let lengthType = hiHeader & 0b11;
  let length = 0;
  let instanceId = -1;
  if (lengthType === 0) {
    length = 0;
  } else if (lengthType === 1) {
    length = input.readUnsignedByte();
  } else if (lengthType === 2) {
    length = input.readUnsignedShort();
  } else if (lengthType === 3) {
    length =
      ((input.readByte() & 255) << 16) +
      ((input.readByte() & 255) << 8) +
      (input.readByte() & 255);
  }

  fightList = deserializeAs_MapRunningFightListMessage(input);
}

function ExtractFightInfo(buff) {
  var buffr = Buffer.from(buff, "hex");
  const input = new ByteArray(buffr);
  if (input.bytesAvailable < 2) {
    console.log("Empty packet !");
    return;
  }
  let hiHeader = input.readUnsignedShort();
  let packetId = hiHeader >> 2;
  let lengthType = hiHeader & 0b11;
  let length = 0;
  let instanceId = -1;
  if (lengthType === 0) {
    length = 0;
  } else if (lengthType === 1) {
    length = input.readUnsignedByte();
  } else if (lengthType === 2) {
    length = input.readUnsignedShort();
  } else if (lengthType === 3) {
    length =
      ((input.readByte() & 255) << 16) +
      ((input.readByte() & 255) << 8) +
      (input.readByte() & 255);
  }
  const matchInfo = deserializeAs_MapRunningFightDetailsMessage(input);
  CheckIfNew(matchInfo);
}

const deserializeAs_MapRunningFightListMessage = (input) => {
  let fights = {};
  var _fightsLen = input.readShort();

  for (var _i1 = 0; _i1 < _fightsLen; _i1++) {
    let { fightId, fightStart } =
      deserializeAs_FightExternalInformations(input);
    fights[fightId] = fightStart;
  }
  return fights;
};

const deserializeAs_FightExternalInformations = (input) => {
  let fightTeams1 = [];
  let fightTeams2 = [];
  let fightId = _fightIdFunc(input);
  //console.log(fightId);
  let fightType = input.readByte();
  let fightStart = input.readInt();
  let fightLock = input.readBoolean();
  for (let i = 0; i < 2; i++) {
    let teamId = input.readByte();
    let leaderId = input.readDouble();
    let teamSide = input.readByte();
    let teamTypeId = input.readByte();
    let nbWaves = input.readByte();

    const bytebox = input.readByte();
    const teamcount = input.readByte();
    const meanlevel = readVarInt(input);
    // let p = {
    //   teamId,
    //   leaderId,
    //   teamSide,
    //   teamTypeId,
    //   nbWaves,
    //   bytebox,
    //   teamcount,
    //   meanlevel,
    // };
    // fightTeams1.push(p);
  }
  for (let i = 0; i < 2; i++) {
    let p = deserializeAs_FightOptionsInformations(input);
    // fightTeams2.push(p);
  }
  return {
    fightId,
    fightStart,
  };
};

function deserializeAs_FightOptionsInformations(input) {
  var _box1 = input.readByte();
  // let isSecret = getFlag(_box1, 0);
  // let isRestrictedToParty = getFlag(_box1, 1);
  // let isClosed = getFlag(_box1, 2);
  // let isAskingForHelp = getFlag(_box1, 3);

  // return { isSecret, isRestrictedToParty, isClosed, isAskingForHelp };
}

function _fightIdFunc(input) {
  let fightId = readVarShort(input);
  return fightId;
}

function deserializeByteBoxes(input) {
  var _box0 = input.readByte();
  var sex = getFlag(_box0, 0);
  var alive = getFlag(_box0, 1);
  return { sex, alive };
}

function _idFunc(input) {
  var id = input.readDouble();
  if (id < -9007199254740992n || id > 9007199254740992n) {
    throw new Error(
      "Forbidden value (" +
        id +
        ") on element of GameFightFighterLightInformations.id."
    );
  }

  return id;
}

function _waveFunc(input) {
  var wave = input.readByte();
  if (wave < 0) {
    return 0;
  }
  return wave;
}

function _levelFunc(input) {
  var level = readVarShort(input);
  if (level < 0) {
    throw new Error(
      "Forbidden value (" +
        level +
        ") on element of GameFightFighterLightInformations.level."
    );
  }

  return level;
}

function _breedFunc(input) {
  var breed = input.readByte();
  return breed;
}

function getFlag(a, pos) {
  switch (pos) {
    case 0:
      return (a & 1) != 0;
    case 1:
      return (a & 2) != 0;
    case 2:
      return (a & 4) != 0;
    case 3:
      return (a & 8) != 0;
    case 4:
      return (a & 16) != 0;
    case 5:
      return (a & 32) != 0;
    case 6:
      return (a & 64) != 0;
    case 7:
      return (a & 128) != 0;
    default:
      throw new Error("Bytebox overflow.");
  }
}

function readVarInt(_data) {
  var b = 0;
  var value = 0;
  var offset = 0;
  var hasNext = false;
  while (offset < 32) {
    b = _data.readByte();
    hasNext = (b & 128) == 128;
    if (offset > 0) {
      value = value + ((b & 127) << offset);
    } else {
      value = value + (b & 127);
    }
    offset = offset + 7;
    if (!hasNext) {
      return value;
    }
  }
  throw new Error("Too much data");
}

function readVarShort(_data) {
  var b = 0;
  var value = 0;
  var offset = 0;
  var hasNext = false;
  while (offset < 16) {
    b = _data.readByte();
    hasNext = (b & 128) == 128;
    if (offset > 0) {
      value = value + ((b & 127) << offset);
    } else {
      value = value + (b & 127);
    }
    offset = offset + 7;
    if (!hasNext) {
      if (value > 32767) {
        value = value - 65536;
      }
      return value;
    }
  }
  throw new Error("Too much data");
}

function deserializeAs_MapRunningFightDetailsMessage(input) {
  let attackers = [];
  let defenders = [];
  var _id2 = 0;
  var _item2 = null;
  var _id3 = 0;
  var _item3 = null;
  var _name = null;
  var fightId = _fightIdFunc(input);
  var _attackersLen = input.readUnsignedShort();
  for (var _i2 = 0; _i2 < _attackersLen; _i2++) {
    _id2 = input.readUnsignedShort();
    _item2 = deserializeAs_GameFightFighterLightInformations(input);
    _name = input.readUTF();
    let player = { ..._item2, _name };
    attackers.push(player);
  }

  var _defendersLen = input.readUnsignedShort();
  for (var _i3 = 0; _i3 < _defendersLen; _i3++) {
    _id3 = input.readUnsignedShort();
    _item3 = deserializeAs_GameFightFighterLightInformations(input);
    _name = input.readUTF();
    let player = { ..._item3, _name };
    defenders.push(player);
  }

  let res = {
    fightId,
    attackers,
    defenders,
  };

  return res;
}

function deserializeAs_GameFightFighterLightInformations(input) {
  var box = deserializeByteBoxes(input);
  var id = _idFunc(input);
  var uid = Math.floor(id / 65536) * 100000 + Math.floor(id % 65536);
  var wave = _waveFunc(input);
  var level = _levelFunc(input);
  var breed = _breedFunc(input);
  return {
    id,
    uid,
    level,
    breed,
  };
}
