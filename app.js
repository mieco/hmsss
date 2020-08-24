const express = require("express");
const path = require("path");
const app = express();
var bodyParser = require("body-parser");
const request = require("request");
const userAgents = require("./userAgent");
const fs = require("fs");
var cookieParser = require("cookie-parser");

const IPsUrl =
  "http://dps.kdlapi.com/api/getdps?orderid=999670921031535&num=1&format=json";
// request.defaults({ proxy: "http://127.0.0.1:1087" });
// const rp = request.defaults({ proxy: "http://180.141.90.145:53281" });
// rey.RqLU8exfsfA
// https://bck.hermes.cn/product-page?locale=au_en&productsku=H079103CCP9
//http://dps.kdlapi.com/api/getdps?orderid=999670921031535&num=5&format=json
app.use(express.static(path.resolve(__dirname, "dist")));
app.use(cookieParser());
var jsonParser = bodyParser.json();
app.get("/", (req, res) => {
  console.log(path.resolve(__dirname, "dist/index.html"));
  res.sendFile(path.resolve(__dirname, "dist/index.html"));
});

app.post("/add-to-cart", jsonParser, async (req, res) => {
  const {
      cookie = "",
      datadome = "",
      products = [],
      countries = [],
    } = req.body,
    all_req = [],
    datadome_cookies = datadome ? `datadome=${datadome}` : "",
    cookiemap = {};

  if (products.length === 0) {
    return res.json({ error: "没有产品编号" });
  }
  if (!cookie) {
    return res.json({ error: "没有设置cookie" });
  }

  if (countries.length === 0) {
    return res.json({ error: "没有设置城市" });
  }

  let req_cookie = `ECOM_SESS=${cookie};${datadome_cookies}`;

  products
    .filter((p) => p)
    .forEach((prod) => {
      countries.forEach((country) => {
        all_req.push({
          cookie: req_cookie,
          prod,
          country,
        });
      });
    });

  // console.log(JSON.stringify(all_req, null, 2));
  let promise_results = [],
    idx = 0;
  let reshtml = ``,
    success_str = "",
    error_str = "",
    res_results = [];
  try {
    await (async function () {
      for (let req of all_req) {
        idx++;
        let ip = await new Promise((resolve, reject) => {
          request.get(IPsUrl, (err, res) => {
            if (err) {
              resolve(false);
            } else {
              resolve(res.body.data.proxy_list[0] || false);
            }
          });
        });
        console.log(ip);
        let result = await new Promise((resolve, reject) => {
          let userAgent =
            userAgents[parseInt(Math.random() * userAgents.length)];
          request.post(
            "https://bck.hermes.cn/add-to-cart",
            {
              headers: {
                cookie: req.cookie,
                "user-agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
                accept: "application/json, text/plain, */*",
                Origin: "https://www.hermes.com",
              },
              body: {
                locale: req.country,
                items: [
                  {
                    category: "direct",
                    sku: req.prod,
                  },
                ],
              },
              json: true,
              proxy: ip || null,
            },
            (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  rr: res.body,
                  response: res,
                  sku: req.prod,
                });
              }
            }
          );
        });
        promise_results.push(result);

        if (all_req[idx]) {
          await new Promise((resolve, reject) => {
            let time = getRandomArbitrary(1000, 3000);
            setTimeout(() => {
              resolve(true);
            }, time);
          });
        }
      }
    })();

    promise_results.forEach(({ rr, response, sku }) => {
      if (rr.error) {
        console.log(rr.error);
        res_results.push({
          success: false,
          sku,
          message: rr.error.message + " " + rr.error.code,
        });
      } else {
        if (typeof rr === "string") {
          console.log(rr);
          res_results.push({
            success: false,
            sku,
            message: rr,
          });
        } else {
          console.log(rr);
          if (rr.url) {
            res_results.push({
              success: false,
              sku,
              message: "需要验证！",
            });
          } else {
            if (rr.basket && rr.basket.items && rr.basket.items[0]) {
              res_results.push({
                success: true,
                sku,
                message: "加入成功！",
              });
            } else {
              res_results.push({
                success: false,
                sku,
                message: "购物车为空！",
              });
            }
          }
        }
      }

      // if (rr.error) {
      //   error_str += `<span style="color:#D84315;">加入失败！</span>  <strong> ${rr.error.item}</strong>  <span style="color:#D84315;">${rr.error.message} ${rr.error.code}</span><br>`;
      // } else {
      //   if (typeof rr === "string") {
      //     error_str+= `<span style="color:#D84315;">加入失败！</span> ${rr} <br>`
      //   } else {
      //     if (rr.url) {
      //       // fs.writeFileSync("./auth.html", rr);
      //       success_str += `<span style="color:#D84315;">加入失败！</span>需要验证! <br>`;
      //     } else {
      //       if (rr.basket && rr.basket.items && rr.basket.items[0]) {
      //         success_str += `<span style="color:#00E676;">加入成功！</span> <strong>${rr.basket.items[0].sku}</strong> <br>`;
      //       } else {
      //         error_str += `<span style="color:#D84315;">加入失败！</span>购物车为空! <br>`;
      //       }
      //     }
      //   }
      // }
    });
  } catch (error) {
    console.log(error);
    res.json({
      error: error.message,
    });
  }
  res.json({
    result: res_results,
  });
  return;
  // Promise.all(
  //   all_req.map((item) => {
  //     let userAgent = userAgents[parseInt(Math.random() * userAgents.length)];
  //     // let userAgent = userAgents[8];

  //     return new Promise((resolve, reject) => {
  //       // rp.get(
  //       // console.log(`ECOM_SESS=${item.cookie};${datadome_cookies}`);

  //       request.post(
  //         "https://bck.hermes.cn/add-to-cart",
  //         {
  //           headers: {
  //             // Cookie: `ECOM_SESS=${item.cookie}`,
  //             // Cookie: `ECOM_SESS=002u8963rmdc795phigm7r5pq3; ak_bmsc=C3823275D7EC4C5CE5E7EC8B96BBBC9F3CD216B225370000E0613B5FAB5F8B73~plbbbIUW6MIwvotffwU9KAhlpdbA6yWrm/wG9NgYJ99cPlB2D2sf0b4LeYSo2LJvFiV38ZIxF8McGjblr2ElIhBYnzsuOM0AF3j24cj/gW4PY43aP7CJNXJUB9dQa4E1xwoVX95TZcB/gFEmGs7FP6Bi5ya9ocdVoM2n5ml8x+Q9le5ft5uyx3+KyoAWI16Wy7N9q1lqyx6GOoKvRkrWtZ1/SRA1Qdr5cDBjgaXlZBw7I=; datadome=Ou~lmhldSlRiIvW38OhhhBx~e9qvH8qjpB7FLaiIq916yYj7LxTvAYRa8aOwIs4O21KSvB6RgE96DEtWjparGtj.TQdDK5sdH9SldYNBMG`,
  //             "user-agent": userAgent,
  //             accept: "application/json, text/plain, */*",
  //             cookie:
  //               "ECOM_SESS=866m87alhagd9c3n62aq3c46l2;datadome=OchKMhbMaHnqIX9RKLF3YiHGMswMVGl93BhJ~jxMZSylb4-~Q~OH3T_7xeTkzi5txg~27y1dFGobfRl.oo~nsM7FLua_aiG5NVkGYgUMv_",
  //           },
  //           body: {
  //             locale: item.country,
  //             items: [
  //               {
  //                 category: "direct",
  //                 sku: item.prod,
  //               },
  //             ],
  //           },
  //           json: true,
  //         },
  //         (err, res) => {
  //           // console.log(res);
  //           if (err) {
  //             reject(err);
  //           } else {
  //             resolve({
  //               rr: res.body,
  //               response: res,
  //             });
  //           }
  //         }
  //       );
  //     });
  //   })
  // )
  //   .then((r) => {
  //     let reshtml = ``,
  //       success_str = "",
  //       error_str = "";
  //     r.forEach(({ rr, response }) => {
  //       // console.log(response.request.headers);
  //       let cookies = parseCookieStr(
  //           response.request.headers.Cookie ||
  //             response.request.headers.cookie ||
  //             ""
  //         ),
  //         accout_name = cookiemap[cookies["ECOM_SESS"]] || cookies["ECOM_SESS"];

  //       if (Array.isArray(response.headers["set-cookie"])) {
  //         response.headers["set-cookie"].forEach((ck) => {
  //           if (ck) {
  //             res.append("Set-Cookie", ck.replace("Domain=.hermes.cn;", ""));
  //           }
  //         });
  //       }
  //       if (rr.error) {
  //         error_str += `<span style="color:#D84315;">加入失败！</span><strong>${accout_name}</strong> : <strong> ${rr.error.item}</strong>  <span style="color:#D84315;">${rr.error.message} ${rr.error.code}</span><br>`;
  //       } else {
  //         console.log(rr);

  //         if (typeof rr === "string" || rr.url) {
  //           fs.writeFileSync("./auth.html", rr);
  //           success_str += `<span style="color:#D84315;">加入失败！</span><strong>${accout_name}</strong> : 需要验证! <br>`;
  //         } else {
  //           if (rr.basket && rr.basket.items && rr.basket.items[0]) {
  //             success_str += `<span style="color:#00E676;">加入成功！</span><strong>${accout_name}</strong> : <strong>${rr.basket.items[0].sku}</strong> <br>`;
  //           } else {
  //             error_str += "加入失败，购物车为空！";
  //           }
  //         }
  //       }
  //     });

  //     reshtml = success_str + error_str;
  //     res.json({
  //       result: reshtml,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.json({
  //       error: err.message,
  //     });
  //   });

  // res.json(req.body)
});

app.listen(3211, () => {
  console.log("success in port 3211");
});

function parseCookieStr(str) {
  if (!str) return {};
  return str
    .split(";")
    .filter((v) => v)
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
/* var timer;

timer = setInterval(() => {
  if (
    document.getElementById("result").innerHTML &&
    document.getElementById("result").innerHTML.indexOf("成功") >= 0
  ) {
    clearInterval(timer);
    alert("c成功！～")
  } else {
    document.querySelector("button").click();
  }
}, 1000);
 */
