import axios from "axios";
import store from "../reducers";
import { dfApps } from "../utils";
import { gene_name } from "../utils/apps";

export const dispatchAction = (event) => {
  const action = {
    type: event.target.dataset.action,
    payload: event.target.dataset.payload,
  };

  if (action.type) {
    store.dispatch(action);
  }
};

export const refresh = (pl, menu) => {
  if (menu.menus.desk[0].opts[4].check) {
    store.dispatch({ type: "DESKHIDE" });
    setTimeout(() => store.dispatch({ type: "DESKSHOW" }), 100);
  }
};

export const changeIconSize = (size, menu) => {
  var tmpMenu = { ...menu };
  tmpMenu.menus.desk[0].opts[0].dot = false;
  tmpMenu.menus.desk[0].opts[1].dot = false;
  tmpMenu.menus.desk[0].opts[2].dot = false;
  var isize = 1;

  if (size == "large") {
    tmpMenu.menus.desk[0].opts[0].dot = true;
    isize = 1.5;
  } else if (size == "medium") {
    tmpMenu.menus.desk[0].opts[1].dot = true;
    isize = 1.2;
  } else {
    tmpMenu.menus.desk[0].opts[2].dot = true;
  }

  refresh("", tmpMenu);
  store.dispatch({ type: "DESKSIZE", payload: isize });
  store.dispatch({ type: "MENUCHNG", payload: tmpMenu });
};

export const deskHide = (payload, menu) => {
  var tmpMenu = { ...menu };
  tmpMenu.menus.desk[0].opts[4].check ^= 1;

  store.dispatch({ type: "DESKTOGG" });
  store.dispatch({ type: "MENUCHNG", payload: tmpMenu });
};

export const changeSort = (sort, menu) => {
  var tmpMenu = { ...menu };
  tmpMenu.menus.desk[1].opts[0].dot = false;
  tmpMenu.menus.desk[1].opts[1].dot = false;
  tmpMenu.menus.desk[1].opts[2].dot = false;
  if (sort == "name") {
    tmpMenu.menus.desk[1].opts[0].dot = true;
  } else if (sort == "size") {
    tmpMenu.menus.desk[1].opts[1].dot = true;
  } else {
    tmpMenu.menus.desk[1].opts[2].dot = true;
  }

  refresh("", tmpMenu);
  store.dispatch({ type: "DESKSORT", payload: sort });
  store.dispatch({ type: "MENUCHNG", payload: tmpMenu });
};

export const changeTaskAlign = (align, menu) => {
  var tmpMenu = { ...menu };
  if (tmpMenu.menus.task[0].opts[align == "left" ? 0 : 1].dot) return;

  tmpMenu.menus.task[0].opts[0].dot = false;
  tmpMenu.menus.task[0].opts[1].dot = false;

  if (align == "left") {
    tmpMenu.menus.task[0].opts[0].dot = true;
  } else {
    tmpMenu.menus.task[0].opts[1].dot = true;
  }

  store.dispatch({ type: "TASKTOG" });
  store.dispatch({ type: "MENUCHNG", payload: tmpMenu });
};

export const performApp = (act, menu) => {
  var data = {
    type: menu.dataset.action,
    payload: menu.dataset.payload,
  };

  if (act == "open") {
    if (data.type) store.dispatch(data);
  } else if (act == "delshort") {
    if (data.type) {
      var apps = store.getState().apps;
      var app = Object.keys(apps).filter(
        (x) =>
          apps[x].action == data.type ||
          (apps[x].payload == data.payload && apps[x].payload != null)
      );

      app = apps[app];
      if (app) {
        store.dispatch({ type: "DESKREM", payload: app.name });
      }
    }
  }
};

