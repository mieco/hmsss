const request = require("request");



request.post(
  "https://bck.hermes.cn/add-to-cart",
  {
    headers: {
      Cookie: "ECOM_SESS=sf00c5nda8hipja611eo6rcak7;",
      "user-agent":
        " Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
    },
    body: {
      locale: "uk_en",
      items: [
        {
          category: "direct",
          sku: "H079633CKAC090",
        },
      ],
    },
    json: true,
  },
  (error, res) => {
    if (error) {
      console.log(error);
    } else {
      console.log(res.body);
    }
  }
);

