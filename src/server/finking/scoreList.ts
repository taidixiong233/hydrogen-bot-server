import { User } from "../../common/user";

import puppeteer from "puppeteer";
import * as fs from "fs";
import * as path from "path";

export async function GetScoreFinkingPng(data: User[]): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <!-- Import style -->
    
        <link rel="stylesheet" href="../assets/index.css" />
        <!-- Import Vue3 -->
        <script src="../assets/vue.global.prod.js"></script>
        <!-- <script src="../assets/vue.global.js"></script> -->
        <!-- Import component library -->
    
        <script src="../assets/index.full.js"></script>
        <script>
          const user_score_data = ${JSON.stringify(data)};
        </script>
      </head>
      <body>
        <div id="app" style="width: 360px">
          <div style="text-align: center">
            <el-text>积分排行</el-text>
          </div>
          <el-table :data="score_data" stripe style="width: 360px">
            <el-table-column type="index" width="60" label="排名"></el-table-column>
            <el-table-column prop="QQid" width="120" label="QQ号"></el-table-column>
            <el-table-column
              prop="score"
              width="100"
              label="积分数量"
            ></el-table-column>
            <el-table-column
              prop="dayN"
              width="80"
              label="签到天数"
            ></el-table-column>
          </el-table>
    
          <div style="text-align: center">
            <el-text>数据统计时间: {{ time() }}</el-text><br />
            <el-text>氢气机器人版权所有</el-text>
          </div>
        </div>
      </body>
      <script>
        const { createApp, ref } = Vue;
        const app = createApp({
          data() {
            return {
              score_data: ref(user_score_data),
            };
          },
          methods: {
            time() {
              const time = new Date()
              return \`\${time.getFullYear()}-\${time.getMonth() + 1}-\${time.getDate()}T\${time.getHours()}:\${time.getMinutes()}:\${time.getSeconds()}\`
            }
          }
        });
        app.use(ElementPlus);
        app.mount("#app");
      </script>
    </html>
    
    `;

  try {
    const time = new Date().getTime();
    if (!fs.existsSync(path.join(__dirname, "./tmp"))) {
      fs.mkdirSync(path.join(__dirname, "./tmp"));
    }
    fs.writeFileSync(path.join(__dirname, "./tmp", `./${time}.html`), html);

    let ret: Buffer = Buffer.from("");

    const browser = await puppeteer.launch({
      // root 权限下需要取消sandbox
      args: ["--no-sandbox"],
      headless: "new",
    });

    // 打开浏览器后，新建tab页
    const page = await browser.newPage();
    // 设置tab页的尺寸，puppeteer允许对每个tab页单独设置尺寸
    await page.setViewport({
      width: 360,
      height: 330,
    });

    // tab访问需要截图的页面，使用await可以等待页面加载完毕
    await page.goto(path.join(__dirname, "./tmp", `./${time}.html`), {
      waitUntil: "networkidle0",
    });

    // 页面渲染完毕后，开始截图

    await page.screenshot({
      path: path.join(__dirname, "./tmp", `./${time}.png`),
    });

    browser.close();

    ret = fs.readFileSync(path.join(__dirname, "./tmp", `./${time}.png`));

    fs.unlinkSync(path.join(__dirname, "./tmp", `./${time}.html`));
    fs.unlinkSync(path.join(__dirname, "./tmp", `./${time}.png`));
    return new Promise((res) => res(ret));
  } catch (err) {
    console.log(err);
    return new Promise((_, rej) => rej());
  }
}
