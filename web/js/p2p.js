const { ipcRenderer } = require("electron");
const echarts = require("../resource/js/echarts");
const { MAX_DATA_POINTS, limitDataPoints } = require('./chartConfig');

const P2P_time = document.getElementById("P2P_time");
const local_time = document.getElementById("local_time");

const p2p_server_num = document.getElementById("p2p_server_num");
const p2p_v6_server_num = document.getElementById("p2p_v6_server_num");
const p2p_in_num = document.getElementById("p2p_in_num");
const p2p_v6_in_num = document.getElementById("p2p_v6_in_num");
const p2p_out_num = document.getElementById("p2p_out_num");
const p2p_v6_out_num = document.getElementById("p2p_v6_out_num");

const p2p_server = document.getElementById("p2p_server");
const p2p_in = document.getElementById("p2p_in");
const p2p_out = document.getElementById("p2p_out");
const p2p_v6_server = document.getElementById("p2p_v6_server");
const p2p_v6_in = document.getElementById("p2p_v6_in");
const p2p_v6_out = document.getElementById("p2p_v6_out");

const charts = [
	echarts.init(document.getElementById("wave-1"), null, { height: 100, width: 300, renderer: "svg" }),
  echarts.init(document.getElementById("wave-2"), null, { height: 100, width: 300, renderer: "svg" }),
  echarts.init(document.getElementById("wave-3"), null, { height: 100, width: 300, renderer: "svg" }),
  echarts.init(document.getElementById("wave-4"), null, { height: 100, width: 300, renderer: "svg" })
];
for (let i = 0, j = charts.length; i < j; i++) {
  charts[i].setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    xAxis: {
      type      : "time",
      splitLine : {
        show: false,
      },
      show: false,
    },
    yAxis: {
      type      : "value",
      animation : false,
      splitLine : {
        show: false,
      },
      axisLabel: {
        interval : 1,
        fontSize : 10,
      },
    },
    grid: {
      top    : 16,
      right  : 0,
      bottom : 0,
    }
  });
}
const chartdata = [
	[],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];

// let p2p_max_lag_num = 0;
// let p2p_v6_max_lag_num = 0;

