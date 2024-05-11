// deno run --watch --allow-net --allow-read --allow-env server.ts
import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";
import { getinfo } from "./scripts/getinfo.ts";


Deno.serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  console.log(pathname);

  const sheet_id = Deno.env.get("SHEET_ID");
  const sheet_name = Deno.env.get("SHEET_NAME");
  const api_key = Deno.env.get("API_KEY");

  const json = fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${sheet_name}?key=${api_key}`,
  );

  let jsonData = await json.then((response) => {
    return response.json();
  });

  let values = jsonData.values;

  let players, gameinfos;
  [players, gameinfos] = getinfo(values);

  if (req.method === "GET" && pathname === "/gameinfos") {
    return new Response(JSON.stringify(gameinfos));
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