export const delApp = (act, menu) => {
  var data = {
    type: menu.dataset.action,
    payload: menu.dataset.payload,
  };

  if (act == "delete") {
    if (data.type) {
      var apps = store.getState().apps;
      var app = Object.keys(apps).filter((x) => apps[x].action == data.type);
      if (app) {
        app = apps[app];
        if (app.pwa == true) {
          store.dispatch({ type: app.action, payload: "close" });
          store.dispatch({ type: "DELAPP", payload: app.icon });

          var installed = localStorage.getItem("installed");
          if (!installed) installed = `[{"name":"Visual Studio Code","icon":"https://raw.githubusercontent.com/one-loop/win11React/master/public/img/icon/code.png","type":"app","data":{"type":"IFrame","url":"https://github1s.com/one-loop/win11React","invert":true,"gallery":["https://code.visualstudio.com/assets/home/home-screenshot-win.png"],"desc":"Visual Studio Code is a free, lightweight, and extensible code editor for building web, desktop, and mobile applications, using any programming language and framework.\\nVisual Studio Code has built-in support for Git source control management and powerful integrations with GitHub, an integrated debugger, and smart code completion with IntelliSense and with Al-driven IntelliCode. With over 30,000 extensions and themes in the Visual Studio Code Marketplace, you can customize the features and the look of Visual Studio Code to fit your needs, preferences, and style.\\nYou can use Visual Studio Code to build any kind of app, for web, desktop, and mobile. Visual Studio Code supports JavaScript and TypeScript natively and offers extensions for coding in languages such as Python, Java, C/C++, C#, Go, Rust, PHP, and many more.","feat":"Fast, Powerful Editing-Linting, multi-cursor editing, parameter hints, and other powerful editing features.\\nOver 30,000 extensions, and growing - Enable additional languages, themes, debuggers, commands, and more. VS Code's growing community shares their secret sauce to improve your workflow.\\nBuild any app type, using any programming language and framework, including JavaScript and TypeScript, Python, Java, C/C++, C#, Go, Rust, PHP, and many more, as well as many popular technologies.\\nSupport for notebooks including Jupyter, for data science and Al development.\\nBuilt-in support for Git source control management and integrations with GitHub for managing issues and pull requests.\\nIntelligent Code Completion - IntelliSense and Al-driven IntelliCode offer completions for variables, methods, and imported modules.\\nRich Debugging-Print debugging is a thing of the past. Use debugging tools directly in VS Code.\\nWrite code from anywhere with the Visual Studio Code Remote extensions and support for GitHub Codespaces."},"pwa":true}]`;

          installed = JSON.parse(installed);
          installed = installed.filter((x) => x.icon != app.icon);
          localStorage.setItem("installed", JSON.stringify(installed));

          store.dispatch({ type: "DESKREM", payload: app.name });
        }
      }
    }
  }
};

export const installApp = (data) => {
  var app = { ...data, type: "app", pwa: true };

  var installed = localStorage.getItem("installed");
  if (!installed) installed = "[]";

  installed = JSON.parse(installed);
  installed.push(app);
  localStorage.setItem("installed", JSON.stringify(installed));

  var desk = localStorage.getItem("desktop");
  if (!desk) desk = dfApps.desktop;
  else desk = JSON.parse(desk);

  desk.push(app.name);
  localStorage.setItem("desktop", JSON.stringify(desk));

  app.action = gene_name();
  store.dispatch({ type: "ADDAPP", payload: app });
  store.dispatch({ type: "DESKADD", payload: app });
  store.dispatch({ type: "WNSTORE", payload: "mnmz" });
};

export const getTreeValue = (obj, path) => {
  if (path == null) return false;

  var tdir = { ...obj };
  path = path.split(".");
  for (var i = 0; i < path.length; i++) {
    tdir = tdir[path[i]];
  }

  return tdir;
};

export const changeTheme = () => {
  var thm = store.getState().setting.person.theme,
    thm = thm == "light" ? "dark" : "light";
  var icon = thm == "light" ? "sun" : "moon";

  document.body.dataset.theme = thm;
  store.dispatch({ type: "STNGTHEME", payload: thm });
  store.dispatch({ type: "PANETHEM", payload: icon });
  store.dispatch({ type: "WALLSET", payload: thm == "light" ? 0 : 1 });
};

const loadWidget = async () => {
  var tmpWdgt = {
      ...store.getState().widpane,
    },
    date = new Date();

  // console.log('fetching ON THIS DAY');
  var wikiurl = "https://en.wikipedia.org/api/rest_v1/feed/onthisday/events";
  await axios
    .get(`${wikiurl}/${date.getMonth()}/${date.getDay()}`)
    .then((res) => res.data)
    .then((data) => {
      var event = data.events[Math.floor(Math.random() * data.events.length)];
      date.setYear(event.year);

      tmpWdgt.data.date = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      tmpWdgt.data.event = event;
    })
    .catch((error) => {});

  // console.log('fetching NEWS');
  await axios
    .get("https://github.win11react.com/api-cache/news.json")
    .then((res) => res.data)
    .then((data) => {
      var newsList = [];
      data["articles"].forEach((e) => {
        e.title = e["title"].split(`-`).slice(0, -1).join(`-`).trim();
        newsList.push(e);
      });
      tmpWdgt.data.news = newsList;
    })
    .catch((error) => {});

  store.dispatch({
    type: "WIDGREST",
    payload: tmpWdgt,
  });
};

export const loadSettings = () => {
  var sett = localStorage.getItem("setting") || "{}";
  sett = JSON.parse(sett);

  if (sett.person == null) {
    sett = JSON.parse(JSON.stringify(store.getState().setting));
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      sett.person.theme = "dark";
    }
  }

  if (sett.person.theme != "light") changeTheme();

  store.dispatch({ type: "SETTLOAD", payload: sett });
  if (import.meta.env.MODE != "development") {
    loadWidget();
  }
};

// mostly file explorer
export const handleFileOpen = (id) => {
  // handle double click open
  const item = store.getState().files.data.getId(id);
  if (item != null) {
    if (item.type == "folder") {
      store.dispatch({ type: "FILEDIR", payload: item.id });
    }
  }
};