ipcRenderer.on("p2pinfo", (event, ans) => {
  const info = ans.info;
  const info6 = ans.info6;
  const server_ips = ans.server_ips;
  const server_ips6 = ans.server_ips6;

  P2P_time.textContent = formatTime(Date.now());
  p2p_server_num.textContent = info.server.length;
  p2p_v6_server_num.textContent = info6.server.length;
  p2p_in_num.textContent = info.in.length;
  p2p_v6_in_num.textContent = info6.in.length;
  p2p_out_num.textContent = info.out.length;
  p2p_v6_out_num.textContent = info6.out.length;

  let p2p_num = [
    info.in.length,
    info.out.length,
    info6.in.length,
    info6.out.length
  ];

  // console.log(ans);

  p2p_server.innerText = "";

  let p2p_server_lag_avg = 0;

  if (info.server.length > 0)
    for (let i = 0; i < info.server.length; i++) {
      // console.log(data.server[i]);
      const p2p_server_list = document.createElement("span");
      p2p_server_list.style.display = "flex";
      p2p_server_list.style.justifycontent = "flex-end";
      p2p_server_list.style.flexWrap = "wrap";
      p2p_server_list.style.color = "white";
      p2p_server_list.style.textAlign = "right";
      let p2p_server_time = 0;
      let p2p_server_name = "未知";
      let p2p_server_lag = 0;

      for (let index = 0, keys = Object.keys(info.time.server), n = keys.length; index < n; index++)
        if (info.server[i] == keys[index])
          p2p_server_time = info.time.server[keys[index]];

      for (let index = 0, keys = Object.keys(server_ips), n = keys.length; index < n; index++) {
        const server_ip = info.server[i].split(":");

        if (server_ip[0] == server_ips[keys[index]]) {
          const server_url = keys[index].split(".");
          p2p_server_name = server_url[0];
        }
      }

      for (let index = 0, keys = Object.keys(info.time.server), n = keys.length; index < n; index++)
        if (info.server[i] == keys[index])
          p2p_server_lag = info.lag.server[keys[index]];

      const now = new Date(p2p_server_time);
      const Now = now.getFullYear()
        + "-" + (now.getMonth() + 1)
        + "-" + now.getDate()
        + " " + now.getHours()
        + ":" + now.getMinutes()
        + ":" + now.getSeconds();
      p2p_server_list.innerText = `${p2p_server_name} (延遲 : ${p2p_server_lag}ms)`;
      p2p_server.append(p2p_server_list);
      const p2p_server_list_time = document.createElement("span");
      p2p_server_list_time.style.display = "flex";
      p2p_server_list_time.style.justifycontent = "flex-end";
      p2p_server_list_time.style.flexWrap = "wrap";
      p2p_server_list_time.style.color = "white";
      p2p_server_list_time.style.textAlign = "right";
      p2p_server_list_time.innerText = `最後連接時間 : ${Now}`;
      p2p_server.append(p2p_server_list_time);
      const p2p_server_list_hr = document.createElement("hr");
      p2p_server.append(p2p_server_list_hr);
      p2p_server_lag_avg += p2p_server_lag;
    }

  p2p_num[4] = Number((p2p_server_lag_avg / info.server.length).toFixed(0));

  p2p_in.innerText = "";

  let p2p_in_lag_avg = 0;
  let p2p_in_lag_avg_num = 0;

  if (info.in.length > 0)
    for (let i = 0; i < info.in.length; i++) {
      // console.log(data.in[i]);
      const p2p_in_list = document.createElement("span");
      p2p_in_list.style.display = "flex";
      p2p_in_list.style.flexWrap = "wrap";
      p2p_in_list.style.color = "white";
      p2p_in_list.style.textAlign = "right";
      let p2p_in_time = 0;
      let p2p_in_lag_num = 0;
      let p2p_in_lag = "不支援";
      let p2p_in_ver = "不支援";

      for (let index = 0, keys = Object.keys(info.time.in), n = keys.length; index < n; index++)
        if (info.in[i] == keys[index])
          p2p_in_time = info.time.in[keys[index]];

      for (let index = 0, keys = Object.keys(info.lag.in), n = keys.length; index < n; index++)
        if (info.in[i] == keys[index])
          if (info.lag.in[keys[index]] != -1) {
            p2p_in_lag_num = info.lag.in[keys[index]];
            p2p_in_lag = `${p2p_in_lag_num}ms`;
            p2p_in_lag_avg_num += 1;
          }

      for (let index = 0, keys = Object.keys(info.ver.in), n = keys.length; index < n; index++)
        if (info.in[i] == keys[index])
          p2p_in_ver = info.ver.in[keys[index]];

      const now = new Date(p2p_in_time);
      const Now = now.getFullYear()
        + "-" + (now.getMonth() + 1)
        + "-" + now.getDate()
        + " " + now.getHours()
        + ":" + now.getMinutes()
        + ":" + now.getSeconds();
      p2p_in_list.innerText = `${info.in[i]} (延遲 : ${p2p_in_lag})`;
      p2p_in.append(p2p_in_list);
      const p2p_in_list_time = document.createElement("span");
      p2p_in_list_time.style.display = "flex";
      p2p_in_list_time.style.flexWrap = "wrap";
      p2p_in_list_time.style.color = "white";
      p2p_in_list_time.style.textAlign = "right";
      p2p_in_list_time.innerText = `${Now}(版本 : ${p2p_in_ver})`;
      p2p_in.append(p2p_in_list_time);
      const p2p_in_list_hr = document.createElement("hr");
      p2p_in.append(p2p_in_list_hr);
      p2p_in_lag_avg += p2p_in_lag_num;
    }

  p2p_num[5] = Number((p2p_in_lag_avg / p2p_in_lag_avg_num).toFixed(0));

	p2p_out.innerText = "";

  let p2p_out_lag_avg = 0;
  let p2p_out_lag_avg_num = 0;

  if (info.out.length > 0)
    for (let i = 0; i < info.out.length; i++) {
      // console.log(data.out[i]);
      const p2p_out_list = document.createElement("span");
      p2p_out_list.style.display = "flex";
      p2p_out_list.style.flexWrap = "wrap";
      p2p_out_list.style.color = "white";
      p2p_out_list.style.textAlign = "right";
      let p2p_out_time = 0;
      let p2p_out_lag_num = 0;
      let p2p_out_lag = "不支援";
      let p2p_out_ver = "不支援";

      for (let index = 0, keys = Object.keys(info.time.out), n = keys.length; index < n; index++)
        if (info.out[i] == keys[index])
          p2p_out_time = info.time.out[keys[index]];

      for (let index = 0, keys = Object.keys(info.lag.out), n = keys.length; index < n; index++)
        if (info.out[i] == keys[index])
          if (info.lag.out[keys[index]] != -1) {
            p2p_out_lag_num = info.lag.out[keys[index]];
            p2p_out_lag = `${p2p_out_lag_num}ms`;
            p2p_out_lag_avg_num += 1;
          }

      for (let index = 0, keys = Object.keys(info.ver.out), n = keys.length; index < n; index++)
        if (info.out[i] == keys[index])
          p2p_out_ver = info.ver.out[keys[index]];

      const now = new Date(p2p_out_time);
      const Now = now.getFullYear()
        + "-" + (now.getMonth() + 1)
        + "-" + now.getDate()
        + " " + now.getHours()
        + ":" + now.getMinutes()
        + ":" + now.getSeconds();
      p2p_out_list.innerText = `${info.out[i]} (延遲 : ${p2p_out_lag})`;
      p2p_out.append(p2p_out_list);
      const p2p_out_list_time = document.createElement("span");
      p2p_out_list_time.style.display = "flex";
      p2p_out_list_time.style.flexWrap = "wrap";
      p2p_out_list_time.style.color = "white";
      p2p_out_list_time.style.textAlign = "right";
      p2p_out_list_time.innerText = `${Now}(版本 : ${p2p_out_ver})`;
      p2p_out.append(p2p_out_list_time);
      const p2p_out_list_hr = document.createElement("hr");
      p2p_out.append(p2p_out_list_hr);
      p2p_out_lag_avg += p2p_out_lag_num;
    }

  p2p_num[6] = Number((p2p_out_lag_avg / p2p_out_lag_avg_num).toFixed(0));

  p2p_v6_server.innerText = "";

  let p2p_v6_server_lag_avg = 0;

  if (info6.server.length > 0)
    for (let i = 0; i < info6.server.length; i++) {
      // console.log(data.server[i]);
      const p2p_server_list = document.createElement("span");
      p2p_server_list.style.display = "flex";
      p2p_server_list.style.justifycontent = "flex-end";
      p2p_server_list.style.flexWrap = "wrap";
      p2p_server_list.style.color = "white";
      p2p_server_list.style.textAlign = "right";
      let p2p_server_time = 0;
      let p2p_server_name = "未知";
      let p2p_server_lag = 0;

      for (let index = 0, keys = Object.keys(info6.time.server), n = keys.length; index < n; index++)
        if (info6.server[i] == keys[index])
          p2p_server_time = info6.time.server[keys[index]];

      for (let index = 0, keys = Object.keys(server_ips6), n = keys.length; index < n; index++) {
        const server_ip = info6.server[i].split("_");

        if (server_ip[0] == server_ips6[keys[index]]) {
          const server_url = keys[index].split(".");
          p2p_server_name = server_url[0];
        }
      }

      for (let index = 0, keys = Object.keys(info6.time.server), n = keys.length; index < n; index++)
        if (info6.server[i] == keys[index])
          p2p_server_lag = info6.lag.server[keys[index]];

      const now = new Date(p2p_server_time);
      const Now = now.getFullYear()
        + "-" + (now.getMonth() + 1)
        + "-" + now.getDate()
        + " " + now.getHours()
        + ":" + now.getMinutes()
        + ":" + now.getSeconds();
      p2p_server_list.innerText = `${p2p_server_name} (延遲 : ${p2p_server_lag}ms)`;
      p2p_v6_server.append(p2p_server_list);
      const p2p_server_list_time = document.createElement("span");
      p2p_server_list_time.style.display = "flex";
      p2p_server_list_time.style.justifycontent = "flex-end";
      p2p_server_list_time.style.flexWrap = "wrap";
      p2p_server_list_time.style.color = "white";
      p2p_server_list_time.style.textAlign = "right";
      p2p_server_list_time.innerText = `最後連接時間 : ${Now}`;
      p2p_v6_server.append(p2p_server_list_time);
      const p2p_server_list_hr = document.createElement("hr");
      p2p_v6_server.append(p2p_server_list_hr);
      p2p_v6_server_lag_avg += p2p_server_lag;
    }

  p2p_num[7] = Number((p2p_v6_server_lag_avg / info6.server.length).toFixed(0));

  p2p_v6_in.innerText = "";

  let p2p_v6_in_lag_avg = 0;
  let p2p_v6_in_lag_avg_num = 0;

  if (info6.in.length > 0)
    for (let i = 0; i < info6.in.length; i++) {
      // console.log(data.in[i]);
      const p2p_in_list = document.createElement("span");
      p2p_in_list.style.display = "flex";
      p2p_in_list.style.flexWrap = "wrap";
      p2p_in_list.style.color = "white";
      p2p_in_list.style.textAlign = "right";
      let p2p_in_time = 0;
      let p2p_in_lag_num = 0;
      let p2p_in_lag = "不支援";
      let p2p_in_ver = "不支援";

      for (let index = 0, keys = Object.keys(info6.time.in), n = keys.length; index < n; index++)
        if (info6.in[i] == keys[index])
          p2p_in_time = info6.time.in[keys[index]];

      for (let index = 0, keys = Object.keys(info6.lag.in), n = keys.length; index < n; index++)
        if (info6.in[i] == keys[index])
          if (info6.lag.in[keys[index]] != -1) {
            p2p_in_lag_num = info6.lag.in[keys[index]];
            p2p_in_lag = `${p2p_in_lag_num}ms`;
            p2p_v6_in_lag_avg_num += 1;
          }

      for (let index = 0, keys = Object.keys(info6.ver.in), n = keys.length; index < n; index++)
        if (info6.in[i] == keys[index])
          p2p_in_ver = info6.ver.in[keys[index]];

      const now = new Date(p2p_in_time);
      const Now = now.getFullYear()
        + "-" + (now.getMonth() + 1)
        + "-" + now.getDate()
        + " " + now.getHours()
        + ":" + now.getMinutes()
        + ":" + now.getSeconds();
      const info6_in = info6.in[i].split("_");
      p2p_in_list.innerText = `${info6_in[0]}`;
      p2p_v6_in.append(p2p_in_list);
      const p2p_in_list_port = document.createElement("span");
      p2p_in_list_port.style.display = "flex";
      p2p_in_list_port.style.flexWrap = "wrap";
      p2p_in_list_port.style.color = "white";
      p2p_in_list_port.style.textAlign = "right";
      p2p_in_list_port.innerText = `端口 : ${info6_in[1]} (延遲 : ${p2p_in_lag})`;
      p2p_v6_in.append(p2p_in_list_port);
      const p2p_in_list_time = document.createElement("span");
      p2p_in_list_time.style.display = "flex";
      p2p_in_list_time.style.flexWrap = "wrap";
      p2p_in_list_time.style.color = "white";
      p2p_in_list_time.style.textAlign = "right";
      p2p_in_list_time.innerText = `${Now}(版本 : ${p2p_in_ver})`;
      p2p_v6_in.append(p2p_in_list_time);
      const p2p_in_list_hr = document.createElement("hr");
      p2p_v6_in.append(p2p_in_list_hr);
      p2p_v6_in_lag_avg += p2p_in_lag_num;
    }

  p2p_num[8] = Number((p2p_v6_in_lag_avg / p2p_v6_in_lag_avg_num).toFixed(0));

	p2p_v6_out.innerText = "";

  let p2p_v6_out_lag_avg = 0;
  let p2p_v6_out_lag_avg_num = 0;

  if (info6.out.length > 0)
    for (let i = 0; i < info6.out.length; i++) {
      // console.log(data.out[i]);
      const p2p_out_list = document.createElement("span");
      p2p_out_list.style.display = "flex";
      p2p_out_list.style.flexWrap = "wrap";
      p2p_out_list.style.color = "white";
      p2p_out_list.style.textAlign = "right";
      let p2p_out_time = 0;
      let p2p_out_lag_num = 0;
      let p2p_out_lag = "不支援";
      let p2p_out_ver = "不支援";

      for (let index = 0, keys = Object.keys(info6.time.out), n = keys.length; index < n; index++)
        if (info6.out[i] == keys[index])
          p2p_out_time = info6.time.out[keys[index]];

      for (let index = 0, keys = Object.keys(info6.lag.out), n = keys.length; index < n; index++)
        if (info6.out[i] == keys[index])
          if (info6.lag.out[keys[index]] != -1) {
            p2p_out_lag_num = info6.lag.out[keys[index]];
            p2p_out_lag = `${p2p_out_lag_num}ms`;
            p2p_v6_out_lag_avg_num += 1;
          }

      for (let index = 0, keys = Object.keys(info6.ver.out), n = keys.length; index < n; index++)
        if (info6.out[i] == keys[index])
          p2p_out_ver = info6.ver.out[keys[index]];

      const now = new Date(p2p_out_time);
      const Now = now.getFullYear()
        + "-" + (now.getMonth() + 1)
        + "-" + now.getDate()
        + " " + now.getHours()
        + ":" + now.getMinutes()
        + ":" + now.getSeconds();
      const info6_out = info6.out[i].split("_");
      p2p_out_list.innerText = `${info6_out[0]}`;
      p2p_v6_out.append(p2p_out_list);
      const p2p_out_list_port = document.createElement("span");
      p2p_out_list_port.style.display = "flex";
      p2p_out_list_port.style.flexWrap = "wrap";
      p2p_out_list_port.style.color = "white";
      p2p_out_list_port.style.textAlign = "right";
      p2p_out_list_port.innerText = `端口 : ${info6_out[1]} (延遲 : ${p2p_out_lag})`;
      p2p_v6_out.append(p2p_out_list_port);
      const p2p_out_list_time = document.createElement("span");
      p2p_out_list_time.style.display = "flex";
      p2p_out_list_time.style.flexWrap = "wrap";
      p2p_out_list_time.style.color = "white";
      p2p_out_list_time.style.textAlign = "right";
      p2p_out_list_time.innerText = `${Now}(版本 : ${p2p_out_ver})`;
      p2p_v6_out.append(p2p_out_list_time);
      const p2p_out_list_hr = document.createElement("hr");
      p2p_v6_out.append(p2p_out_list_hr);
      p2p_v6_out_lag_avg += p2p_out_lag_num;
    }

  p2p_num[9] = Number((p2p_v6_out_lag_avg / p2p_v6_out_lag_avg_num).toFixed(0));

  let p2p_max_num = 0;

  for (let i = 0; i < chartdata.length; i++) {
    chartdata[i].push({
      name  : Date.now(),
      value : [Date.now(), p2p_num[i]],
    });
    chartdata[i] = limitDataPoints(chartdata[i]);
    if (i < 4) p2p_max_num += p2p_num[i];
    // if (i > 3 && i < 7 && p2p_max_lag_num < p2p_num[i]) p2p_max_lag_num = p2p_num[i];
    // if (i > 6 && p2p_v6_max_lag_num < p2p_num[i]) p2p_v6_max_lag_num = p2p_num[i];
  }

  charts[0].setOption({
    animation : false,
    yAxis     : {
      max : (p2p_max_num + 15),
      min : (p2p_max_num - p2p_max_num),
    },
    series: [
      {
        name  : 'v4接收數量',
        type  : "line",
        showSymbol : false,
        data  : chartdata[0],
        color : "rgb(84, 255, 0)",
      },
      {
        name  : 'v4發送數量',
        type  : "line",
        showSymbol : false,
        data  : chartdata[1],
        color : "rgb(18, 0, 255)",
      },
    ],
  });

  charts[1].setOption({
    animation : false,
    yAxis     : {
      max : (p2p_max_num + 15),
      min : (p2p_max_num - p2p_max_num),
    },
    series: [
      {
        name  : 'v6接收數量',
        type  : "line",
        showSymbol : false,
        data  : chartdata[2],
        color : "rgb(84, 255, 0)",
      },
      {
        name  : 'v6發送數量',
        type  : "line",
        showSymbol : false,
        data  : chartdata[3],
        color : "rgb(18, 0, 255)",
      },
    ],
  });

  charts[2].setOption({
    animation : false,
    // yAxis     : {
    //   max : (p2p_max_lag_num + (p2p_max_lag_num / 2)),
    //   min : (p2p_max_lag_num / 2),
    // },
    series: [
      {
        name  : 'v4伺服器平均',
        type  : "line",
        showSymbol : false,
        data  : chartdata[4],
        color : "rgb(234, 0, 255)",
      },
      {
        name  : 'v4接收平均',
        type  : "line",
        showSymbol : false,
        data  : chartdata[5],
        color : "rgb(84, 255, 0)",
      },
      {
        name  : 'v4發送平均',
        type  : "line",
        showSymbol : false,
        data  : chartdata[6],
        color : "rgb(18, 0, 255)",
      },
    ],
  });

  charts[3].setOption({
    animation : false,
    // yAxis     : {
    //   max : (p2p_v6_max_lag_num + (p2p_v6_max_lag_num / 2)),
    //   min : (p2p_v6_max_lag_num / 2),
    // },
    series: [
      {
        name  : 'v6伺服器平均',
        type  : "line",
        showSymbol : false,
        data  : chartdata[7],
        color : "rgb(234, 0, 255)",
      },
      {
        name  : 'v6接收平均',
        type  : "line",
        showSymbol : false,
        data  : chartdata[8],
        color : "rgb(84, 255, 0)",
      },
      {
        name  : 'v6發送平均',
        type  : "line",
        showSymbol : false,
        data  : chartdata[9],
        color : "rgb(18, 0, 255)",
      },
    ],
  });
});

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

setInterval(() => {
  local_time.textContent = formatTime(Date.now());
}, 0);