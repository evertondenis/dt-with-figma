/* generate bundle browserify main.js -o bundle.js */

const getJSONBtn = document.getElementById("get-json-btn");
const loaderDiv = document.querySelector(".btn-loading");

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function getColors(stylesArtboard) {
  // empty "colors obj" wheree we will store all colors
  const colors = {};
  // get "colors" artboard
  const colorsAtrboard = stylesArtboard.filter((item) => {
    return item.name === "colors";
  })[0].children;

  // get colors from each children
  colorsAtrboard.map((item) => {
    function rbaObj(obj) {
      return Math.round(item.fills[0].color[obj] * 255);
    }

    colorObj = {
      [item.name]: {
        value: `rgba(${rbaObj("r")}, ${rbaObj("g")}, ${rbaObj("b")}, ${
          item.fills[0].color.a
        })`,
        type: "color",
      },
    };

    Object.assign(colors, colorObj);
  });

  return colors;
}

function getGrids(stylesArtboard) {
  // empty "grids obj" wheree we will store all colors
  const grids = {};
  // get "grids" artboard
  const gridsAtrboard = stylesArtboard.filter((item) => {
    return item.name === "grids";
  })[0].children;

  gridsAtrboard.map((item) => {
    const gridObj = {
      [item.name]: {
        count: {
          value: item.layoutGrids[0].count,
          type: "grids",
        },
        gutter: {
          value: `${item.layoutGrids[0].gutterSize}px`,
          type: "grids",
        },
        offset: {
          value: `${item.layoutGrids[0].offset}px`,
          type: "grids",
        },
        width: {
          value: `${item.absoluteBoundingBox.width}px`,
          type: "grids",
        },
      },
    };

    Object.assign(grids, gridObj);
  });

  return grids;
}

function getSpacers(stylesArtboard) {
  // empty "spacers obj" wheree we will store all colors
  const spacers = {};
  // get "spacers" artboard
  const spacersAtrboard = stylesArtboard.filter((item) => {
    return item.name === "spacers";
  })[0].children;

  spacersAtrboard.map((item) => {
    const spacerObj = {
      [item.name]: {
        value: `${item.absoluteBoundingBox.height}px`,
        type: "spacers",
      },
    };

    Object.assign(spacers, spacerObj);
  });

  return spacers;
}

function getFontStyles(stylesArtboard) {
  // empty "spacers obj" wheree we will store all colors
  const fontStyles = {};
  // get "spacers" artboard
  const fontStylesAtrboard = stylesArtboard.filter((item) => {
    return item.name === "typography";
  })[0].children;

  fontStylesAtrboard.map((fontItem, i) => {
    if (fontItem.children) {
      let subFonts = {};

      // get all sub fonts
      fontItem.children.map((subFontItem) => {
        let subFontObj = {
          [subFontItem.name]: {
            family: {
              value: `${subFontItem.style.fontFamily}`,
              type: "typography",
            },
            size: {
              value: `${subFontItem.style.fontSize}px`,
              type: "typography",
            },
            weight: {
              value: subFontItem.style.fontWeight,
              type: "typography",
            },
            lineheight: {
              value: `${subFontItem.style.lineHeightPercent}%`,
              type: "typography",
            },
            spacing: {
              value:
                subFontItem.style.letterSpacing !== 0
                  ? `${Math.floor(subFontItem.style.letterSpacing)}px`
                  : "normal",
              type: "typography",
            },
          },
        };
        // merge multiple subfonts objects into one
        Object.assign(subFonts, subFontObj);
      });

      //
      let fontObj = {
        [fontItem.name]: subFonts,
      };

      Object.assign(fontStyles, fontObj);
    } else {
      let fontObj = {
        [fontItem.name]: {
          family: {
            value: `${fontItem.style.fontFamily}, ${fontItem.style.fontPostScriptName}`,
            type: "typography",
          },
          size: {
            value: fontItem.style.fontSize,
            type: "typography",
          },
          weight: {
            value: fontItem.style.fontWeight,
            type: "typography",
          },
          lineheight: {
            value: `${fontItem.style.lineHeightPercent}%`,
            type: "typography",
          },
          spacing: {
            value:
              fontItem.style.letterSpacing !== 0
                ? `${fontItem.style.letterSpacing}px`
                : "normal",
            type: "typography",
          },
        },
      };

      Object.assign(fontStyles, fontObj);
    }
  });

  return fontStyles;
}

// main function
async function getStylesArtboard(figmaApiKey, figmaId) {
  const result = await fetch("https://api.figma.com/v1/files/" + figmaId, {
    method: "GET",
    headers: {
      "X-Figma-Token": figmaApiKey,
    },
  });
  const figmaTreeStructure = await result.json();

  const stylesArtboard = figmaTreeStructure.document.children.filter((item) => {
    return item.name === "styles";
  })[0].children;

  baseTokeensJSON = {
    token: {
      grids: {},
      spacers: {},
      colors: {},
      fonts: {},
    },
  };

  Object.assign(baseTokeensJSON.token.grids, getGrids(stylesArtboard));
  Object.assign(baseTokeensJSON.token.spacers, getSpacers(stylesArtboard));
  Object.assign(baseTokeensJSON.token.colors, getColors(stylesArtboard));
  Object.assign(baseTokeensJSON.token.fonts, getFontStyles(stylesArtboard));

  loaderDiv.classList.add("btn-loading-hide");
  download(
    JSON.stringify(baseTokeensJSON, null, 4),
    "base.json",
    "application/json"
  );
}

getJSONBtn.onclick = function () {
  loaderDiv.classList.remove("btn-loading-hide");
  getStylesArtboard(
    "50903-fd0d353b-c78b-4ab9-abff-135a638c986c",
    "I2JrOVreBMJjEQJAkUKTA1"
  );
};
