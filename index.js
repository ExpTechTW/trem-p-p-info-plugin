const config = require("../config/config");
const path = require("path");
const { ipcRenderer } = require("electron");

class Plugin {
  static instance = null;

  #ctx;
  #config;

  constructor(ctx) {
    if (Plugin.instance) return Plugin.instance;

    this.#ctx = ctx;
    this.name = "p-p-info";
    this.#config = null;
    this.config = {};
    this.logger = null;

    Plugin.instance = this;
  }

  static getInstance() {
    if (!Plugin.instance) throw new Error("Plugin not initialized");

    return Plugin.instance;
  }

  onLoad() {
    const { TREM, Logger, info, utils } = this.#ctx;

    const { CustomLogger } =
      require("../logger/logger").createCustomLogger(Logger);
    this.logger = new CustomLogger("p-p-info");

    const defaultDir = path.join(
      info.pluginDir,
      "./p-p-info/resource/default.yml"
    );
    const configDir = path.join(info.pluginDir, "./p-p-info/config.yml");

    this.#config = new config(this.name, this.logger, utils.fs, defaultDir, configDir);

    this.config = this.#config.getConfig(this.name);

    const event = (event, callback) => TREM.variable.events.on(event, callback);

    event("p2pinfo", (ans) => {
      // this.logger.info(ans);
      ipcRenderer.send("send-to-plugin-window", {
        windowId: this.name,
        channel: "p2pinfo",
        payload: ans,
      });
    });

    this.init();
    this.addClickEvent(info);
  }

  init() {
    const focusButton = document.querySelector("#focus");
    if (focusButton) {
      const button = document.createElement("div");
      button.id = "p-p-info";
      button.className = "nav-bar-location";
      button.title = "P2P 監控面板";
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed"><path d="M168-168q-29.7 0-50.85-21.15Q96-210.3 96-240v-552q0-29.7 21.15-50.85Q138.3-864 168-864h192q29.7 0 50.85 21.15Q432-821.7 432-792v192h-72v-72H168v312h264v120q0 29.7-21.15 50.85Q389.7-168 360-168H168Zm432 72q-29.7 0-50.85-21.15Q528-138.3 528-168v-192h72v72h192v-312H528v-120q0-29.7 21.15-50.85Q570.3-792 600-792h192q29.7 0 50.85 21.15Q864-749.7 864-720v552q0 29.7-21.15 50.85Q821.7-96 792-96H600ZM168-288v48h192v-48H168Zm432 72v48h192v-48H600ZM168-744h192v-48H168v48Zm432 72h192v-48H600v48ZM336.21-444q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm144 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5Zm144 0q-15.21 0-25.71-10.29t-10.5-25.5q0-15.21 10.29-25.71t25.5-10.5q15.21 0 25.71 10.29t10.5 25.5q0 15.21-10.29 25.71t-25.5 10.5ZM168-288v48-48Zm432 72v48-48ZM168-744v-48 48Zm432 72v-48 48Z"/></svg>`;
      focusButton.insertAdjacentElement("afterend", button);
    }
  }

  addClickEvent(info) {
    const button = document.querySelector("#p-p-info");
    button.addEventListener("click", () => {
      ipcRenderer.send("open-plugin-window", {
        pluginId: this.name,
        htmlPath: `${info.pluginDir}/p-p-info/web/index.html`,
        options: {
          minWidth: 400,
          minHeight: 300,
          height: 990,
          title: "P2P 監控面板",
        },
      });
    });
  }
}

module.exports = Plugin;
