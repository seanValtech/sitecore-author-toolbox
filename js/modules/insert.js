/* eslint-disable no-multi-assign */
/* eslint-disable max-params */
/* eslint no-console: ["error", { allow: ["warn", "error", "log", "info", "table", "time", "timeEnd"] }] */

import * as global from "./global.js";
import { getScItemData } from "./helpers.js";
import { replaceIcons } from "./experimentalui.js";

export { insertModal, insertPanel };

/**
 * Insert Panel HTML to be used with other features
 */
const insertPanel = () => {
  let htmlPanel = '<div id="scPanel"><div class="preload">' + global.svgAnimation + " </div></div>";
  document.querySelector("body") ? document.querySelector("body").insertAdjacentHTML("beforeend", htmlPanel) : false;
};

/**
 * Insert basic Insert Modal Window
 */
const insertModal = (storage, sitecoreItemID, scLanguage, scVersion, scItemName = "", mutationObserver = true) => {
  var ajax = new XMLHttpRequest();
  ajax.timeout = 7000;
  ajax.open("GET", "/sitecore/shell/default.aspx?xmlcontrol=Gallery.New&id=" + sitecoreItemID + "&la=" + scLanguage + "&vs=" + scVersion + "&db=master", true);
  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4 && ajax.status == "401") {
      let ScItem = getScItemData();
      let scModal = document.querySelector("#scModal");
      let menuTiles = '<div class="noResult">Your Sitecore session is expired, please reconnect.</div>';
      //prettier-ignore
      let htmlMenuInner = `<div class="header"><span class="title">Insert under ` + ScItem.name.toUppercase() + `</span> <span class="maximize"></span> <span class="close"></span></div><div class="main"> ` + menuTiles + ` </div><div class="preload"> ` + global.svgAnimation + `</div>`;
      let htmlMenu = `<div class="scOverlay"></div><div id="scModal">` + htmlMenuInner + `</div>`;

      scModal ? (scModal.innerHTML = htmlMenuInner) : document.querySelector("body").insertAdjacentHTML("beforeend", htmlMenu);
    } else if (ajax.readyState === 4 && ajax.status == "200") {
      let html = new DOMParser().parseFromString(ajax.responseText, "text/html");
      let jsonOptions = [];
      let ScItem = getScItemData();
      var count = 0;
      var table;
      let scModal = document.querySelector("#scModal");

      scModal ? (scModal.innerHTML = "Loading...") : false;

      html.querySelectorAll(".scScrollbox > .scMenuHeader, .scScrollbox > .scRibbonToolbarSmallButton").forEach((el) => {
        if (el.className == "scMenuHeader") {
          count = 0;
          if (el.innerText == "Insert a new subitem") {
            table = jsonOptions.subitems = [];
          } else if (el.innerText == "Insert a new sibling") {
            table = jsonOptions.siblings = [];
          }
        } else if (el.className == "scRibbonToolbarSmallButton") {
          table[count] = [];
          table[count].push(el.innerText);
          // eslint-disable-next-line newline-per-chained-call
          table[count].push(el.querySelector("img").getAttribute("src").replace("/temp//iconcache/", "/icon/").replace("16x16", "48x48"));
          table[count].push(el.getAttribute("onclick"));
          count++;
        }
      });

      //Add layers
      var menuTiles = "";
      //Item name
      scItemName != "" ? (ScItem.name = scItemName.toLowerCase()) : false;

      if (jsonOptions.subitems) {
        //If empty
        jsonOptions.subitems.length == 0
          ? (menuTiles = '<div class="scNoResult"><img src=" ' + global.iconForbidden + ' " style="width:128px; opacity:0.5;" /><br />Nothing to insert under "' + ScItem.name.capitalize() + '" node.</div>')
          : false;

        for (var options of jsonOptions.subitems) {
          let iconTemp = options[1].replace("/temp/iconcache/", "~/icon/");
          menuTiles += `<div class="item"><a href="#" class="scIconTextModal" onclick="insertPageClose(); ${options[2]}"><img loading="lazy" class="scIconModal" src="${iconTemp}" onerror="this.onerror=null;this.src='${global.iconDocument}'"/><br />${options[0]}</a></div>`;
        }
      }
      //prettier-ignore
      let htmlMenuInner = `<div class="header"><span class="title">Insert under ` + ScItem.name + `</span> <span class="maximize"></span> <span class="close"></span></div><div class="main">` + menuTiles + `</div><div class="preload">` + global.svgAnimation + `</div>`;
      let htmlMenu = `<div class="scOverlay"></div><div id="scModal">` + htmlMenuInner + `</div>`;

      scModal ? (scModal.innerHTML = htmlMenuInner) : document.querySelector("body").insertAdjacentHTML("beforeend", htmlMenu);

      //If storage.contrasted, we change icons
      replaceIcons(storage);

      //Section below will be executed on load only (true)
      if (mutationObserver) {
        //Observer on data-scitem change
        scModal = document.querySelector("#scModal");
        let observer = new MutationObserver((mutations) => {
          for (let mutation of mutations) {
            if (mutation.attributeName == "data-scitem" && mutation.target.dataset.scitem != "undefined" && mutation.target.dataset.scitem != null) {
              var scItem = mutation.target.dataset.scitem.replace(
                // eslint-disable-next-line prefer-named-capture-group
                /(.{8})(.{4})(.{4})(.{4})(.{12})/u,
                "$1-$2-$3-$4-$5"
              );
              var scItemName = mutation.target.dataset.scitemname;
              insertModal(storage, scItem, "en", "1", scItemName, false);
            }
          }
        });
        //Observer
        scModal
          ? observer.observe(scModal, {
              attributes: true,
              childList: false,
              characterData: false,
              subtree: false,
            })
          : false;
      }

      //Press escape
      document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
          document.querySelector(".scOverlay").setAttribute("style", "visibility: hidden");
          document.querySelector("#scModal").setAttribute("style", "opacity:0; visibility: hidden; top: calc(50% - 550px/2 - 10px)");
        }
      });

      //Clic close button
      document.querySelector("#scModal > .header > .close").addEventListener("click", () => {
        document.querySelector(".scOverlay").setAttribute("style", "visibility: hidden");
        document.querySelector("#scModal").setAttribute("style", "opacity:0; visibility: hidden; top: calc(50% - 550px/2 - 10px)");
      });
    }
  };
  sitecoreItemID ? ajax.send(null) : false;
};
