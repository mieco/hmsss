const request = require("request-promise");

// const r = request.defaults({ proxy: "http://127.0.0.1:1087" });
const r = request.defaults({ proxy: "http://180.141.90.145:53281" });
let allpromise = [];

const ips = [
  "http://213.98.67.40:57149",
  "http://201.46.28.222:63238",
  "http://185.184.243.213:5836",
  "http://125.108.106.107:9000",
  "http://195.154.56.170:5836",
  "http://138.117.84.161:999",
  "http://173.82.62.19:5836",
  "http://134.35.113.95:8080",
  "http://182.23.54.146:58519",
  "http://103.6.184.222:39241",
  "http://103.65.26.203:8080",
  "http://188.32.128.87:8081",
  "http://191.7.195.42:55443",
  "http://123.139.56.238:9999",
  "http://110.243.17.202:9999",
  "http://43.248.24.158:51166",
  "http://203.150.128.130:8080",
  "http://171.35.175.26:9999",
  "http://118.212.106.216:9999",
  "http://180.141.90.145:53281",
  "http://139.255.13.153:8080",
  "http://219.159.38.202:56210",
  "http://173.82.62.20:5836",
  "http://27.255.58.89:8080",
  "http://43.245.216.178:8080",
  "http://62.210.58.186:5836",
  "http://125.25.165.97:39021",
  "http://185.184.243.211:5836",
  "http://134.35.240.17:8080",
  "http://43.252.145.50:8080",
  "http://49.231.140.120:8080",
  "http://140.255.185.15:9999",
  "http://181.224.231.68:999",
  "http://122.5.109.220:9999",
  "http://41.60.235.189:8080",
  "http://36.89.234.175:8080",
  "http://183.89.64.243:8080",
  "http://118.113.247.85:9999",
  "http://110.243.24.123:9999",
  "http://175.42.129.198:9999",
  "http://112.111.77.41:9999",
  "http://223.242.225.61:9999",
  "http://109.224.55.10:34082",
  "http://118.113.246.213:9999",
  "http://183.166.70.176:9999",
  "http://43.239.152.252:8080",
  "http://122.4.43.87:9999",
  "http://163.204.240.139:9999",
  "http://103.212.93.209:34184",
  "http://190.90.24.2:999",
];
// for (let index = 0; index < 1000; index++) {
//   allpromise.push(

//   );
// }

// Promise.all(allpromise)
//   .then((res) => {
//     console.log(res[0]);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
let idx = 0,
  valuable = [];

r.get("https://httpbin.org/get")
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err.message);
  });
// req();

function req() {
  request
    .get("https://httpbin.org/get", { proxy: ips[idx], timeout: 3 * 1000 })
    .then((res) => {
      console.log(res);
      valuable.push(ips[idx]);
    })
    .catch((err) => {
      console.log(err.message, ips[idx]);
    })
    .done(() => {
      idx++;
      if (ips[idx]) {
        req();
      } else {
        console.log(valuable);
      }
    });
}

const proxy_pool = [
  "http://180.141.90.145:53281",
  "http://219.159.38.202:56210",
];
