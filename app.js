const express = require("express");
const path = require("path");
const app = express();
var bodyParser = require("body-parser");
const request = require("request-promise");
const userAgents = require("./userAgent");
// rey.RqLU8exfsfA
app.use(express.static(path.join(__dirname)));
var jsonParser = bodyParser.json();
// https://bck.hermes.cn/product-page?locale=cn_zh&productsku=H064929CABW
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, index.html));
});

app.post("/add-to-cart", jsonParser, (req, res) => {
  const { cookies = [], products = [], countries = [] } = req.body,
    all_req = [],cookiemap={};

  if (products.length === 0) {
    return res.json({ error: "没有产品编号" });
  }
  if (cookies.length === 0) {
    return res.json({ error: "没有设置cookie" });
  }
  if (countries.length === 0) {
    return res.json({ error: "没有设置城市" });
  }
  

  cookies.forEach((cookie,idx) => {
    if(cookie) {
      cookiemap[cookie+";"] = "账号" + (idx + 1)
    }
    products.forEach((prod) => {
      countries.forEach((country) => {
        all_req.push({
          cookie,
          prod,
          country,
        });
      });
    });
  });

  Promise.all(
    all_req.map((item) => {
      let userAgent = userAgents[parseInt(Math.random() * userAgents.length)];
      // let userAgent = userAgents[8];

      return request.post("https://bck.hermes.cn/add-to-cart", {
        headers: {
          Cookie: `ECOM_SESS=${item.cookie};`,
          "user-agent":userAgent,
        },
        body: {
          locale: item.country,
          items: [
            {
              category: "direct",
              sku: item.prod,
            },
          ],
        },
        json: true,
        transform: function (body, response) {
          return {
            rr: body,
            response,
          };
        },
      });
    })
  )
    .then((r) => {
      let reshtml = ``,success_str = "",error_str = "";
      r.forEach(({ rr, response }) => {
        if (rr.error) {
          error_str += `<span style="color:#D84315;">加入失败！</span><strong>${
            cookiemap[response.request.headers.Cookie.split("=")[1]] || response.request.headers.Cookie.split("=")[1]
          }</strong> : <strong> ${
            rr.error.item
          }</strong>  <span style="color:#D84315;">${
            rr.error.message
          } ${rr.error.code}</span><br>`;
        } else {
          success_str += `<span style="color:#00E676;">加入成功！</span><strong>${
            cookiemap[response.request.headers.Cookie.split("=")[1]] || response.request.headers.Cookie.split("=")[1]
          }</strong> : <strong>${
            rr.basket.items[0].sku
          }</strong> <br>`;
        }
      });

      reshtml = success_str + error_str;
      res.json({
        result: reshtml,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        error: err.message,
      });
    });

  // res.json(req.body)
});

app.listen(3211, () => {
  console.log("success in port 3211");
});
