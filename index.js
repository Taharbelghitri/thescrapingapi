const axios = require("axios");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
// const url = new URL(
//   "https://egybest.movie/search?_token=VYoqDgSdi4v9xHrkrY8LvevebgxTqiPkpTX2Y1l0&q=so&v=0.0.12"
// );
// url.searchParams.delete("q");
// url.searchParams.append("q", "rome");

// console.log(url.href);

const scrapLinks = async ({ url, after, before }) => {
  let extractUrl = await axios.get(url).then((data) => {
    let link;
    Object.values(data).forEach((e) => {
      if (typeof e === "string") {
        e = e.split(after)[1];
        if (e) {
          e = e.split(before)[0];
          link = e;
        }
      }
    });
    return link;
  });

  return extractUrl;
};

const getVideoStreamLink = async (url) => {
  // get the movie url
  const movieUrl = await scrapLinks({
    url,
    after: '<a class="btn btn_dl g dl show_dl api" href="',
    before: '" style="',
  });
  //extract url
  const loaderUrl = await scrapLinks({
    url: movieUrl,
    after: 'class="video-js auto-size lazy" data-src="',
    before: '" allowfullscreen sandbox=',
  });

  //get the url of video page
  const sourcePageUrl = await scrapLinks({
    url: loaderUrl,
    after: '<iframe class="auto-size" src="',
    before: '" sandbox="allow-presentation',
  });

  const videoUrl = await scrapLinks({
    url: sourcePageUrl,
    after: ' sources: [{file:"',
    before: '",label:',
  });
  return videoUrl;
};

// (async () => {
//   console.log(
//     await getVideoStreamLink(
//       // "https://egybest.movie/series/peaky-blinders/season/4/episode/3"
//       "https://egybest.movie/movies/%D9%85%D8%B4%D8%A7%D9%87%D8%AF%D8%A9-%D9%81%D9%8A%D9%84%D9%85-redeeming-love-2022-%D9%85%D8%AA%D8%B1%D8%AC%D9%85"
//     )
//   );
// })();
app.get("/:id", async (req, res) => {
  const response = await getVideoStreamLink(
    "https://egybest.movie/movies/" + encodeURI(req.params.id)
  );
  console.log(response);
  res.send(response);
});

app.listen(5000 || process.env.PORT);
